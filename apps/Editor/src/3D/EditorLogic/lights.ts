import {
    AbstractMesh,
    Color3,
    DirectionalLight,
    IShadowLight,
    Light,
    LinesMesh,
    MeshBuilder,
    PointLight,
    Scene,
    ShadowGenerator,
    SpotLight,
    StandardMaterial,
    Vector3,
    float,
} from "@babylonjs/core";
import { Editor, LightType, LightValueParms, MeshMetadata, MeshType } from "./editor";
import { addNamesWithIncrement, clampBetweenRange, convertToPercentage } from "./utils";

export class Shadow {
    private _shadowGen: ShadowGenerator | null = null;
    private editor: Editor;
    private maxNofShadows: number = 3;

    constructor(editor: Editor) {
        this.editor = editor;
    }
    /**
     * Generates a shadow map for the given light in the scene.
     *
     * @param light - The light to generate shadows for.
     * @param scene - The scene containing the light.
     */
    public generateShadow = (light: IShadowLight, scene: Scene) => {
        this._shadowGen = new ShadowGenerator(1024, light);
        this._shadowGen.bias = 0.001;
        this._shadowGen.setDarkness(0.2);
        this._shadowGen.enableSoftTransparentShadow = true;
        this._shadowGen.blurScale = 2;
        this._shadowGen.usePoissonSampling = true;
        this._shadowGen.useBlurCloseExponentialShadowMap = true;
        this._shadowGen.useKernelBlur = true;
        this._shadowGen.usePercentageCloserFiltering = true;
        scene.meshes.forEach((mesh) => {
            if (!this.shadowMeshValidator(mesh)) return;
            mesh.receiveShadows = true;
            if (mesh.material) {
                (mesh.material as StandardMaterial).maxSimultaneousLights = 10;
            }
            if (!this._shadowGen) return;
            this._shadowGen.addShadowCaster(mesh);
        });

        //by default toggle the shadow off
        this.toggleShadow(false);
    };

    /**
     * Toggles shadow casting for the given light.
     *
     * @param flag - True to enable shadow casting, false to disable.
     * @param light - The light to toggle shadow casting for.
     */
    public toggleShadow = (flag: boolean) => {
        // get the light
        if (!this.editor.selector.selected) return;
        const light = LightSystem.getLightFromLightMesh(this.editor.selector.selected!);
        if (!light) return;

        //sets the toggle for shadow
        light.shadowEnabled = flag;

        //save the value
        this.editor.save();
    };

    /**
     * Gets the current shadow enabled state for the given light.
     *
     * @param light - The light to get the shadow enabled state for.
     * @returns The current shadow enabled state for the given light.
     */
    public getShadowToggleState(light: IShadowLight) {
        return light.shadowEnabled;
    }

    /**
     * Checks if the maximum number of shadows has been reached for the given scene.
     *
     * Iterates through all lights in the scene and counts how many have shadows enabled.
     * Compares this to the maxNofShadows property.
     *
     * @param scene - The scene to check the shadow limit for.
     * @returns True if the max number of shadows has been reached, false otherwise.
     */
    public isShadowLimitReached() {
        const shadowCounter = this.getNoOfCurrentShadows();
        if (shadowCounter > this.maxNofShadows) return true;
        else return false;
    }

    public getNoOfCurrentShadows() {
        let shadowCounter = 0;
        this.editor.scene.lights.forEach((light) => {
            if (light.shadowEnabled) shadowCounter++;
        });
        return shadowCounter;
    }

    /**
     * Enables shadows for the given mesh.
     *
     * @param mesh - The mesh to enable shadows for.
     */
    public castShadowForMesh(mesh: AbstractMesh, scene: Scene) {
        //receive shadows for mesh
        mesh.receiveShadows = true;

        //cast shadows for mesh from all the lights
        scene.lights.forEach(function (light) {
            const shadowGenerator = light.getShadowGenerator() as ShadowGenerator | null;
            if (!shadowGenerator) return;
            if (shadowGenerator.addShadowCaster) {
                shadowGenerator.addShadowCaster(mesh);
            } else {
                console.error("Shadow generator does not exist for light :", light);
            }
        });
    }

    public removeShadowForMesh(mesh: AbstractMesh, scene: Scene) {
        //shadows for mesh from all the lights
        scene.lights.forEach(function (light) {
            const shadowGenerator = light.getShadowGenerator() as ShadowGenerator | null;
            if (!shadowGenerator) return;
            shadowGenerator.removeShadowCaster(mesh);
        });
    }

