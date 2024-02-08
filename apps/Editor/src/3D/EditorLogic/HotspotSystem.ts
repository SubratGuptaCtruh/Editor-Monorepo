import { AbstractMesh, BoundingBoxGizmo, Mesh, Nullable, Quaternion, SceneLoader, Tags, UniversalCamera, Vector3 } from "@babylonjs/core";
import { Power2, gsap } from "gsap";
import { Editor, HotspotSettingsType, MeshMetadata } from "./editor";
import { TAGS, lerp, makeMeshInteractive, makeMeshUninteractive } from "./utils";

export class Hotspot {
    private _id: string;
    private name: string;
    private _editor: Editor;

    public get id() {
        return this._id;
    }

    private _animationDuration = 2;

    public set animationDuration(value: number) {
        this._animationDuration = value;
    }

    private _loaded = false;

    private _afterLoadCallbacks: ((hotspot: Hotspot) => void)[] = [];

    public onLoaded = (callback: (hotspot: Hotspot) => void) => {
        if (this._loaded) {
            callback(this);
        } else {
            this._afterLoadCallbacks.push(callback);
        }
    };

    private _isInPreviewMode: boolean = false;

    private _mesh: Nullable<AbstractMesh> = null;

    private _state: HotspotSettingsType = {
        focusLocked: false,
        fov: 45,
        focusedTarget: null,
        mode: 0,
        preview: false,
    };

    public get state() {
        return this._state;
    }

    public set state(value: HotspotSettingsType) {
        this._state = { ...this._state, ...value };
    }

    constructor(editor: Editor, id: string, name: string, focusLocked?: boolean, focusedTarget?: string, mode?: number, mesh?: AbstractMesh) {
        this._editor = editor;
        if (!mesh) {
            this._id = id;
            this.name = name;

            this.state = { ...this.state, focusedTarget: focusedTarget || null, focusLocked: focusLocked || false, mode: mode || 0 };
            this.addCameraHotspot(name, id);
        } else {
            this._id = mesh.id;
            this.name = mesh.name;
            this._mesh = mesh;
            this.addEventListeners();

            makeMeshInteractive(mesh);
            this.state = { ...mesh.metadata.data.settings, preview: false };
            mesh.metadata.data.settings = { ...this.state };
            if (this.state.focusLocked && this.state.focusedTarget) {
                const target = this._editor.scene.getMeshById(this.state.focusedTarget);
                this.setFocusTarget(target, true);
            } else {
                this.state.focusLocked = false;
                this.state.focusedTarget = null;
                this._editor.UIeventEmitter.emit("hotspotStateChanged", this.id, this.state);
            }
            this._afterLoadCallbacks.forEach((callback) => callback(this));
            this._loaded = true;
        }
    }

    private onSceneObjectTransform = (mesh: Nullable<AbstractMesh>) => {
        if (!mesh || !this.state.focusLocked) return;
        if (mesh.id !== this.state.focusedTarget) {
            if (mesh.id === this.id) {
                const focusedTarget = this._editor.scene.getMeshById(this.state.focusedTarget || "");
                if (!focusedTarget) return;
                this.setFocusTarget(focusedTarget, true);
            }
        } else {
            const focusedTarget = this._editor.scene.getMeshById(this.state.focusedTarget || "");
            if (!focusedTarget) return;
            this.setFocusTarget(focusedTarget, true);
        }
    };

    private onSceneGraphChanged = () => {
        if (!this.state.focusLocked) return;
        const focusedTarget = this._editor.scene.getMeshById(this.state.focusedTarget || "");
        if (!focusedTarget) {
            this.setFocusTarget(null, false);
        } else {
            this.setFocusTarget(focusedTarget, true);
        }
    };

    private onPreviewHotspotChanged = (id: string) => {
        if (!this._mesh) return;
        if (!this._isInPreviewMode || this.id === id) return;
        const hotspotSettings = this._mesh.metadata.data.settings;
        makeMeshInteractive(this._mesh);
        hotspotSettings.preview = false;
        this._isInPreviewMode = false;
        this.state = { ...this.state, ...hotspotSettings };
        this._editor.UIeventEmitter.emit("hotspotStateChanged", this.id, this.state);
        this._editor.save();
    };

    private addEventListeners = () => {
        this._editor.UIeventEmitter.on("transformChangeEnd", this.onSceneObjectTransform);
        this._editor.UIeventEmitter.on("previewCameraChanged", this.onPreviewHotspotChanged);
        this._editor.UIeventEmitter.on("sceneGraphChange", this.onSceneGraphChanged);
    };

