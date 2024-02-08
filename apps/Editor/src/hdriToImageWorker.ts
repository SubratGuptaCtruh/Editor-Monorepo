import * as BABYLON from "@babylonjs/core";

self.addEventListener("message", (e) => {
    const data = e.data;

    const canvas = data.canvas;
    const url = data.hdri;
    console.log(url, "HDRHERE??????????");
    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const createScene = () => {
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.02, 1.0);
        // Camera
        const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 5, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        // Light
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 1.5;
        // Skybox
        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;

        skyboxMaterial.reflectionTexture = new BABYLON.HDRCubeTexture(url, scene, 128, false, true, false, true);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        scene.executeWhenReady(async () => {
            BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, 400, function (imageData) {
                const byteString = atob(imageData.split(",")[1]);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                self.postMessage({
                    id: data.id,
                    hdri: ia,
                });

                scene.dispose();
                engine.dispose();
            });
        });
        return scene;
    };
    const scene = createScene();
    engine.runRenderLoop(() => {
        scene.render();
    });
});
