import {
    AbstractMesh,
    ArcRotateCamera,
    BaseTexture,
    Camera,
    Color3,
    DefaultLoadingScreen,
    Engine,
    Matrix,
    Mesh,
    MeshBuilder,
    Node,
    Nullable,
    PBRMaterial,
    Quaternion,
    Scene,
    SceneLoader,
    SceneSerializer,
    SpotLight,
    StandardMaterial,
    Tags,
    Texture,
    Tools,
    TransformNode,
    UniversalCamera,
    UtilityLayerRenderer,
    Vector3,
} from "@babylonjs/core";

import "@babylonjs/core";
import "@babylonjs/loaders/OBJ";
import "@babylonjs/loaders/STL";
import "@babylonjs/loaders/glTF";
import { GLTF2Export } from "@babylonjs/serializers";
import { z } from "zod";
import { EventEmitter } from "./EventEmitter";
import { GetInterface } from "./GetInterface";
import { History } from "./History";
import { HotspotSystem } from "./HotspotSystem";
import { ScreenLoader } from "./ScreenLoader";
import { SelectionLayer } from "./SelectionLayer";
import { Storage as DBStorage } from "./Storage";
import { UpdateInterface } from "./UpdateInterface";
import { obj } from "./defualt";

import { LightSystem } from "./lights";
import { onResize } from "./resize";
import { DragMovments, Selector } from "./selector";
import {
    BOX_COLOR,
    PromiseTaskManager,
    TAGS,
    VALID_UID_SCENE_ID_PATHS,
    cloneNodeHierarchy,
    getCurrentQueryParams,
    getParent,
    getUrlPathName,
    handleUnsupportedFormat,
    overrideShowBoundingBoxForMesh,
    retry,
    zoomCameraToMesh,
} from "./utils";
// import { v4 as uuidv4 } from "uuid";
import GLBToImageWoker from "../../glbToImageWorker?worker";
import HDRIToImageWorker from "../../hdriToImageWorker?worker";
import SplitTextureWorker from "../../splitTextureWorker?worker";

import toast from "react-hot-toast";
import { getSceneDataFile, handleUploadModel, handleUploadSceneData } from "../../2D/APIs/actions";
import { createUI } from "../../main";
import { ThreeDText } from "./3Dtext";
import { AudioStateType, AudioSystem } from "./AudioSystem";
import { BackgroundSystem, DEFAULT_GRID_ID, backgroundStateType } from "./BackgroundSystem";
import { CameraSystem } from "./CameraSystem";
import { MeshScaler } from "./MeshScaler";
import { WebWorker } from "./WebWorker";
import { HoverInteraction } from "./hoverInteraction";

export type ableToRefresh = "TRUE" | "FALSE";
export type ResponseData = { LoadFrom: "IDB" | "DEFUALT" };

export type HotspotSettingsType = { focusLocked: boolean; fov: number; focusedTarget: null | string; mode: number; preview: boolean };
export type Exclude<T, U extends T[]> = T extends U[number] ? never : T;
type Pick<T, U extends T> = T extends U ? U : U;
type AllowedModes = [Pick<typeof Selector.modetype, "position"> | null, Pick<typeof Selector.modetype, "rotation"> | null, Pick<typeof Selector.modetype, "scale"> | null];

export type MeshTypeMap = {
    TransformNode: {
        name: "";
        isModelRoot?: boolean;
    };
    SpatialAudio: {
        audioName: string;
        audioUrl: string | null;
        volume: number;
        distance: number;
        playing?: Nullable<boolean>;
        loop?: Nullable<boolean>;
    };
    Camera: {
        name: string;
        settings: HotspotSettingsType;
    };
    Mesh: {
        name: "";
        isModelRoot?: boolean;
        colorHex: string | null;
        textureUrl: string | null;
    };
    DirectionLight: {
        name: "";
    };
    PointLight: {
        name: "";
    };
    SpotLight: {
        name: "";
    };
    Text: {
        uuid: string;
        textContent: string;
        font: {
            name: z.infer<typeof ThreeDText.allAvalibelFonts>;
            bold: boolean;
            Italic: boolean;
        };
    };
    Grid: {
        name: "";
        colorHex: string | null;
        isVisible: boolean;
    };
    Screen: {
        screenName: string;
        videoSources: string | null;
        imageSources: string | null;
        isBillboard: boolean | null;
        aspectRatio: string | "16:9";
        isPlaying: boolean | null;
        isLooping: boolean;
        volume: number;
        fileName: string | null;
    };
    Background: {
        name: "";
        ambientLight: number;
        colorHex: string | null;
        audioSources: string | null;
        volume: number;
        HDRUrl: string | null;
    };
    MultiSelectGroup: {
        name: "";
        selectedMesh: {
            mesh: AbstractMesh;
            uniqueId: number;
            prevParent: Node | undefined;
            prevParentUid: number | undefined;
        }[];
    };
};

export type MeshType = keyof MeshTypeMap;
export type LightMeshType = "SpotLight" | "PointLight" | "DirectionLight";

// function containsPublish(url: string) {
//     return url.toLowerCase().includes("publish");
// }

// TODO:fix this type

// export type LightMeshType = {
//     [Key in MeshType]: Key extends `${infer Key}Light` ? Key : never;
// }[MeshType];