    private removeEventListeners = () => {
        this._editor.UIeventEmitter.off("transformChangeEnd", this.onSceneObjectTransform);
        this._editor.UIeventEmitter.off("previewCameraChanged", this.onPreviewHotspotChanged);
        this._editor.UIeventEmitter.off("sceneGraphChange", this.onSceneGraphChanged);
    };

    public addCameraHotspot = (name: string, uuid: string) => {
        SceneLoader.ImportMesh(
            "",
            "",
            "hotspotModel.glb",
            this._editor.scene,
            (mesh) => {
                if (!mesh[0]) {
                    console.warn("no mesh found in glb");
                    return;
                }
                const metadata: MeshMetadata<"Camera"> = {
                    isroot: true,
                    data: {
                        name: this.name,
                        settings: {
                            focusLocked: this.state.focusLocked || false,
                            fov: this.state.fov || 45,
                            mode: this.state.mode || 0,
                            focusedTarget: this.state.focusedTarget || null,
                            preview: false,
                        },
                    },
                    tags: [],
                    type: "Camera",
                    meshType: null,
                    allowedSelectionModes: ["position", "rotation", null],
                };
                const rootMesh = BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(mesh[0] as Mesh);
                rootMesh.setDirection(mesh[0].forward);
                rootMesh.id = uuid;
                rootMesh.name = name;
                rootMesh.scaling = new Vector3(5, 5, 1);
                rootMesh.position.y = 2.5;
                rootMesh.metadata = metadata;
                rootMesh.checkCollisions = true;
                this._mesh = rootMesh;

                this._afterLoadCallbacks.forEach((callback) => callback(this));
                this._loaded = true;

                Tags.AddTagsTo(this._mesh, TAGS.HOTSPOT);
                makeMeshInteractive(rootMesh);
                this.addEventListeners();

                this.state = { ...this.state, ...metadata.data.settings };

                this._editor.UIeventEmitter.emit("hotspotStateChanged", this.id, this.state);
                this._editor.UIeventEmitter.emit("sceneGraphChange", () => {});
                this._editor.selector.select(rootMesh);
                this._editor.save();
            },
            undefined,
            undefined,
            ".glb"
        );
    };

    public dispose() {
        if (!this._mesh) return;
        if (this._mesh === this._editor.selector.selected) {
            this._editor.selector.deselect();
        }
        this._mesh.dispose();
        this.removeEventListeners();
        this._afterLoadCallbacks = [];
        this._editor.save();
        this._editor.UIeventEmitter.emit("sceneGraphChange", () => {});
    }

    public setCameraProjections = (mode: number) => {
        const cameraObject = this._mesh;
        const camera = this._editor.scene._activeCamera;
        if (!camera || !cameraObject) return;
        camera.mode = mode;
        const hotspotSettings = cameraObject.metadata.data.settings;
        if (!hotspotSettings.preview) return;
        hotspotSettings.mode = mode;
        // this.serialize();
        this.state = { ...this.state, ...hotspotSettings };
        this._editor.UIeventEmitter.emit("hotspotStateChanged", this.id, this.state);
        this._editor.save();
    };

    public zoomCameraHotspot(onStart?: () => void, onProgress?: () => void, onComplete?: () => void) {
        const cameraObject = this._mesh;

        const camera = this._editor.scene._activeCamera as UniversalCamera;
        if (!camera || !cameraObject) return;

        const hotspotSettings = cameraObject.metadata.data.settings;

        if (!this._isInPreviewMode) {
            this._isInPreviewMode = true;
            this._editor.originalCameraPosition = camera.position.clone();
            this._editor.UIeventEmitter.emit("previewCameraChanged", this.id);
        }

        const forward = cameraObject.forward;
        const horizonDistance = 50;

        //settings
        const targetMeshID = hotspotSettings.focusedTarget;
        const focusLock = hotspotSettings.focusLocked;
        const targetMesh = targetMeshID && this._editor.scene.getMeshById(targetMeshID);
        const targetFov = hotspotSettings.fov;
        const fovRadians = (targetFov * Math.PI) / 180;
        const mode = hotspotSettings.mode;

        const target = focusLock && targetMesh ? targetMesh.getBoundingInfo().boundingBox.centerWorld : forward.scale(horizonDistance);

        this._editor.originalCameraFov = camera.fov;
        const targetPosition = cameraObject.getBoundingInfo().boundingBox.centerWorld;
        const animationDuration = this._animationDuration; // in seconds
        const cameraAnimation = gsap.timeline();

        cameraAnimation.to(camera.position, {
            duration: animationDuration,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            ease: Power2.easeInOut,
            //lerp between camera target position while moving to the target destination
            onUpdate: () => {
                const progress = cameraAnimation.progress();
                onProgress && onProgress();
                camera.setTarget(Vector3.Lerp(camera.target, target, progress));
                camera.fov = lerp(camera.fov, fovRadians, progress);
            },
            onComplete: () => {
                this._editor.hotspotSystem.currentHotspotInPreview = this;
                onComplete && onComplete();
            },
            onStart: () => {
                onStart && onStart();
                camera.mode = mode;
                hotspotSettings.preview = true;
                this._editor.selector.enable = false;
                camera.inputs.remove(camera.inputs.attached.keyboard);
                this._editor.cameraSystem.disableDolly();
                this._editor.cameraSystem.disablePan();
                this.state = { ...this.state, ...hotspotSettings };
                this._editor.UIeventEmitter.emit("hotspotStateChanged", this.id, this.state);
                this._editor.save();
                makeMeshUninteractive(cameraObject);
            },
        });
    }

