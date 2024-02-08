import { WebIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";
import { v4 } from "uuid";

const VERSION = "V1";

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

const io = new WebIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(), // Optional.
    "draco3d.encoder": await draco3d.createEncoderModule(), // Optional.
});

// Read from URL.
export const processGlb = async (blobUrl: string, name: string) => {
    const glbDocument = await io.read(blobUrl);
    if (glbDocument.getRoot().getExtras()?.UploadePreProcess === VERSION) {
        console.log(glbDocument.getRoot().listTextures(), "sdkh", name);
    }
    glbDocument
        .getRoot()
        .setExtras({ UploadePreProcess: VERSION })
        .listTextures()
        .forEach((texture) => {
            const uid = v4();
            console.log(texture.getName(), "TEXTURE NAMES");
            const ext = (() => {
                const image = texture.getImage();
                if (image) {
                    return getImgExt(image);
                } else {
                    throw new Error("Image data does not have valid header");
                }
            })();
            texture.setExtras({ name: texture.getName(), extension: ext });
            texture.setName(uid);
            const w = texture.getMimeType();
            console.log(w, "claj");
        });

    URL.revokeObjectURL(blobUrl);

    return new Blob([await io.writeBinary(glbDocument)]);
};
