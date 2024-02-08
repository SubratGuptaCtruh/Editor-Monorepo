import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import React, { useEffect, useRef } from "react";

interface HDRIPreviewInterface {
    url: string;
    className: string;
    onClick?: () => void;
}

const HDRICanvas: React.FC<HDRIPreviewInterface> = ({ url, className, onClick }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            // Babylon.js Scene
            const engine = new BABYLON.Engine(canvasRef.current, true, { preserveDrawingBuffer: true });
            const scene = new BABYLON.Scene(engine);

            // Set transparent background
            scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

            // Camera
            const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 5, BABYLON.Vector3.Zero(), scene);
            camera.attachControl(canvasRef.current, true);

            // Light
            const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
            light.intensity = 1.5;

            // Skybox
            const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
            const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
            skyboxMaterial.backFaceCulling = false;

            // const reflectionTexture = new BABYLON.HDRCubeTexture("https://ctruhblobstorage.blob.core.windows.net/user-def323c5-1f7b-42b8-9b9e-4a4818890935/bfd400c3-dde2-498f-ab2a-ff1074d4c451.hdr", scene, 128, false, true, false, true);
            skyboxMaterial.reflectionTexture = new BABYLON.HDRCubeTexture(url, scene, 128, false, true, false, true);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            skybox.material = skyboxMaterial;

            scene.registerBeforeRender(function () {
                skybox.rotation.y += 0.001;
            });

            // Render loop
            engine.runRenderLoop(() => {
                if (scene) {
                    scene.render();
                }
            });
            return () => {
                engine.dispose();
            };
        }
    }, [url]);

    return <canvas ref={canvasRef} className={className} onClick={onClick} />;
};

export default HDRICanvas;
