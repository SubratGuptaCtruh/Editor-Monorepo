import { v4 } from "uuid";
import { editor } from "../../3D/EditorLogic/editor";
import { getCurrentQueryParams } from "../../3D/EditorLogic/utils";

// function downloadBlob(blob: Blob, filename: string) {
//     const url = URL.createObjectURL(blob);

//     const link = document.createElement("a");
//     link.href = url;
//     link.download = filename;

//     // Visually indicate download to the user (optional)
//     link.style.display = "none"; // Hide the link element
//     document.body.appendChild(link); // Add it to the DOM
//     link.click();

//     document.body.removeChild(link); // Remove the link element
//     URL.revokeObjectURL(url); // Revoke the temporary URL
// }

type glbProcessOutputType = {
    image: Blob | null;
    model: Blob | null;
};

export default function (inputFile: File): Promise<glbProcessOutputType> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const taskId = v4();
        canvas.style.display = "none";
        document.body.append(canvas);

        const offscreenCanvas = canvas.transferControlToOffscreen();

        const output: glbProcessOutputType = {
            image: null,
            model: null,
        };

        editor.glbToImageProcessor.onMessage((e) => {
            if (e.data.id === taskId) {
                const blobdata = e.data.img;
                if (blobdata) {
                    const blob = new Blob([blobdata], { type: "application/octet-stream" });
                    output.image = blob;
                    canvas.remove();
                    if (output.model) {
                        resolve(output);
                    }
                } else {
                    reject("Something went wrong while taking screenshot");
                }
            }
        });

        editor.splitTextureProcessor.onMessage((e) => {
            if (e.data.id === taskId) {
                const blobdata = e.data.json;
                if (blobdata) {
                    const blob = new Blob([e.data.json], { type: "application/json" });
                    output.model = blob;

                    if (output.image) {
                        resolve(output);
                    }
                    return;
                }
                if (e.data.error) {
                    reject(e.data.error);
                }
            }
        });

        if (inputFile) {
            const file = inputFile;

            const blobUrl = URL.createObjectURL(file);

            editor.glbToImageProcessor.postMessage(
                {
                    id: taskId,
                    canvas: offscreenCanvas,
                    model: blobUrl,
                },
                offscreenCanvas
            );
            const blobUrlCopy = URL.createObjectURL(file);
            const { UID } = getCurrentQueryParams();
            editor.splitTextureProcessor.postMessage({
                id: taskId,
                name: file.name,
                payload: blobUrlCopy,
                userId: UID,
            });
        }
    });
}
