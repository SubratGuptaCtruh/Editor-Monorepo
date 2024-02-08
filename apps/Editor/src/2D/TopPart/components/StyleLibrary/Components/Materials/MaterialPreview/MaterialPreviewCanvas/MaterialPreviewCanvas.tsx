import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import React, { useEffect, useRef } from "react";

interface HDRIPreviewInterface {
    url: string;
    className: string;
    toggle: boolean[];
}

const MaterialPreviewCanvas: React.FC<HDRIPreviewInterface> = ({ url, className, toggle }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            // Babylon.js Scene
            const engine = new BABYLON.Engine(canvasRef.current, true, { preserveDrawingBuffer: true });
            const scene = new BABYLON.Scene(engine);

            // Set transparent background
            scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

            // Setup environment
            const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 0.8, Math.PI / 2, 5, BABYLON.Vector3.Zero(), scene);
            camera.lowerBetaLimit = 0.1;
            camera.upperBetaLimit = (Math.PI / 2) * 0.9;
            camera.lowerRadiusLimit = 5; // Set both limits to the same value
            camera.upperRadiusLimit = 5; // This locks the zoom level
            camera.attachControl(canvasRef.current, true);

            const hemisphericLight = new BABYLON.HemisphericLight("hemisphericLight", new BABYLON.Vector3(0, 1, 0), scene);

            hemisphericLight.intensity = 1.6;

            const Material = new BABYLON.StandardMaterial("Material", scene);
            Material.diffuseTexture = new BABYLON.Texture(url, scene);
            Material.specularColor = new BABYLON.Color3(0, 0, 0);
            const cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 2 }, scene);
            const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2.5 }, scene);
            const torus = BABYLON.MeshBuilder.CreateTorus("t", { diameter: 2, thickness: 0.8 }, scene);

            // Set initial positions
            sphere.position.y = 0.2;
            cube.position.y = 0.2;
            torus.position.y = 0.2;

            cube.material = Material;
            sphere.material = Material;
            torus.material = Material;

            sphere.isVisible = toggle[0];
            cube.isVisible = toggle[1];
            torus.isVisible = toggle[2];

            // const myArray = [true, false, false];

            // cube.isVisible = myArray[0];
            // sphere.isVisible = myArray[1];
            // torus.isVisible = myArray[2];
            // let iterationCount = 0;

            // const toggleArrayValues = () => {
            //     const trueIndex = myArray.findIndex((value) => value === true);
            //     myArray[trueIndex] = false;

            //     const nextIndex = (trueIndex + 1) % myArray.length;
            //     myArray[nextIndex] = true;

            //     cube.isVisible = myArray[0];
            //     sphere.isVisible = myArray[1];
            //     torus.isVisible = myArray[2];

            //     console.log(`Iteration ${iterationCount + 1}:`, myArray);

            //     iterationCount++;

            //     // Reset the loop after the third index becomes true
            //     if (iterationCount === 3) {
            //         iterationCount = 0;
            //     }
            // };

            // // Set up the interval to call the toggle function every 2 seconds
            // const intervalId = setInterval(toggleArrayValues, 3000);

            // Render loop
            engine.runRenderLoop(() => {
                // Rotate all meshes
                sphere.rotation.x += 0.01;
                sphere.rotation.y += 0.01;
                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;
                torus.rotation.x += 0.01;
                torus.rotation.y += 0.01;
                if (scene) {
                    scene.render();
                }
            });
            return () => {
                engine.dispose();
            };
        }
    }, [url, toggle]);

    return <canvas ref={canvasRef} className={className} />;
};

export default MaterialPreviewCanvas;