    /**
     * Sets the darkness value for the shadow generator of the given light.
     *
     * The darkness value controls the intensity of the shadows. It is clamped
     * to a 0-1 range before being set on the shadow generator.
     *
     * @param light - The light whose shadow darkness should be set
     * @param value - The darkness value to set, as a float from 0 to 1
     */
    public setDarkness(value: float) {
        // get the light
        const light = LightSystem.getLightFromLightMesh(this.editor.selector.selected!);
        if (!light) return;
        //get the shadow generator for the light
        const shadowGenerator = light.getShadowGenerator() as ShadowGenerator | null;
        if (!shadowGenerator) return 0;

        //convert the value to a 1-0 range : here values are reversed as 'opacity' works in an inverse way as 'darkness'
        value = clampBetweenRange(value, 1, 0);
        //set the darkness
        shadowGenerator.setDarkness(value);

        //save the value
        this.editor.save();
    }

    /**
     * Gets the darkness value for the shadow generator of the given light.
     *
     * The darkness value controls the intensity of the shadows. It is returned
     * as a percentage from 0 to 100 by converting the internal 0 to 1 range.
     *
     * @param light - The light whose shadow darkness should be got
     * @returns The shadow darkness as a percentage from 0 to 100
     */
    public getDarkness() {
        // get the light
        const light = LightSystem.getLightFromLightMesh(this.editor.selector.selected!);
        if (!light) return;
        //get the shadow generator for the light
        const shadowGenerator = light.getShadowGenerator() as ShadowGenerator | null;
        if (!shadowGenerator) return;

        //get the darkness value
        const value = shadowGenerator.getDarkness();

        //convert the darkness value to output range 0-100
        //convert the value from a 1-0 range : here values are reversed as 'opacity' works in an inverse way as 'darkness'
        return parseFloat(convertToPercentage(value, 1, 0).toFixed(0));
    }

    /**
     * Sets the blur scale for the shadow generator of the given light.
     *
     * The blur scale controls the softness of the shadows. It is clamped
     * to a 0-10 range before being set on the shadow generator.
     *
     * @param light - The light whose shadow blur scale should be set
     * @param value - The blur scale to set, as a float from 0 to 10
     */
    public setBlurScale(value: float) {
        // get the light
        if (!this.editor.selector.selected) return;
        const light = LightSystem.getLightFromLightMesh(this.editor.selector.selected);
        if (!light) return;
        //get the shadow generator for the light
        const shadowGenerator = light.getShadowGenerator() as ShadowGenerator | null;
        if (!shadowGenerator) return;

        //convert the value to a 0-10 range
        value = clampBetweenRange(value, 0, 10);
        //set the blur scale
        shadowGenerator.blurScale = value;

        //save the value
        this.editor.save();
    }

    /**
     * Gets the blur scale for the shadow generator of the given light.
     *
     * The blur scale controls the softness of the shadows. It is returned
     * as a percentage from 0 to 100 by converting the internal 0 to 10 range.
     *
     * @param light - The light whose shadow blur scale should be got
     * @returns The shadow blur scale as a percentage from 0 to 100
     */
    public getBlurScale() {
        // get the light
        if (!this.editor.selector.selected) return;
        const light = LightSystem.getLightFromLightMesh(this.editor.selector.selected);
        if (!light) return;
        //get the shadow generator for the light
        const shadowGenerator = light.getShadowGenerator() as ShadowGenerator | null;
        if (!shadowGenerator) return 0;

        //get the darkness value
        const value = shadowGenerator.blurScale;

        //convert the darkness value to output range 0-100
        return parseFloat(convertToPercentage(value, 0, 10).toFixed(0));
    }

    /**
     * Validates if a given mesh can cast shadows by checking
     * if its type is "Mesh".
     *
     * @param mesh - The mesh to validate
     * @returns True if the mesh type is "Mesh", false otherwise
     */
    private shadowMeshValidator = (mesh: AbstractMesh) => {
        //checks only if the type is mesh and then attaches it to the shadow validator
        if (!mesh.metadata) return false; //if metadata does not exist
        return (mesh.metadata as MeshMetadata<MeshType>).type === "Mesh" || (mesh.metadata as MeshMetadata<MeshType>).type === "Text";
    };
}

export class LightSystem {
    public editor: Editor;
    public shadows: Shadow;

    constructor(editor: Editor) {
        this.editor = editor;
        this.shadows = new Shadow(this.editor);
    }

