import { WebIO } from "@gltf-transform/core";
import { EXTTextureWebP, KHRONOS_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";

draco3d.createDecoderModule().then((decoder) => {
    draco3d.createEncoderModule().then((encoder) => {
        const io = new WebIO().registerExtensions([...KHRONOS_EXTENSIONS, EXTTextureWebP]).registerDependencies({
            "draco3d.decoder": decoder,
            "draco3d.encoder": encoder,
        });

        function removeExtension(filename: string) {
            // Find the last occurrence of '.' in the filename
            const lastDotIndex = filename.lastIndexOf(".");
            // If a dot is found and it is not the first character in the filename
            if (lastDotIndex !== -1 && lastDotIndex !== 0) {
                // Return the string without the extension
                return filename.slice(0, lastDotIndex);
            } else {
                // Return the original filename if no dot is found or if it's the first character
                return filename;
            }
        }

        function uint8ArrayToDataURL(uint8Array: Uint8Array, mimeType: string) {
            // Convert the Uint8Array to a binary string
            let binaryString = "";
            for (let i = 0; i < uint8Array.length; i++) {
                binaryString += String.fromCharCode(uint8Array[i]);
            }

            // Encode the binary string to base64
            const base64String = btoa(binaryString);

            // Create and return the Data URL
            return `data:${mimeType};base64,${base64String}`;
        }

        const getImgExt = (data: Uint8Array): string => {
            const header = data.subarray(0, 2);
            const webpHeaderRIFFChars = data.subarray(0, 4);
            const webpHeaderWEBPChars = data.subarray(8, 12);
            const extensionLookup = new Map<string, string>([
                [[0x42, 0x4d].toString(), "bmp"],
                [[0x47, 0x49].toString(), "gif"],
                [[0xff, 0xd8].toString(), "jpg"],
                [[0x89, 0x50].toString(), "png"],
                [[0xab, 0x4b].toString(), "ktx2"],
                [[0x73, 0x42].toString(), "basis"],
            ]);
            const ext = extensionLookup.get([header[0], header[1]].toString());
            if (ext) {
                return ext;
            } else if (
                webpHeaderRIFFChars.every((value, index) => value === [0x52, 0x49, 0x46, 0x46][index]) &&
                webpHeaderWEBPChars.every((value, index) => value === [0x57, 0x45, 0x42, 0x50][index])
            ) {
                return ".webp";
            } else {
                throw new Error("Image data does not have a valid header");
            }
        };

        const transformGlb = async (id: string, name: string, blob: string, userId: string) => {
            const doc = await io.read(blob);

            doc.createExtension(EXTTextureWebP).setRequired(true);

            const { json, resources } = await io.writeJSON(doc);

            const buffers = json.buffers;

            buffers?.forEach((buffer) => {
                if (buffer.uri) {
                    const bufferData = resources[buffer.uri];
                    const url = uint8ArrayToDataURL(bufferData, "application/octet-stream");
                    buffer.uri = url;
                    delete resources[buffer.uri];
                }
            });

            const images = json.images;

            images?.forEach((image, i) => {
                if (image.uri) {
                    const baseUrl = "https://ctruhblobstorage.blob.core.windows.net/editor/";
                    const url = new URL(baseUrl);
                    const extension = (() => {
                        const texture = resources[image.uri];
                        if (texture) {
                            return getImgExt(texture);
                        } else {
                            throw new Error("Image data does not have valid header");
                        }
                    })();
                    delete resources[image.uri];
                    const imageName = image.name ? image.name : `image${i}`;

                    const fileName = removeExtension(name).toLowerCase();
                    url.pathname += `user-${userId}/models/${fileName}/split/${imageName}.${extension}`;
                    image.uri = url.href;
                }
            });

            const jsonFile = JSON.stringify(json);

            self.postMessage({ glb: null, id, name, json: jsonFile });
        };
        self.addEventListener("message", async (e) => {
            const data = e.data;

            const { name, payload, id, userId } = data;

            try {
                transformGlb(id, name, payload, userId);
            } catch (error) {
                self.postMessage({ id, name, error: "Somthing went wrong while pre-processing the glb file." });
            }
        });
    });
});