type AllowedTags = "FocusTarget";
export type MeshMetadata<T extends MeshType> = {
    isroot: boolean;
    data: MeshTypeMap[T];
    type: T;
    tags: AllowedTags[];
    allowedSelectionModes: AllowedModes;
    meshType: string | null;
};
export type PossibelMeshMetadata = MeshMetadata<MeshType>;
export type Command = {
    id: string;
    execute: () => void;
    undo: () => void;
    type: string;
};
type Callback = (secen: Scene) => void;
type EditorEventMap = {
    afterLoad: [callback: Callback];
};
export type PrimitiveObjectType = "Cube" | "Cylinder" | "Sphere" | "Torus" | "Cone";
export type LightType = "DirectionalLight" | "PointLight" | "SpotLight";
type Alpha = {
    type: "alpha";
    value: number;
};
type Name = {
    type: "name";
    value: string;
};
type DiffuseColor = {
    type: "diffuseColor";
    value: Color3;
};
type DiffuseTexture = {
    type: "diffuseTexture";
    // for allowing texture url as null during material reset
    value: BaseTexture | null;
};
type MaterialPropertyTypes = Alpha | Name | DiffuseColor | DiffuseTexture;
type LightParams<LightType> = {
    type: LightType;
    intensity: number;
    position: Vector3;
    hexColor: string;
    direction: LightType extends "PointLight" ? null : Vector3;
};
export type LightValueParms = LightParams<"SpotLight"> | LightParams<"DirectionalLight"> | LightParams<"PointLight">;
/**
 * Link of the 3d model object.
 *
 * @typedef {Object} Link
 * @property {string} root - The root URL. Use an empty string if the filename contains the complete URL.
 * @property {string} fileName - The complete URL along with the name of the file.
 * @example AddGlbModelCommand(editor, files.name, { root: "", fileName: blobUrl });
 * @note import "@babylonjs/loaders/glTF" to support glb/gltf files
 */
export type Link = {
    root: string;
    fileName: string;
};
export type TransformObjectProps = {
    transform: "Scaling" | "Rotation" | "Position";
    value: Vector3;
};

type UIEventMap = {
    selectedChange: [callback: () => void];
    sceneGraphChange: [Callback: () => void];
    transformChange: [Nullable<AbstractMesh>];
    transformChangeEnd: [Nullable<AbstractMesh>];
    historyChange: [Callback: () => void];
    textChange: [void];
    textColorChange: [void];
    screenStateChanged: [id: string, data: MeshTypeMap["Screen"]];
    hotspotStateChanged: [id: string, data: HotspotSettingsType];
    previewCameraChanged: [id: string];
    syncState: [state: "IDLE" | "SYNCING" | "UNSYNCED"];
    backgroundStateChanged: [state: backgroundStateType];
    audioStateChanged: [id: string, state: AudioStateType];
};

// type cloundSyncType = "Textures" | "Models" | "Scene";

export class Editor {
    public static Instance: Editor;
    public canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    private _engine = new Engine(this.canvas, true);
    public scene = new Scene(this._engine);
    public eventEmitter = new EventEmitter<EditorEventMap>();
    public UIeventEmitter = new EventEmitter<UIEventMap>();
    public history: History = new History(this);
    public utilLayer = new UtilityLayerRenderer(this.scene);
    public selector = new Selector(this);
    public storage = new DBStorage();
    public update = new UpdateInterface(this);
    public dragMovments = new DragMovments(this);
    public originalCameraPosition = new Vector3();
    public originalCameraFov: number;
    public isInPreviewMode = false;
    public lightEmitter = new LightSystem(this);
    public screenLoader = new ScreenLoader(this);
    public hoverInteraction = new HoverInteraction();
    public BOX_RENDERER_NODE = new TransformNode("BOX_RENDERER_NODE", this.scene);
    public hotspotSystem = new HotspotSystem(this);
    public cameraSystem = new CameraSystem(this);
    public meshScaler: MeshScaler = new MeshScaler();
    public threeDtext: ThreeDText = new ThreeDText(this);
    public selectionLayer = new SelectionLayer(this);

    public backGroundSystem: Nullable<BackgroundSystem> = null;

    public audioSystem = new AudioSystem(this);

    private _ableToRefresh: ableToRefresh = "TRUE";

    public get ableToRefresh() {
        return this._ableToRefresh;
    }

    public set ableToRefresh(value: ableToRefresh) {
        if (value === "FALSE") {
            this.cloudSyncState = { Scene: false };
        }
        this._ableToRefresh = value;
    }

    private _cloudSyncState = {
        Textures: true,
        Models: true,
        Scene: true,
        finalState: "IDLE",
    };

    public get cloudSyncState() {
        return this._cloudSyncState;
    }

    public set cloudSyncState(newState: { [key: string]: boolean | string }) {
        const state = { ...this._cloudSyncState, ...newState };

        let syncedState = "IDLE";

        if (state.Textures === true && state.Models === true && state.Scene === true) {
            syncedState = "IDLE";
            this.UIeventEmitter.emit("syncState", "IDLE");
        }

        if (state.Textures === false && this._textureUploadManger.inProgress === true) {
            syncedState = "SYNCING";
            this.UIeventEmitter.emit("syncState", "SYNCING");
        } else {
            if (state.Models === true && state.Scene === true) {
                syncedState = "IDLE";
                this.UIeventEmitter.emit("syncState", "IDLE");
            } else {
                syncedState = "UNSYNCED";
                this.UIeventEmitter.emit("syncState", "UNSYNCED");
            }
        }

        if (state.Textures === true && state.Models === true && state.Scene === false) {
            syncedState = "UNSYNCED";
            this.UIeventEmitter.emit("syncState", "UNSYNCED");
        }
        state.finalState = syncedState;
        this._cloudSyncState = state;
    }

    public glbToImageProcessor = new WebWorker(GLBToImageWoker);
    public hdriToImageProcessor = new WebWorker(HDRIToImageWorker);
    public splitTextureProcessor = new WebWorker(SplitTextureWorker);

    private _textureUploadManger = new PromiseTaskManager();

    public get = new GetInterface(this);

    public isInPublishMode = false;