    public static validateLightMesh = (lightMesh: AbstractMesh) => {
        const meshType = (lightMesh.metadata as MeshMetadata<MeshType>).type;
        if (!meshType.includes("Light")) throw Error(`provided mesh type is not Light it is ${meshType}`);
        const light = lightMesh.getChildren()[0];
        if (!(light instanceof Light)) throw Error("provided mesh dose not have a light");
        return {
            lightType: meshType as LightType,
        };
    };
    public static getLightFromLightMesh = (lightMesh: AbstractMesh) => {
        const light = lightMesh.getChildren()[0];

        if (light instanceof SpotLight || light instanceof PointLight || light instanceof DirectionalLight) {
            return light;
        } else {
            throw Error("provided mesh dose not have a suitable light type");
        }
    };
    private static _createPointLightHelper = (editor: Editor, pointLight: PointLight, id: string, scene: Scene) => {
        const helperMaterial = new StandardMaterial("sphereMaterial", scene);
        helperMaterial.emissiveColor = new Color3(1, 1, 0);
        helperMaterial.wireframe = true;
        const pointHelper = MeshBuilder.CreateIcoSphere(addNamesWithIncrement(editor, "Point Light") as string, { radius: 0.5, subdivisions: 1 }, scene);
        pointHelper.material = helperMaterial;
        pointLight.parent = pointHelper;
        pointHelper.id = id;
        pointHelper.material.alpha = 0.7;
        const metadata: MeshMetadata<"PointLight"> = {
            isroot: false,
            data: {
                name: "",
            },
            tags: [],
            allowedSelectionModes: ["position", null, null],
            type: "PointLight",
            meshType: null,
        };
        pointHelper.metadata = metadata;
        pointHelper.onDisposeObservable.add(() => {
            pointLight.dispose();
        });
        return pointHelper;
    };
    private static _createDirectionalLightHelper = (editor: Editor, dirLight: DirectionalLight, id: string, scene: Scene) => {
        const helperMaterial = new StandardMaterial("sphereMaterial", scene);
        helperMaterial.emissiveColor = new Color3(1, 1, 0);
        helperMaterial.wireframe = true;
        const directionHelper = MeshBuilder.CreatePlane(addNamesWithIncrement(editor, "Direction Light"), { width: 2, height: 2 }, scene);
        directionHelper.material = helperMaterial;
        directionHelper.id = id;
        dirLight.setDirectionToTarget(new Vector3(0, 0, 0));
        dirLight.parent = directionHelper;
        directionHelper.position = dirLight.position.clone();
        directionHelper.material.alpha = 0.7;
        const metadata: MeshMetadata<"DirectionLight"> = {
            isroot: false,
            data: {
                name: "",
            },
            tags: [],
            allowedSelectionModes: [null, "rotation", null],
            type: "DirectionLight",
            meshType: null,
        };
        directionHelper.metadata = metadata;
        directionHelper.onDisposeObservable.add(() => {
            dirLight?.dispose();
        });

        //initiate the directional light helper line
        const lineName = "lightDirectionLine";
        // Calculate end point of the line (light position + light direction)
        const endPoint = dirLight.direction;

        let line = MeshBuilder.CreateLines(lineName, { points: [directionHelper.position, endPoint], updatable: true }, scene);

        //CALCULATES THE LIGHT DIRECTION EACH FRAME
        scene.onAfterRenderObservable.add(() => {
            //gets the position of the light helper for each frame
            const directionHelperRefPosition = directionHelper.position.clone();
            //sets the direction of the light to the direction of the directional light helper pointing towards origin
            dirLight.direction = directionHelperRefPosition.normalize().scale(-1);

            //make helper look at origin ; TBD : make the plane as child object of helper so that the shadows are alligned
            const endPoint = dirLight.direction;
            //update the points of the line
            line = MeshBuilder.CreateLines(lineName, { points: [directionHelper.position, endPoint], instance: line as LinesMesh });
        });

        return directionHelper;
    };
    private static _createSpotLightHelper = (editor: Editor, spotLight: SpotLight, id: string, scene: Scene) => {
        const helperMaterial = new StandardMaterial("sphereMaterial", scene);
        helperMaterial.emissiveColor = new Color3(1, 1, 0);
        helperMaterial.wireframe = true;
        const spotLightHelper = MeshBuilder.CreateCylinder(
            addNamesWithIncrement(editor, "Spot Light"),
            {
                diameterTop: 0,
                diameterBottom: 1,
                height: 1,
                tessellation: 32,
            },
            scene
        );
        spotLightHelper.rotation.set(spotLight.getRotation().x, spotLight.getRotation().y, spotLight.getRotation().z);
        spotLightHelper.material = helperMaterial;
        spotLightHelper.position = spotLight.position.clone();
        spotLightHelper.id = id;
        spotLight.angle = 0.8;
        spotLight.parent = spotLightHelper;
        spotLightHelper.material.alpha = 0.7;
        const metadata: MeshMetadata<"SpotLight"> = {
            isroot: false,
            data: {
                name: "",
            },
            tags: [],
            allowedSelectionModes: ["position", "rotation", null],
            type: "SpotLight",
            meshType: null,
        };
        spotLightHelper.metadata = metadata;
        spotLightHelper.onDisposeObservable.add(() => {
            spotLight.dispose();
        });
        return spotLightHelper;
    };
    /**
     * Calculates the direction of each directional light in the scene by getting
     * the position of its parent light mesh and normalizing the vector to the origin.
     * This is called each frame to update the light direction.
     */
    public calculateLightDirection = (scene: Scene) => {
        scene.lights.forEach((light) => {
            if (light instanceof DirectionalLight) {
                //gets the directional lights in the scene
                const lightMesh = light.parent as AbstractMesh;

                //initiate the directional light helper line
                const lineName = "lightDirectionLine";
                let line = scene.getMeshByName(lineName);

                //CALCULATES THE LIGHT DIRECTION EACH FRAME
                scene.onBeforeRenderObservable.add(() => {
                    //gets the position of the light helper for each frame
                    const directionHelperRefPosition = lightMesh.position.clone();
                    //sets the direction of the light to the direction of the directional light helper pointing towards origin
                    light.direction = directionHelperRefPosition.normalize().scale(-1);

                    //make helper look at origin ; TBD : make the plane as child object of helper so that the shadows are alligned
                    const endPoint = light.direction;
                    //update the points of the line
                    if (!line) return;
                    line = MeshBuilder.CreateLines(lineName, { points: [lightMesh.position, endPoint], instance: line as LinesMesh });
                });
            }
        });
    };