    public setFocusTarget = (target: Nullable<AbstractMesh>, focusLocked: boolean) => {
        const cameraObject = this._mesh;

        if (!cameraObject) return;

        const targetPosition = target?.getBoundingInfo().boundingBox.centerWorld || Vector3.Zero();

        const hotspotSettings = cameraObject.metadata.data.settings as HotspotSettingsType;

        hotspotSettings.focusedTarget = target?.id || null;
        hotspotSettings.focusLocked = focusLocked;

        // this.serialize();
        this.state = { ...this.state, ...hotspotSettings };
        this._editor.UIeventEmitter.emit("hotspotStateChanged", this.id, this.state);
        this._editor.save();

        if (!focusLocked) {
            this._editor.cameraSystem.enableDolly();
            this._editor.cameraSystem.enablePan();
            return;
        }

        //create Quaternion if it dosent exist so we lerp between initial and target rotation
        if (!cameraObject.rotationQuaternion) {
            cameraObject.rotationQuaternion = Quaternion.RotationYawPitchRoll(cameraObject.rotation.y, cameraObject.rotation.x, cameraObject.rotation.z);
        }

        if (!cameraObject.rotationQuaternion) return;

        if (this._isInPreviewMode) {
            this.zoomCameraHotspot();
        }

        const initialRotation = cameraObject.rotationQuaternion.clone();

        //get a target Quaternion
        cameraObject.lookAt(targetPosition);
        const targetRotation = cameraObject.rotationQuaternion.clone();

        // Reset to initial rotation
        cameraObject.rotationQuaternion = initialRotation;

        //look at animation
        const animationDuration = this._animationDuration; // in seconds
        const cameraObjectAnimation = gsap.timeline();
        const progress = {
            value: 0,
        };

        cameraObjectAnimation.to(progress, {
            value: 1,
            duration: animationDuration,
            ease: Power2.easeInOut,
            onUpdate: () => {
                const progress = cameraObjectAnimation.progress();
                cameraObject.rotationQuaternion && Quaternion.SlerpToRef(initialRotation, targetRotation, progress, cameraObject.rotationQuaternion);
            },
            onComplete: () => {
                if (hotspotSettings.preview) {
                    this._editor.selector.enable = false;
                    this._editor.cameraSystem.disableDolly();
                    this._editor.cameraSystem.disablePan();
                }
            },
        });
    };

    public setCameraFOV = (fovDegree: number) => {
        const camera = this._editor.scene._activeCamera;
        const cameraObject = this._mesh;

        if (!camera || !cameraObject) return;

        const fovRadians = (fovDegree * Math.PI) / 180;
        camera.fov = fovRadians;

        const hotspotSettings = cameraObject.metadata.data.settings;

        hotspotSettings.fov = fovDegree;
        this.state = { ...this.state, ...hotspotSettings };
        this._editor.UIeventEmitter.emit("hotspotStateChanged", this.id, this.state);
        this._editor.save();

        return fovRadians;
    };