    constructor() {
        window.editor = this;
        Editor.Instance = this;

        window.addEventListener("resize", () => {
            onResize(this._engine);
            this.setCameraIcometricBounds(this.scene);
        });
        window.onbeforeunload = () => {
            if (this.ableToRefresh === "TRUE" && !this._textureUploadManger.inProgress) return null;
            return "jkn";
        };
        this.scene.onDisposeObservable.add(() =>
            window.removeEventListener("resize", () => {
                onResize(this._engine);
            })
        );
        this._engine.displayLoadingUI();

        if (Engine.audioEngine) {
            Engine.audioEngine.useCustomUnlockedButton = true;
        }

        this.originalCameraFov = 0;
        this._CreateScene().then((scene) => {
            if (scene === undefined) throw new Error("scene was not created");
            this._engine.hideLoadingUI();
            this.utilLayer = new UtilityLayerRenderer(scene);
            this.utilLayer.utilityLayerScene.autoClearDepthAndStencil = true;
            this.eventEmitter.on("afterLoad", (callback) => {
                callback(scene);
            });

            this._textureUploadManger.setOnWorkDoneCallback((status) => {
                if (status === "SUCCESSFUL") {
                    this.cloudSyncState = { Textures: true };
                } else {
                    toast.error("Error while syncing with cloud");
                    this.cloudSyncState = { Textures: false };
                }
            });

            window.addEventListener("cacheUpdated", (event) => {
                //@ts-expect-error : Custom event is being dispatched from babylon module
                const url = event.detail.url;

                caches.open("texturs").then((cache) => {
                    return cache.match(url, { ignoreVary: true }).then(async (response) => {
                        const blob = await response?.blob();
                        if (blob) {
                            const lastIndex = url.lastIndexOf("/");

                            const filename = url.substring(lastIndex + 1);

                            const fileOptions = { type: blob.type, lastModified: new Date().getTime() };

                            const file = new File([blob], filename, fileOptions);
                            const params = getCurrentQueryParams();

                            const modelsPosition = url.indexOf("models");
                            if (modelsPosition === -1) {
                                return "";
                            }

                            const pathAfterModels = url.substring(modelsPosition + 7);

                            const { UID } = params;
                            const uploadTexturesWithRetry = retry(handleUploadModel, 4, 500);
                            this.cloudSyncState = { Textures: false };
                            this._textureUploadManger.addTask(
                                () => uploadTexturesWithRetry(file, UID, url, pathAfterModels, true),
                                (result) => {
                                    console.log("Task resolved with result:", result);
                                },
                                (error) => {
                                    console.log("Task rejected with error:", error);
                                }
                            );
                        }
                    });
                });
            });

            scene.getBoundingBoxRenderer().frontColor = BOX_COLOR;
            scene.getBoundingBoxRenderer().backColor = BOX_COLOR;
            //camera clipping near set
            (scene.activeCamera as UniversalCamera).minZ = -1;
            this.UIeventEmitter.on("transformChangeEnd", (mesh) => {
                if (!mesh) return;
                const rootNode = getParent(mesh);
                if (!rootNode) return;
                if (rootNode.metadata?.data?.isModelRoot) {
                    //@ts-expect-error: adding custom property to babylon class to override default bounding box on root node of model to fix bounding box issue
                    rootNode.customBoundingBox = true;
                }
            });

            scene.meshes.forEach((mesh) => {
                if (Tags.HasTags(mesh) && Tags.MatchesQuery(mesh, TAGS.SCREEN)) {
                    this.screenLoader.mount(mesh);
                } else if (Tags.HasTags(mesh) && Tags.MatchesQuery(mesh, TAGS.HOTSPOT)) {
                    this.hotspotSystem.mount(mesh);
                } else if (Tags.HasTags(mesh) && Tags.MatchesQuery(mesh, TAGS.BACKGROUND)) {
                    this.backGroundSystem = new BackgroundSystem(this, mesh as Mesh);
                } else if (Tags.HasTags(mesh) && Tags.MatchesQuery(mesh, TAGS.SPATIALAUDIO)) {
                    this.audioSystem.mount(mesh);
                }
            });

            if (!this.backGroundSystem) {
                this.backGroundSystem = new BackgroundSystem(this, null);
            }

            (this.scene.activeCamera as UniversalCamera).speed = 1;
            (this.scene.activeCamera as UniversalCamera).inputs.addKeyboard();
            (this.scene.activeCamera as UniversalCamera).inputs.addMouse();
            (this.scene.activeCamera as UniversalCamera).angularSensibility = 12000;
            (this.scene.activeCamera as UniversalCamera).inertia = 0.97;
            this.cameraSystem.enableDolly();
            this.cameraSystem.enablePan();
            const delay = 300; // Milliseconds
            let lastClickTime = 0;
            let clickTimer: NodeJS.Timeout | null = null;

            scene.onPointerDown = () => {
                if (this.isInPublishMode) return;
                const ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), scene._activeCamera);
                const hit = scene.pickWithRay(ray);

                if (!hit?.pickedMesh) {
                    this.selectionLayer.dispose();
                    this.selector.deselect();
                    return;
                }

                const currentTime = new Date().getTime();
                if (currentTime - lastClickTime < delay) {
                    // Double click detected
                    if (clickTimer) {
                        clearTimeout(clickTimer); // Prevent single click action
                        clickTimer = null;
                    }
                    //Double Clicked
                    //this is only for hierarchy
                    const selectMesh = this.selectionLayer.doubleClick(hit.pickedMesh as AbstractMesh);
                    if (selectMesh && (selectMesh.metadata as MeshMetadata<MeshType>).type) this.selector.select(selectMesh as AbstractMesh);
                } else {
                    // Setup a timer for single click
                    clickTimer = setTimeout(() => {
                        //single Click
                        const selectMesh = this.selectionLayer.singleClick(hit.pickedMesh as AbstractMesh);
                        selectMesh && this.selector.select(selectMesh as AbstractMesh);
                    }, delay);
                }
                lastClickTime = currentTime;
            };

            scene.onPointerMove = () => {
                if (this.isInPublishMode) return;
                const ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), scene._activeCamera);
                const hit = scene.pickWithRay(ray);