    public createLight = (lightParams: LightValueParms, id: string) => {
        this.editor.afterLoad((scene) => {
            let dirLight: DirectionalLight;
            let directionHelper, spotlightHelper, pointLightHelper: AbstractMesh;
            let pointlight: PointLight;
            let spotLight: SpotLight;
            switch (lightParams.type) {
                case "DirectionalLight":
                    dirLight = new DirectionalLight("directionalLight", lightParams.direction, scene);
                    dirLight.diffuse = Color3.FromHexString(lightParams.hexColor);
                    dirLight.intensity = lightParams.intensity;
                    dirLight.position = lightParams.position;
                    dirLight.shadowEnabled = true;
                    directionHelper = LightSystem._createDirectionalLightHelper(this.editor, dirLight, id, scene);
                    this.editor.selector.select(directionHelper);
                    this.shadows.generateShadow(dirLight, scene);
                    break;
                case "PointLight":
                    pointlight = new PointLight("pointLight", lightParams.position, scene);
                    pointlight.diffuse = Color3.FromHexString(lightParams.hexColor);
                    pointlight.intensity = lightParams.intensity;
                    pointlight.shadowEnabled = true;
                    pointLightHelper = LightSystem._createPointLightHelper(this.editor, pointlight, id, scene);
                    this.editor.selector.select(pointLightHelper);
                    this.shadows.generateShadow(pointlight, scene);
                    break;
                case "SpotLight":
                    spotLight = new SpotLight("spotLight", lightParams.position, lightParams.direction, 0.8, 2, scene);
                    spotLight.diffuse = Color3.FromHexString(lightParams.hexColor);
                    spotLight.range = 1000;
                    spotLight.shadowEnabled = true;
                    spotLight.intensity = lightParams.intensity;
                    spotlightHelper = LightSystem._createSpotLightHelper(this.editor, spotLight, id, scene);
                    this.editor.selector.select(spotlightHelper);
                    this.shadows.generateShadow(spotLight, scene);
                    break;
                default:
                    break;
            }
            this.editor.UIeventEmitter.emit("sceneGraphChange", () => {});
        });
    };
    public static setLightColor = (lightMesh: AbstractMesh, color: string) => {
        LightSystem.validateLightMesh(lightMesh);
        LightSystem.getLightFromLightMesh(lightMesh).diffuse = Color3.FromHexString(color);
    };
    public static setLightIntensity(LightMesh: AbstractMesh, intensity: number): void {
        LightSystem.validateLightMesh(LightMesh);
        LightSystem.getLightFromLightMesh(LightMesh).intensity = intensity;
    }

    public static getLightColor = (lightMesh: AbstractMesh) => {
        const light = lightMesh.getChildren()[0];

        if (light instanceof SpotLight || light instanceof PointLight || light instanceof DirectionalLight) {
            return light.diffuse.toHexString();
        } else {
            throw Error("provided mesh dose not have a suitable light type");
        }
    };
}
