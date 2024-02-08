import { AbstractMesh, BoundingBoxGizmo, Color3, Mesh, MeshBuilder, Nullable, Scene, SceneLoader, StandardMaterial, Tags, Vector3 } from "@babylonjs/core";
import { v4 } from "uuid";
import { Editor, MeshMetadata } from "./editor";
import { TAGS } from "./utils";

export type AudioStateType = {
    audioUrl?: Nullable<string>;
    audioName?: Nullable<string>;
    volume?: number;
    playing?: Nullable<boolean>;
    loop?: Nullable<boolean>;
    distance?: number;
};

export const createNonReactiveMaterial = (color: Color3, scene: Scene, name: string) => {
    const helperMaterial = new StandardMaterial(name, scene);
    helperMaterial.diffuseColor = color;
    helperMaterial.emissiveColor = color;
    helperMaterial.alpha = 0.2;
    helperMaterial.disableLighting = true;
    helperMaterial.specularColor = new Color3(0, 0, 0);
    helperMaterial.reflectionTexture = null;
    return helperMaterial;
};

const changeMaterialColor = (material: StandardMaterial, color: Color3) => {
    material.diffuseColor = color;
    material.emissiveColor = color;
};

const YELLOW_COLOR = new Color3(1, 1, 0);
const GREEN_COLOR = new Color3(0, 1, 0);

export class AudioInstance {
    private _editor: Editor;

    private _audio: Nullable<HTMLAudioElement> = null;
    private _audioMesh: Nullable<AbstractMesh> = null;
    private _helperMesh: Nullable<AbstractMesh> = null;

    public get mesh() {
        return this._audioMesh;
    }

    public id: string;

    public name: string;

    private _state: AudioStateType = {
        audioUrl: null,
        audioName: null,
        volume: 0.5,
        playing: null,
        loop: null,
        distance: 5,
    };

    public get state() {
        return this._state;
    }

    public set state(value: AudioStateType) {
        if (!this._audioMesh) return;
        const newState = { ...this._state, ...value };
        this._editor.UIeventEmitter.emit("audioStateChanged", this.id, newState);
        this._audioMesh.metadata.data = newState;
        this._state = newState;
        this._editor.save();
    }

    constructor(editor: Editor, id: string, name: string, options: AudioStateType = {}, mesh?: AbstractMesh) {
        this._editor = editor;
        if (!mesh) {
            this.id = id;

            this.name = name;

            this._state = { ...this._state, ...options };

            this.createAudio(this._state);

            if (options.audioUrl) {
                this.setAudio(options.audioUrl, options.audioName || "");
                if (options.volume) {
                    this.setVolume(options.volume);
                }
            }
        } else {
            this.id = mesh.id;
            this.name = mesh.name;
            this._audioMesh = mesh;
            this._helperMesh = this.getHelperFromAudioMesh(mesh);
            if (this._helperMesh?.material) {
                changeMaterialColor(this._helperMesh.material as StandardMaterial, YELLOW_COLOR);
            }
            const data = this._audioMesh.metadata.data;
            this.state = { ...data, playing: false };
            if (data.audioUrl) {
                this.setAudio(data.audioUrl, data.audioName);
                if (data.volume) {
                    this.setVolume(data.volume);
                }
            }
        }
    }

    private createAudio(options: AudioStateType, onSuccess?: (meshes: AbstractMesh[]) => void, onError?: () => void) {
        this._editor.afterLoad((scene) => {
            SceneLoader.ImportMesh(
                "",
                "",
                "audio_active.glb",
                scene,
                (mesh) => {
                    if (!mesh[0]) {
                        console.warn("no mesh found in glb");
                        return;
                    }
                    const metadata: MeshMetadata<"SpatialAudio"> = {
                        isroot: false,
                        data: {
                            audioName: options.audioName || "",
                            audioUrl: options.audioUrl || "",
                            volume: options.volume || 0.5,
                            distance: options.distance || 5,
                            playing: options.playing || null,
                            loop: options.loop || null,
                        },
                        tags: [],
                        allowedSelectionModes: ["position", null, null],
                        type: "SpatialAudio",
                        meshType: null,
                    };
                    const spatialAudio = BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(mesh[0] as Mesh);
                    spatialAudio.setDirection(mesh[0].forward);
                    spatialAudio.id = this.id;
                    spatialAudio.name = this.name;

                    spatialAudio.scaling = new Vector3(5, 5, 1);
                    spatialAudio.position.y = 2.5;
                    spatialAudio.metadata = metadata;

                    this._audioMesh = spatialAudio;

                    Tags.AddTagsTo(this._audioMesh, TAGS.SPATIALAUDIO);

                    this.state = metadata.data;
                    this._editor.selector.select(this._audioMesh);
                    this.createHelper(options.distance);
                    this._editor.UIeventEmitter.emit("sceneGraphChange", () => {});
                    onSuccess && onSuccess(mesh);
                },
                undefined,
                () => {
                    onError && onError();
                },
                ".glb"
            );
        });
    }

