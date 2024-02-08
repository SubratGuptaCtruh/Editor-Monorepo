import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { fitMeshInBox } from "./3D/EditorLogic/utils";

const addModelToSceneWithinBound = (glbRoot: BABYLON.AbstractMesh, bound: BABYLON.AbstractMesh) => {
    glbRoot.isVisible = false;
    console.log("MESH SCALER : addModelToScene", bound);
    fitMeshInBox(glbRoot, bound);
    glbRoot.isVisible = true;
};

self.addEventListener("message", async (e) => {
    const data = e.data;

    const canvas = data.canvas;
    const modelData = data.model;

    const engine = new BABYLON.Engine(canvas);

    const createScene = () => {
        const scene = new BABYLON.Scene(engine);
        const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 2, 2), scene);

        // This targets the camera to scene origin
        camera.setTarget(new BABYLON.Vector3(0, 1, 0));

        BABYLON.SceneLoader.ImportMesh(
            "",
            modelData,
            "",
            scene,
            async (meshes) => {
                const model = meshes[0];

                const box = BABYLON.MeshBuilder.CreateBox("bound", { size: 1 }, scene);
                box.position.y = 1;

                addModelToSceneWithinBound(model, box);

                box.dispose();

                const light = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(2, -3, -1), scene);

                light.position = new BABYLON.Vector3(-20, 20, 6);
                const generator = new BABYLON.ShadowGenerator(512, light);
                generator.useBlurExponentialShadowMap = true;
                generator.blurKernel = 32;
                const shadowMap = generator.getShadowMap();

                if (shadowMap) {
                    shadowMap.refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
                } else {
                    console.warn("Shadow map is not available.");
                }

                for (let i = 0; i < scene.meshes.length; i++) {
                    generator.addShadowCaster(scene.meshes[i]);
                }

                const helper = scene.createDefaultEnvironment({
                    groundShadowLevel: 0.4,
                });

                const hexColor = "#ff898a";

                // Remove the '#' character from the hex color string
                const hexValue = hexColor.substring(1);

                // Extract red, green, and blue components
                const r = parseInt(hexValue.substring(0, 2), 16) / 255;
                const g = parseInt(hexValue.substring(2, 4), 16) / 255;
                const b = parseInt(hexValue.substring(4, 6), 16) / 255;

                helper?.setMainColor(new BABYLON.Color3(r, g, b));

                scene.executeWhenReady(() => {
                    BABYLON.Tools.CreateScreenshotUsingRenderTarget(
                        engine,
                        scene.activeCamera!,
                        {
                            width: 600,
                            height: 400,
                        },
                        function (imageData) {
                            const byteString = atob(imageData.split(",")[1]);
                            const ab = new ArrayBuffer(byteString.length);
                            const ia = new Uint8Array(ab);
                            for (let i = 0; i < byteString.length; i++) {
                                ia[i] = byteString.charCodeAt(i);
                            }
                            console.log(ia, "THREAD : SECONDARY");
                            self.postMessage({
                                id: data.id,
                                img: ia,
                            });
                            scene.dispose();
                            engine.dispose();
                        }
                    );
                });
            },
            null,
            () => {},
            ".glb"
        );

        return scene;
    };

    const scene = createScene();

    engine.runRenderLoop(() => {
        scene.render();
    });
    console.log(data, "THREAD : SECONDARY");
});