    public panCameraBackToOriginalPosition = (onStart?: () => void, onProgress?: () => void, onComplete?: () => void, targetCameraPosition?: Vector3) => {
        const camera = this._editor.scene._activeCamera as UniversalCamera;
        const cameraObject = this._mesh;
        if (!camera || !cameraObject || !this._isInPreviewMode) return;

        this._isInPreviewMode = false;
        const hotspotSettings = cameraObject.metadata.data.settings;

        hotspotSettings.preview = false;
        const animationDuration = this._animationDuration; // in seconds
        const cameraAnimation = gsap.timeline();
        const targetPosition = targetCameraPosition ? targetCameraPosition : this._editor.originalCameraPosition;
        cameraAnimation.to(camera.position, {
            duration: animationDuration,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            ease: Power2.easeInOut,
            onUpdate: () => {
                const progress = cameraAnimation.progress();
                onProgress && onProgress();
                camera.setTarget(Vector3.Lerp(camera.getTarget(), Vector3.Zero(), progress)); // reset target to zero
                camera.fov = lerp(camera.fov, (45 * Math.PI) / 180, progress);
            },
            onComplete: () => {
                this._editor.hotspotSystem.currentHotspotInPreview = null;
                onComplete && onComplete();
                camera.inputs.addKeyboard();
                this._editor.cameraSystem.enableDolly();
                this._editor.cameraSystem.enablePan();
                this._editor.selector.enable = true;
                this._editor.save();
            },
            onStart: () => {
                onStart && onStart();
                this.state = { ...this.state, ...hotspotSettings };
                this._editor.UIeventEmitter.emit("hotspotStateChanged", this.id, this.state);
            },
        });
        makeMeshInteractive(cameraObject);
    };

    public setTransformation = (position: Vector3, rotation: Vector3) => {
        const cameraObject = this._mesh;
        if (!cameraObject) return;
        cameraObject.position.copyFrom(position);
        if (cameraObject.rotationQuaternion) {
            const q = Quaternion.RotationYawPitchRoll(rotation.y, rotation.x, rotation.z);
            cameraObject.rotationQuaternion = q;
        } else {
            cameraObject.rotation.copyFrom(rotation);
        }
        this.onSceneObjectTransform(cameraObject);
        this._editor.save();
    };
    public hide = () => {
        const Hotspotmesh = this._editor.scene.getMeshById(this.id);
        if (Hotspotmesh) {
            makeMeshUninteractive(Hotspotmesh);
        }
    };
    public unhide = () => {
        const Hotspotmesh = this._editor.scene.getMeshById(this.id);
        if (Hotspotmesh) {
            makeMeshInteractive(Hotspotmesh);
        }
    };
}

export class HotspotSystem {
    private hotspots: Hotspot[] = [];

    private _editor: Editor;

    constructor(editor: Editor) {
        this._editor = editor;
    }

    private _currentHotspotInPreview: Nullable<Hotspot> = null;

    public set currentHotspotInPreview(value: Nullable<Hotspot>) {
        this.onPreviewHotspotChanged.forEach((cb) => {
            cb(value);
        });
        this._currentHotspotInPreview = value;
    }

    public get currentHotspotInPreveiw() {
        return this._currentHotspotInPreview;
    }

    private onPreviewHotspotChanged: ((value: Nullable<Hotspot>) => void)[] = [];

    public setPreviewHotspotChangedCallback = (callback: (value: Nullable<Hotspot>) => void) => {
        this.onPreviewHotspotChanged.push(callback);

        return () => {
            const functionIndex = this.onPreviewHotspotChanged.findIndex((element) => callback === element);
            if (functionIndex !== -1) {
                this.onPreviewHotspotChanged.splice(functionIndex, 1);
            }
        };
    };

    public unhide = () => {
        this.hotspots.forEach((hotspot) => {
            hotspot.unhide();
        });
    };

    public hide = () => {
        this.hotspots.forEach((hotspot) => {
            hotspot.hide();
        });
    };

    public addHotspot = (name: string, uuid: string, focusLocked?: boolean, focusedTarget?: string, mode?: number) => {
        const hotspot = new Hotspot(this._editor, name, uuid, focusLocked, focusedTarget, mode);
        this.hotspots.push(hotspot);
        return hotspot;
    };

    public getHotspotById = (id: string) => {
        for (const hotspot of this.hotspots) {
            if (hotspot.id === id) {
                return hotspot;
            }
        }
        return null;
    };

    public disposeHotspotByid = (id: string) => {
        const hotspot = this.getHotspotById(id);
        hotspot?.dispose();
        this.hotspots = this.hotspots.filter((h) => h.id !== id);
    };

    public mount = (mesh: AbstractMesh) => {
        const hotspot = new Hotspot(this._editor, "", "", undefined, undefined, undefined, mesh);
        this.hotspots.push(hotspot);
    };
}