    private createHelper(distance = 5) {
        if (this._helperMesh) {
            this._helperMesh.dispose();
            this._helperMesh.material?.dispose();
        }
        const soundDistanceHelper = MeshBuilder.CreateSphere(`${this.id}-helper`, { diameter: 1 }, this._editor.scene);
        soundDistanceHelper.scaling = new Vector3(distance * 2, distance * 2, distance * 2);
        soundDistanceHelper.isPickable = false;
        const helperMaterial = createNonReactiveMaterial(YELLOW_COLOR, this._editor.scene, "helper-material");
        soundDistanceHelper.material = helperMaterial;
        this._helperMesh = soundDistanceHelper;
        if (this._helperMesh && this._audioMesh) {
            this._helperMesh.position = this._audioMesh.position.clone();
            this._audioMesh?.addChild(soundDistanceHelper);
        }
        this.state = { distance };
    }

    public changeDistance(distance: number) {
        this.createHelper(distance);
        this._editor.selector.BoundingBoxGizmo?.updateBoundingBox();
    }

    public setAudio(url: string, name: string) {
        this._audio = new Audio(url);
        this._audio.onended = () => {
            this.state = { playing: false };
        };

        this._audio.loop = this.state.loop || false;

        this._audio.volume = this.state.volume || 0.5;

        let isLoaded = false;

        this._audio.oncanplaythrough = () => {
            if (!isLoaded) {
                isLoaded = true;
                this.state = { audioUrl: url, audioName: name };
            }
        };
    }

    public removeAudio = (cleanupData = true) => {
        if (!this._audio) return;
        this._audio.pause();
        this._audio.onended = null;
        this._audio.oncanplaythrough = null;
        this._audio.src = "";
        this._audio.remove();
        this._audio = null;
        if (this._helperMesh?.material) {
            changeMaterialColor(this._helperMesh.material as StandardMaterial, YELLOW_COLOR);
        }
        if (cleanupData) {
            this.state = { playing: false, audioName: null, audioUrl: null };
        }
    };

    public setVolume(volume: number) {
        if (!this._audio) return;
        this._audio.volume = volume;
        this.state = { volume: volume };
    }

    public play() {
        if (!this._audio) return;
        this._audio?.play();
        if (this._helperMesh?.material) {
            changeMaterialColor(this._helperMesh.material as StandardMaterial, GREEN_COLOR);
        }
        this.state = { playing: true };
    }

    public pause() {
        if (!this._audio) return;
        this._audio?.pause();
        if (this._helperMesh?.material) {
            changeMaterialColor(this._helperMesh.material as StandardMaterial, YELLOW_COLOR);
        }
        this.state = { playing: false };
    }

    public toggleLoop() {
        if (!this._audio) return;
        this._audio.loop = !this._audio.loop;
        this.state = { loop: this._audio.loop };
    }

    public delete() {
        this.removeAudio();
        if (!this._audioMesh) return;
        this._editor.scene.removeMesh(this._audioMesh, true);
        this._editor.UIeventEmitter.emit("sceneGraphChange", () => {});
    }

    public reset() {
        if (!this._audio) return;
        this._audio.currentTime = 0;
        this._audio.play();
        this.state = { playing: true };
    }

    private getHelperFromAudioMesh = (mesh: AbstractMesh) => {
        const helper = this._editor.scene.getMeshById(`${mesh.id}-helper`);
        return helper;
    };
}

export class AudioSystem {
    private _editor: Editor;

    private _audios: { [key: string]: AudioInstance } = {};

    constructor(editor: Editor) {
        this._editor = editor;
    }

    public addAudio(options: { [key: string]: string | boolean | number | null }) {
        const { id, name, ...rest } = options;
        const audioId = (id as string) ?? v4();
        const audioName = (name as string) ?? " ";
        const newAudio = new AudioInstance(this._editor, audioId, audioName, rest);
        this._audios[audioId] = newAudio;
        return newAudio;
    }

    public getAudioById(id: string) {
        return this._audios[id];
    }

    public getAllAudios() {
        return this._audios;
    }

    public deleteAudio(audio: AudioInstance | string) {
        const id = audio instanceof AudioInstance ? audio.id : audio;
        this._audios[id]?.delete();
        delete this._audios[id];
    }

    public mount(mesh: AbstractMesh) {
        const audio = new AudioInstance(this._editor, "", "", {}, mesh);
        this._audios[mesh.id] = audio;
        return audio;
    }
}