                if (!hit?.pickedMesh) {
                    this.hoverInteraction.setHoveredMesh(null);
                    return;
                }
                this.hoverInteraction.setHoveredMesh(hit.pickedMesh);
            };
            // Inspector.Show(scene, {});
            this.GameLoop(this._engine, this.scene);
        });
    }

    public retryUploadingFailedTextures = (onWorkDoneCallback?: (state: "SUCCESSFUL" | "FAILED") => void) => {
        return this._textureUploadManger.retryFailedTasks(onWorkDoneCallback);
    };

    public displayLoadingUI = () => {
        this._engine.displayLoadingUI();
    };
    public hideLoadingUI = () => {
        this._engine.hideLoadingUI();
    };
    public setUpshortCuts = () => {
        document.addEventListener("keydown", (event) => {
            const isWindows = navigator.platform.includes("Win");
            const isMac = navigator.platform.includes("Mac");
            // Check for the specific key combinations
            if (isWindows) {
                if (event.ctrlKey && event.key.toLocaleLowerCase() === "z") {
                    this.undo();
                }
                if (event.ctrlKey && event.key.toLocaleLowerCase() === "y") {
                    this.redo();
                }
                if (event.ctrlKey && event.key.toLocaleLowerCase() === "s") {
                    this.save();
                }
            }
            if (isMac) {
                if (event.metaKey && event.key.toLocaleLowerCase() === "z") {
                    this.undo();
                }
                if (event.metaKey && event.shiftKey && event.key.toLocaleLowerCase() === "z") {
                    this.redo();
                }
                if (event.metaKey && event.key.toLocaleLowerCase() === "s") {
                    this.save();
                }
            }
        });
    };
    public setCameraFrustum = (camera: Camera, min: Vector3, max: Vector3) => {
        const aspect = this._engine.getRenderHeight() / this._engine.getRenderWidth();
        const aspectW = (max.y - min.y) / (max.x - min.x);

        const a = aspect / aspectW;

        camera.orthoLeft = a > 1 ? min.x : min.x / a;
        camera.orthoRight = a > 1 ? max.x : max.x / a;
        camera.orthoTop = a > 1 ? max.y * a : max.y;
        camera.orthoBottom = a > 1 ? min.y * a : min.y;
    };
    public static computeSceneBounds = (camera: Camera, scene: Scene) => {
        const min = new Vector3(Infinity, Infinity, Infinity);
        const max = new Vector3(-Infinity, -Infinity, -Infinity);

        const viewMatrix = camera.getViewMatrix(true);

        const tmp1 = new Vector3();
        const tmp2 = new Vector3();

        scene.meshes.forEach((m) => {
            m.refreshBoundingInfo();

            const bmin = m.getBoundingInfo().boundingBox.minimumWorld;
            const bmax = m.getBoundingInfo().boundingBox.maximumWorld;

            Vector3.TransformCoordinatesToRef(bmin, viewMatrix, tmp1);
            Vector3.TransformCoordinatesToRef(bmax, viewMatrix, tmp2);

            min.minimizeInPlace(tmp1);
            max.maximizeInPlace(tmp2);
        });
        // Make for a 8% margin to the scene extents
        min.scaleInPlace(1.08);
        max.scaleInPlace(1.08);
        return [min, max];
    };
    public setCameraIcometricBounds = (scene: Scene) => {
        if (scene._activeCamera) {
            const [min, max] = Editor.computeSceneBounds(scene._activeCamera, scene);
            this.setCameraFrustum(scene._activeCamera, min, max);
        }
    };
    public afterLoad = (func: Callback) => {
        this.eventEmitter.emit("afterLoad", func);
    };
    public executer = (command: Command) => {
        this.history.execute(command);
    };
    public undo = () => {
        this.history.undo();
        this.UIeventEmitter.emit("sceneGraphChange", () => {});
    };
    public redo = () => {
        this.history.redo();
        this.UIeventEmitter.emit("sceneGraphChange", () => {});
    };

    public save = (forceSave: boolean = false) => {
        Texture.SerializeBuffers = false;
        if (this.isInPublishMode) return;
        const params = getCurrentQueryParams();

        const { sceneID } = params;

        if (this.selector.selected && this.selector.selected.metadata && this.selector.selected.metadata.type) {
            if ((this.selector.selected.metadata.type as MeshType) === "MultiSelectGroup") return;
        }
        this.ableToRefresh = "FALSE";
        if (forceSave) {
            this.storage.set(sceneID, SceneSerializer.Serialize(this.scene)).then(() => {
                this.ableToRefresh = "TRUE";
            });
        } else {
            requestIdleCallback(() => {
                this.afterLoad((scene) => {
                    console.log(scene);
                    this.storage.set(sceneID, SceneSerializer.Serialize(scene)).then(() => {
                        this.ableToRefresh = "TRUE";
                    });
                });
            });
        }
    };
    private _CreateScene = async () => {
        const params = getCurrentQueryParams();
        let sceneData: unknown = obj; //default data
        const { UID, sceneID } = params;
        const pathname = getUrlPathName();
        if (VALID_UID_SCENE_ID_PATHS.includes(pathname) && (!UID || !sceneID)) throw Error("no UID and sceneID in url");
        const resData: unknown | undefined = (await getSceneDataFile(UID, sceneID, this.storage))?.data;
        if (!resData) throw Error("getSceneDataFile returned undifined");

        if (!(resData as ResponseData).LoadFrom) {
            sceneData = resData;
            this.storage.set(`${sceneID}`, sceneData);
        } else if ((resData as ResponseData).LoadFrom === "IDB") {
            sceneData = await this.storage.get(sceneID);
        }

        const scene = await SceneLoader.LoadAsync("scene", sceneData as unknown as string, this._engine);
        if (!scene._activeCamera) return;
        scene._activeCamera.minZ = 2;
        scene._activeCamera.attachControl(this._engine.getRenderingCanvas(), false);
        this.scene = scene;
        this.UIeventEmitter.emit("sceneGraphChange", () => {});

        //recalculate bounding box of root nodes
        editor.get.SceneGraph().forEach((node) => {
            if (node.type === "Mesh") {
                if (node?.ref?.ref?.metadata?.data?.isModelRoot) {
                    overrideShowBoundingBoxForMesh(node.ref.ref as Mesh, this.BOX_RENDERER_NODE, this.utilLayer);
                }
            }
        });

        //recalculate directions for the directional light
        this.lightEmitter.calculateLightDirection(scene);

        return scene; //scene
    };
    private GameLoop = (engine: Engine = this._engine, scene: Scene = this.scene) => {
        engine.runRenderLoop(() => {
            scene.render();
        });
    };
    public createLight = this.lightEmitter.createLight;

    public setLightHelperVisibility = (LightMesh: AbstractMesh, isVisible: boolean) => {
        LightSystem.validateLightMesh(LightMesh);
        this.afterLoad(() => {
            LightMesh.isVisible = isVisible;
        });
    };

    /**
     * Sets the pneumbra/ angle of a Spot Light.
     *
     * @param {AbstractMesh} LightMesh - The selected light mesh.
     * @param {number} angle - The new angle value to set for the Spot Light.
     */
    public setSpotLightAngle = (angle: number) => {
        if (!this.selector.selected) return;
        if (LightSystem.validateLightMesh(this.selector.selected).lightType === "SpotLight") {
            const spotLight = LightSystem.getLightFromLightMesh(this.selector.selected) as SpotLight;
            const radianAngle = (angle * Math.PI) / 180;
            spotLight.angle = radianAngle;
        }
    };
    public addPrimitiveObjects = (type: PrimitiveObjectType, name: string, id: string, initialPos?: Vector3) => {
        let primitive: AbstractMesh;

        const metadata: MeshMetadata<"Mesh"> = {
            isroot: false,
            data: {
                name: "",
                colorHex: "#FFFFFF",
                textureUrl: null,
            },
            tags: ["FocusTarget"],
            allowedSelectionModes: ["position", "rotation", "scale"],
            type: "Mesh",
            meshType: null,
        };
        this.afterLoad((scene) => {
            switch (type) {
                case "Cube":
                    primitive = MeshBuilder.CreateBox("cube", { size: 3 }, scene);
                    primitive;
                    break;
                case "Cylinder":
                    primitive = MeshBuilder.CreateCylinder("cylinder", { height: 6, diameter: 3, tessellation: 32 }, scene);
                    break;
                case "Sphere":
                    primitive = MeshBuilder.CreateSphere("sphere", { segments: 32, diameter: 3 }, scene);
                    break;
                case "Torus":
                    primitive = MeshBuilder.CreateTorus("torus", { diameter: 3, thickness: 0.5, tessellation: 32 }, scene);
                    break;
                case "Cone":
                    primitive = MeshBuilder.CreateCylinder("cone", { height: 6, diameterTop: 0, diameterBottom: 3, tessellation: 32 }, scene);
                    break;
                default:
                    console.error(`Primitive shape '${type}' not recognized.`);
                    break;
            }
            primitive.position = initialPos || new Vector3(0, 0, 0);
            primitive.id = id;
            primitive.name = name;
            primitive.material = new StandardMaterial(name, scene);
            primitive.metadata = metadata;
            (primitive.material as StandardMaterial).maxSimultaneousLights = 10;
            if (primitive.metadata) {
                primitive.metadata.meshType = type;
            }
            this.lightEmitter.shadows.castShadowForMesh(primitive, scene);
            this.UIeventEmitter.emit("sceneGraphChange", () => {});
            this.selector.select(primitive);
        });
    };

    public lockCameraTarget = (selectedMesh: AbstractMesh, focusMesh: AbstractMesh) => {
        this.afterLoad((scene) => {
            if (selectedMesh.metadata.type === "Camera") {
                const camera = new ArcRotateCamera("camera", 0, 0, 10, new Vector3(0, 0, 0), scene);
                camera.setTarget(focusMesh);
                if (!camera) return;
                selectedMesh.setParent(camera);
            }
        });
    };

    //Addition and updating video / Image screen oriention and aspect ratio
    public addScreens = this.screenLoader.addVideoImageScreens;
    public updateScreen = this.screenLoader.updateScreenResolution;

    public addDuplicateObjects = (selectedMesh: AbstractMesh, name: string, id: string) => {
        this.afterLoad(() => {
            const duplicatedObject = cloneNodeHierarchy(selectedMesh, selectedMesh.parent, name);

            if (!duplicatedObject) return;

            duplicatedObject.id = id;
            duplicatedObject.getChildMeshes().forEach((child) => {
                this.lightEmitter.shadows.castShadowForMesh(child, this.scene);
            });
            this.UIeventEmitter.emit("sceneGraphChange", () => {});
        });
    };
    /**
     * Toggles the visibility of the selected mesh in the editor.
     *
     * If a mesh is selected and it is currently hidden, this function makes it visible.
     * If a mesh is selected and it is currently visible, this function hides it and deselects it.
     *
     * @returns {void}
     *
     * @example
     * // Toggle the visibility of the selected mesh
     * handleMeshVisibility();
     */
    public handleMeshVisibility = () => {
        if (!this?.selector?.selected) return;
        const selectedMesh = this.selector?.selected;
        if (!selectedMesh.isEnabled()) {
            selectedMesh.setEnabled(true);
        } else {
            selectedMesh.setEnabled(false);
            this.selector.deselect();
        }
        // this.UIeventEmitter.emit("sceneGraphChange", () => {});
    };
    public changeMaterialProperties = (mesh: AbstractMesh, prop: MaterialPropertyTypes) => {
        this.afterLoad((scene) => {
            if (mesh.material) {
                // mesh.material = null;
                let material = mesh.material;
                if (!material || material instanceof PBRMaterial) {
                    material = new StandardMaterial(mesh.id, scene);
                }

                switch (prop.type) {
                    case "diffuseColor":
                        (material as StandardMaterial).diffuseColor = prop.value; //TBD : Handle for other types of material
                        (material as StandardMaterial).diffuseTexture = null;
                        mesh.material = material;
                        //setting metadata
                        if (!mesh.metadata) {
                            mesh.metadata = {};
                        }
                        if (!mesh.metadata.data) {
                            mesh.metadata.data = {};
                        }
                        mesh.metadata.data.colorHex = prop.value.toHexString();
                        mesh.metadata.data.textureUrl = null;

                        break;
                    case "diffuseTexture":
                        (material as StandardMaterial).diffuseTexture = null; // removing previously added texture
                        (material as StandardMaterial).diffuseTexture = prop.value; //TBD : Handle for other types of material
                        (material as StandardMaterial).diffuseColor = new Color3(1, 1, 1); // setting the color of the mesh to white before applying the textures to avoid tinted textures
                        mesh.material = material;
                        //setting metadata
                        if (!mesh.metadata) {
                            mesh.metadata = {};
                        }
                        if (!mesh.metadata.data) {
                            mesh.metadata.data = {};
                        }
                        mesh.metadata.data.colorHex = null;
                        mesh.metadata.data.textureUrl = (prop.value as Texture).url;
                        break;
                    case "name":
                        // mesh.material.name = prop.value;
                        material.name = prop.value;
                        mesh.material = material;
                        break;
                    case "alpha":
                        // mesh.material.alpha = prop.value;
                        material.alpha = prop.value;
                        mesh.material = material;
                        break;
                    default:
                        break;
                }
            }
        });
    };
    public transformObject = (object: AbstractMesh | TransformNode, prop: TransformObjectProps) => {
        this.afterLoad(() => {
            let quaternion;
            switch (prop.transform) {
                case "Position":
                    object.position.copyFrom(prop.value);
                    break;
                case "Rotation":
                    quaternion = Quaternion.RotationYawPitchRoll(prop.value.y, prop.value.x, prop.value.z);
                    object.rotationQuaternion = quaternion;
                    break;
                case "Scaling":
                    object.scaling.copyFrom(prop.value);
                    break;
                default:
                    break;
            }
            object.computeWorldMatrix(true);
        });
    };

    /**
     * Toggles between perspective and isometric camera modes.
     */
    public toggleCameraMode = () => {
        this.afterLoad((scene) => {
            if (!scene.activeCamera) throw Error("No active camera found");
            const engine = scene.getEngine();
            const sceneWidth = engine.getRenderWidth();
            const sceneHeight = engine.getRenderHeight();

            if (scene.activeCamera.mode === Camera.ORTHOGRAPHIC_CAMERA) {
                // Switch to perspective camera
                scene.activeCamera.mode = Camera.PERSPECTIVE_CAMERA;
                // scene.activeCamera.fov = Math.PI / 4;
            } else {
                // Switch to orthographic camera
                scene.activeCamera.mode = Camera.ORTHOGRAPHIC_CAMERA;

                // Compute scene bounds
                const boundingBox = Editor.computeSceneBounds(scene.activeCamera, scene);

                // Check if the bounding box has a valid size
                const isBoundingBoxValid = boundingBox[0].equals(boundingBox[1]);

                if (isBoundingBoxValid) {
                    // Calculate the diagonal length of the bounding box
                    const diagonalLength = boundingBox[0].subtract(boundingBox[1]).length();

                    // Set orthographic camera properties
                    const aspectRatio = sceneWidth / sceneHeight;

                    // Adjust the scale factor based on your preference
                    const scaleFactor = 6.5; // Adjust this value as needed

                    scene.activeCamera.orthoTop = (diagonalLength / 2) * scaleFactor;
                    scene.activeCamera.orthoBottom = (-diagonalLength / 2) * scaleFactor;
                    scene.activeCamera.orthoLeft = (-diagonalLength / 2) * aspectRatio * scaleFactor;
                    scene.activeCamera.orthoRight = (diagonalLength / 2) * aspectRatio * scaleFactor;
                } else {
                    // Set default orthographic camera properties when the bounding box is too small or zero
                    const defaultOrthoSize = 27;
                    const defaultAspectRatio = sceneWidth / sceneHeight;

                    scene.activeCamera.orthoTop = defaultOrthoSize / 2;
                    scene.activeCamera.orthoBottom = -defaultOrthoSize / 2;
                    scene.activeCamera.orthoLeft = (-defaultOrthoSize / 2) * defaultAspectRatio;
                    scene.activeCamera.orthoRight = (defaultOrthoSize / 2) * defaultAspectRatio;
                }
            }
        });
    };
    public add3DText = this.threeDtext.add3DText;
    public set3DTextFont = this.threeDtext.set3DTextFont;
    public set3DTextContent = this.threeDtext.set3DTextContent;
    private _isBlobUrl = (str: string) => {
        const blobUrlPattern = /^blob:http[s]?:\/\/\S+$/;
        return blobUrlPattern.test(str);
    };

    public focusOnObjects = (object: AbstractMesh) => {
        this.afterLoad((scene) => {
            zoomCameraToMesh(scene.activeCamera as UniversalCamera, object as AbstractMesh);
        });
    };

    public importModel = (name: string, link: Link, uuid: string, bounds: AbstractMesh | undefined | null, onSuccessCb?: () => void, onErrorCb?: () => void) => {
        this.ableToRefresh = "FALSE";
        z.string().uuid().parse(uuid);
        z.string()
            .url()
            .parse(link.root + link.fileName);
        const extension = this._isBlobUrl(link.fileName) ? name.split(".").pop()?.toLowerCase() : link.fileName.split(".").pop()?.toLowerCase();
        type TextureModel = {
            costomData:
                | {
                      model_name: string;
                      userID: string;
                  }
                | undefined;
        };
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
        const { UID, sceneID } = getCurrentQueryParams();
        if (!UID || !sceneID) throw Error("provide UID and sceneID");
        (Texture as unknown as TextureModel).costomData = {
            model_name: removeExtension(name),
            userID: UID,
        };

        const onSuccess = (meshes: AbstractMesh[], scene: Scene, bounds: AbstractMesh | null | undefined) => {
            if (!meshes[0]) {
                console.warn("no mesh found in loaded model");
                return;
            }

            const metadata: MeshMetadata<"TransformNode"> = {
                isroot: true,
                data: {
                    name: "",
                    isModelRoot: true,
                },
                tags: ["FocusTarget"],
                allowedSelectionModes: ["position", "rotation", "scale"],
                type: "TransformNode",
                meshType: null,
            };

            meshes[0].id = uuid;
            meshes[0].name = name;
            meshes[0].metadata = metadata;
            meshes[0].checkCollisions = true;
            if (meshes[0].rotationQuaternion) {
                meshes[0].rotation = meshes[0].rotationQuaternion.toEulerAngles();
                meshes[0].rotationQuaternion = null;
            }
            meshes[0].getDescendants(false).forEach((mesh) => {
                const node = mesh as Mesh;
                if (node._isMesh) {
                    const metadata: MeshMetadata<"Mesh"> = {
                        isroot: true,
                        data: {
                            name: "",
                            isModelRoot: false,
                            colorHex: null,
                            textureUrl: null,
                        },
                        tags: [],
                        allowedSelectionModes: ["position", "rotation", "scale"],
                        type: "Mesh",
                        meshType: null,
                    };
                    if (node.material) {
                        (node.material as PBRMaterial).maxSimultaneousLights = 10;
                    }
                    node.metadata = metadata;

                    //add shadows to the specific meshes inside the glb
                    this.lightEmitter.shadows.castShadowForMesh(node, scene);
                } else {
                    const metadata: MeshMetadata<"TransformNode"> = {
                        isroot: true,
                        data: {
                            name: "",
                        },
                        tags: [],
                        allowedSelectionModes: ["position", "rotation", "scale"],
                        type: "TransformNode",
                        meshType: null,
                    };
                    if (node.rotationQuaternion) {
                        node.rotation = node.rotationQuaternion.toEulerAngles();
                        node.rotationQuaternion = null;
                    }
                    const emptyMesh = new Mesh(node.name, scene);

                    // Copy transformation properties from the original node to the new mesh
                    emptyMesh.position = node.position.clone();
                    emptyMesh.rotation = node.rotation.clone();
                    emptyMesh.scaling = node.scaling.clone();

                    // If the node has a parent, set the same parent for the new mesh
                    if (node.parent) {
                        emptyMesh.parent = node.parent;
                    }

                    emptyMesh.id = node.id;
                    emptyMesh.metadata = metadata;

                    // Move all children of the node to the new mesh
                    node.getChildren().forEach((child) => {
                        child.parent = emptyMesh;
                    });

                    // Finally, dispose of the original node
                    node.dispose();
                }
            });
            meshes[0].scaling = Vector3.One();
            bounds && this.meshScaler?.addModelToSceneWithinBound(meshes[0], bounds);

            this.scene = scene;

            // overrideShowBoundingBoxForMesh(meshes[0] as Mesh, this.BOX_RENDERER_NODE, this.utilLayer);
            onSuccessCb && onSuccessCb();
            this.save();
            this.UIeventEmitter.emit("sceneGraphChange", () => {});
            this.selector.select(meshes[0]);
            this.ableToRefresh = "TRUE";
            (Texture as unknown as TextureModel).costomData = undefined;
        };

        const onError = (scene: Scene, message: string) => {
            console.log("Error while loading a file :", message);
            console.log(scene);
            onErrorCb && onErrorCb();
        };

        this.afterLoad(async (scene) => {
            switch (extension) {
                case "babylon":
                    SceneLoader.ImportMesh(
                        "",
                        link.root,
                        link.fileName,
                        scene,
                        (meshes) => {
                            onSuccess(meshes, scene, bounds);
                        },
                        null,
                        onError,
                        ".babylon"
                    );
                    break;
                case "gltf":
                    SceneLoader.ImportMesh(
                        "",
                        link.root,
                        // await processGlb(link.fileName, ""),
                        link.fileName,
                        scene,
                        (meshes) => {
                            onSuccess(meshes, scene, bounds);
                        },
                        null,
                        onError,
                        `.${extension}`
                    );
                    break;
                case "glb":
                    SceneLoader.ImportMesh(
                        "",
                        link.root,
                        // await processGlb(link.fileName, ""),
                        link.fileName,
                        scene,
                        (meshes) => {
                            onSuccess(meshes, scene, bounds);
                        },
                        null,
                        onError,
                        `.${extension}`
                    );
                    break;
                case "obj":
                    SceneLoader.ImportMesh(
                        "",
                        link.root,
                        link.fileName,
                        scene,
                        (meshes) => {
                            const rootNode = new Mesh("node", scene);
                            meshes.forEach((m) => {
                                if (!m.parent) {
                                    m.parent = rootNode;
                                }
                            });
                            meshes.unshift(rootNode);
                            onSuccess(meshes, scene, bounds);
                        },
                        null,
                        onError,
                        ".obj"
                    );
                    break;
                case "stl":
                    SceneLoader.ImportMesh(
                        "",
                        link.root,
                        link.fileName,
                        scene,
                        (meshes) => {
                            onSuccess(meshes, scene, bounds);
                        },
                        null,
                        onError,
                        ".stl"
                    );
                    break;
                default:
                    handleUnsupportedFormat(link, extension || "");
                    break;
            }
        });
    };

    /**
     * Removes an object from the scene.
     * Recursively checkes whether the object has child either Mesh or TransformNode and removes the child also from the scene
     * @param {Mesh | TransformNode} mesh - The mesh or transform node to remove.
     * @param {boolean} dispose - if false then the mesh could retrieved back on undo.
     */
    public removeObject = (mesh: Mesh | TransformNode, dispose: boolean) => {
        this.afterLoad((scene) => {
            if (mesh instanceof Mesh) {
                //Removes the helper lines visualizing the direction of directional lights in the scene.
                if ((mesh.metadata.type as MeshType) === "DirectionLight") {
                    this.removeHelperLines(this.scene);
                }

                //removes the mesh
                scene.removeMesh(mesh, true);

                //remove the mesh from casting shadow after it is deleted
                this.lightEmitter.shadows.removeShadowForMesh(mesh, scene);
            }
            if (dispose) {
                mesh.dispose();
            }
            this.save();
            if (this.selector.selected && mesh === getParent(this.selector.selected)) {
                this.selector.deselect();
            }
            this.UIeventEmitter.emit("sceneGraphChange", () => {});
        });
    };
    /**
     * Removes the helper lines visualizing the direction of directional lights in the scene.
     * Finds the mesh named "lightDirectionLine" and disposes it.
     * @param scene - The scene containing the directional light helper lines.
     */
    public removeHelperLines = (scene: Scene) => {
        const lightLineMesh = scene.getMeshByName("lightDirectionLine");
        if (lightLineMesh) {
            // lightLineMesh.dispose();
            scene.removeMesh(lightLineMesh, true);
        }
    };
    public renameObject = (mesh: AbstractMesh, newName: string) => {
        this.afterLoad(() => {
            mesh.name = newName;
            this.UIeventEmitter.emit("sceneGraphChange", () => {});
        });
    };

    /**
     * Exports the scene to a file.
     *
     * @param {("GLTF"|"GLB")} [fileFormat="GLB"] - The file format to export to.
     * @param {string} [fileName="scene"] - The name of the exported file.
     * @param {Function} [onSuccess] - Optional callback function when export succeeds.
     * @param {Function} [onError] - Optional callback function when export fails.
     */
    public export = ({
        fileFormat = "GLB",
        fileName = "scene",
        onSuccess,
        onError,
        object,
    }: {
        fileFormat: "GLTF" | "GLB";
        fileName: string;
        onSuccess?: () => void;
        onError?: () => void;
        object?: TransformNode | AbstractMesh;
    }) => {
        this.afterLoad((scene) => {
            const nodes = object ? [...object.getDescendants(false), object] : null;

            const shouldExportNode = (node: Node) => {
                if (!nodes) {
                    return node.id !== DEFAULT_GRID_ID;
                } else {
                    return nodes.includes(node);
                }
            };
            switch (fileFormat) {
                case "GLTF":
                    GLTF2Export.GLTFAsync(scene, fileName, { shouldExportNode })
                        .then((gltf) => {
                            gltf.downloadFiles();
                            onSuccess && onSuccess();
                        })
                        .catch((err) => {
                            console.error("Error while exporting scene as GLTF file: ", err);
                            onError && onError();
                        });
                    break;
                case "GLB":
                    GLTF2Export.GLBAsync(scene, fileName, { shouldExportNode })
                        .then((glb) => {
                            glb.downloadFiles();
                            onSuccess && onSuccess();
                        })
                        .catch((err) => {
                            console.error("Error while exporting scene as GLB file: ", err);
                            onError && onError();
                        });
                    break;
                default:
                    console.error("Unsupported export format : ", fileFormat);
                    break;
            }
        });
    };

    public getSceneSnapShot = ({ imgWidth = 480, imgHeight = 480 }: { imgWidth: number; imgHeight: number }, cameraPosition?: Vector3): Promise<string> => {
        return new Promise((resolve) => {
            if (!this.scene.activeCamera) return;

            const currentCameraPosition = this.scene.activeCamera?.position.clone();

            if (cameraPosition) {
                this.scene.activeCamera.position = cameraPosition;
            }
            Tools.CreateScreenshotUsingRenderTarget(
                editor.scene.getEngine(),
                editor.scene.activeCamera!,
                {
                    width: imgWidth || 480,
                    height: imgHeight || 480 / editor.scene.getEngine().getAspectRatio(editor.scene.activeCamera!),
                },
                (imageData) => {
                    editor.scene.clearColor.a = 1;
                    this.scene.activeCamera?.position.copyFrom(currentCameraPosition);
                    resolve(imageData);
                }
            );
        });
    };

    public uploadSceneData = async (userId: string, sceneId: string, onSuccess?: () => void, onError?: () => void) => {
        this.UIeventEmitter.emit("syncState", "SYNCING");
        this.cloudSyncState.finalState = "SYNCING";
        const numberOfUndos = this.history.undos.length;
        const numberOfRedos = this.history.redos.length;
        if (!this.ableToRefresh) {
            const id = toast.loading("Saving, unsaved changes");
            this.save();
            toast.dismiss(id);
        }

        const toastId = toast.loading("Uploading scene data...");
        const imageFile = await this.getSceneSnapShot({ imgWidth: 480, imgHeight: 480 });
        const sceneJson = await this.storage.get(sceneId);

        const response = await handleUploadSceneData(userId, sceneId, sceneJson, imageFile, true);
        toast.dismiss(toastId);
        if (response.status === 200) {
            toast.success("Uploaded!!");
            onSuccess && onSuccess();
            const currentNumberOfUndos = this.history.undos.length;
            const currentNumberOfRedos = this.history.redos.length;
            if (numberOfRedos === currentNumberOfRedos && numberOfUndos === currentNumberOfUndos) {
                this.cloudSyncState = { Scene: true };
            } else {
                this.cloudSyncState = { Scene: false };
            }
        } else {
            toast.error("Something went wrong while uploading.");
            onError && onError();
        }
        return response;
    };
}
DefaultLoadingScreen.prototype.displayLoadingUI = function () {
    const customLoadingScreenDiv = document.getElementById("customLoadingScreenDiv");

    if (customLoadingScreenDiv) {
        // Do not add a loading screen if there is already one
        customLoadingScreenDiv.style.display = "flex";
        return;
    }
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "customLoadingScreenDiv";

    loadingDiv.innerHTML += `     
    <div id="imageContainer">
      <h1>What Will You Create Today?</h1>
      <img src="./logo.gif" alt="" width={96} height={96} />
      <p>Loading...</p>
    </div>`;

    const customLoadingScreenCss = document.createElement("style");
    customLoadingScreenCss.type = "text/css";
    customLoadingScreenCss.innerHTML = `
    #customLoadingScreenDiv{
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(111deg, #323232 0%, #011627 100%);
        width: 100%;
        height: 100%;
        color: #f7fafc;
        position: fixed;
        z-index: 9999;
       top:0;
        overflow: hidden;
    }

    #imageContainer{
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction:column
    }

    #imageContainer h1{
        font-size: 32px;
        font-style: normal;
        font-weight: 400;
        line-height: 40px;
        font-family: Rubik;
    }

    #imageContainer img{
     width:96px;
     height:96px;
     margin-top:30px
    }

    #imageContainer p{
        font-family:Outfit;
        font-size: 16px;
        font-style: normal;
        font-weight: 300;
        line-height: 20px;
        margin-top:10px
       }
    
    `;
    document.getElementsByTagName("head")[0].appendChild(customLoadingScreenCss);
    document.body.appendChild(loadingDiv);
};

DefaultLoadingScreen.prototype.hideLoadingUI = function () {
    const customLoadingScreenDiv = document.getElementById("customLoadingScreenDiv");

    if (customLoadingScreenDiv) {
        customLoadingScreenDiv.style.display = "none";
    }
};
declare global {
    interface Window {
        editor: Editor;
    }
}

export const editor = new Editor();
createUI();
