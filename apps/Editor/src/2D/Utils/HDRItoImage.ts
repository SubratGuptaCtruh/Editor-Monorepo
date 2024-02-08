import "@babylonjs/loaders/glTF";
import { v4 } from "uuid";
import { editor } from "../../3D/EditorLogic/editor";

export default function (url: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");

        const taskId = v4();
        // canvas.style.display = "none";
        const offscreenCanvas = canvas.transferControlToOffscreen();
        document.body.appendChild(canvas);

        const unsubsribe = editor.hdriToImageProcessor.onMessage((e) => {
            if (e.data.id === taskId) {
                const blobdata = e.data.hdri;
                if (blobdata) {
                    const blob = new Blob([blobdata], { type: "application/octet-stream" });
                    resolve(blob);
                    canvas.remove();
                } else {
                    reject("Something went wrong while taking screenshot");
                }
                unsubsribe();
            }
        });

        editor.hdriToImageProcessor.postMessage(
            {
                id: taskId,
                canvas: offscreenCanvas,
                hdri: url,
            },
            offscreenCanvas
        );
    });
}
