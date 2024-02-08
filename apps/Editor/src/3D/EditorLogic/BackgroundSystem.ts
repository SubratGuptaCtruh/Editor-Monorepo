import {
    AbstractMesh,
    Color3,
    Color4,
    Engine,
    HDRCubeTexture,
    HemisphericLight,
    Light,
    Mesh,
    MeshBuilder,
    Nullable,
    Sound,
    StandardMaterial,
    Tags,
    Texture,
} from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_GRID_COLOR } from "../../2D/Hooks/useBackgroundState";
import { Editor } from "./editor";
import { TAGS } from "./utils";

export const BACKGROUND_RESOURCES_ID = "CTRUH_DEFAUILT_BACKGROUND_MANAGER_UNIQUE_ID";
export const DEFAULT_GRID_ID = `${BACKGROUND_RESOURCES_ID}_GRID`;
export const DEFAULT_SKYBOX_ID = `${BACKGROUND_RESOURCES_ID}_SKYBOX`;
export const DEFAULT_LIGHT_ID = `${BACKGROUND_RESOURCES_ID}_LIGHT`;
export const DEFAULT_AUDIO_ID = `${BACKGROUND_RESOURCES_ID}_AUDIO`;

const defaultAmbientLightSpecs = {
    tags: null,
    groundColor: [0, 0, 0],
    direction: [0, 1, 0],
    diffuse: [1, 1, 1],
    specular: [1, 1, 1],
    falloffType: 0,
    intensity: 0.5,
    range: 1.79,
    intensityMode: 0,
    radius: 0.00001,
    _renderPriority: 0,
    shadowEnabled: true,
    excludeWithLayerMask: 0,
    includeOnlyWithLayerMask: 0,
    lightmapMode: 0,
    name: DEFAULT_LIGHT_ID,
    id: DEFAULT_LIGHT_ID,
    state: "",
    uniqueId: 6,
    type: 3,
    animations: [],
    ranges: [],
    isEnabled: true,
};

type BackgrounMediaType = {
    name: string;
    url: string;
};

export type backgroundStateType = {
    backgroundColor?: string;
    backgroundImage?: Nullable<BackgrounMediaType>;
    audio?: Nullable<BackgrounMediaType>;
    ambientLightIntensity?: number;
    gridEnable?: boolean;
    gridColor?: string;
    audioVolume?: number;
    audioPlaying?: boolean;
    audioLooping?: boolean;
};

export class BackgroundSystem {
    private _mesh: Nullable<Mesh> = null;

    private _grid: Nullable<Mesh> = null;

    private _skybox: Nullable<AbstractMesh> = null;

    private _light: Nullable<HemisphericLight> = null;

    private _audio: Nullable<Sound> = null;

    private editor: Editor;

    public get grid() {
        return this._grid;
    }

    private _state: backgroundStateType = {
        gridEnable: true,
        gridColor: DEFAULT_GRID_COLOR,
    };

    public get state() {
        return this._state;
    }

    private set state(value: backgroundStateType) {
        if (!this._mesh) throw new Error("Mesh doesn't exist for background");
        const newState = { ...this.state, ...value };
        this._mesh.metadata.data.settings = newState;
        this.editor.UIeventEmitter.emit("backgroundStateChanged", newState);
        this.editor.save();
        this._state = newState;
    }

    constructor(editor: Editor, mesh: Nullable<Mesh>) {
        this.editor = editor;

        if (!mesh) {
            this._mesh = new Mesh(BACKGROUND_RESOURCES_ID, this.editor.scene);

            this._mesh.metadata = {
                isroot: true,
                data: {
                    name: "Background",
                    settings: {},
                },
                type: "Background",
                meshType: null,
                allowedSelectionModes: [null, null, null],
            };

            this.state = {
                backgroundColor: DEFAULT_BACKGROUND_COLOR,
                backgroundImage: null,
                audio: null,
                ambientLightIntensity: 0.5,
                gridEnable: true,
                gridColor: DEFAULT_GRID_COLOR,
                audioVolume: 5,
                audioPlaying: false,
                audioLooping: false,
            };
        } else {
            this._mesh = mesh;
            this._mesh.metadata.data.settings.audioPlaying = false;
            this.state = this._mesh.metadata.data.settings;
        }

        Tags.AddTagsTo(this._mesh, TAGS.BACKGROUND);

        this._light = Light.Parse(defaultAmbientLightSpecs, Editor.Instance.scene) as HemisphericLight;
        this._light.doNotSerialize = true;
        this._light.id = DEFAULT_LIGHT_ID;
        this._grid = MeshBuilder.CreateGround(DEFAULT_GRID_ID, { width: 1000, height: 1000 }, Editor.Instance.scene);
        this._grid.doNotSerialize = true;
        this._grid.id = DEFAULT_GRID_ID;
        this._grid.metadata = {
            isroot: false,
            type: "Grid",
            meshType: null,
            allowedSelectionModes: [null, null, null],
        };

        this._grid.parent = this._mesh;
        this._light.parent = this._mesh;

        const gridMaterial = new GridMaterial(`${DEFAULT_GRID_ID}_MATERIAL`, Editor.Instance.scene);
        gridMaterial.backFaceCulling = false;
        gridMaterial.gridRatio = 1;
        gridMaterial.opacity = 0.99;
        this._grid.material = gridMaterial;
        this._grid.isPickable = false;
        this._grid.material.doNotSerialize = true;

        const initialGridColor = this.state.gridColor || DEFAULT_GRID_COLOR;
        const { gridEnable, backgroundColor, backgroundImage, audio, audioVolume, ambientLightIntensity } = this.state;

        this.changeGridColor(initialGridColor);

        gridEnable ? this.enableGrid() : this.disableGrid();

        backgroundColor && this.setBackgroundColor(backgroundColor);

        backgroundImage ? this.addHDREnvironment(backgroundImage.name, backgroundImage.url) : this.removeHDREnvironment();

        ambientLightIntensity && this.setLightIntensity(ambientLightIntensity);
        audio && this.setAudio(audio.url, audio.name);
        audioVolume && this.setAudioVolume(audioVolume);
    }

    public enableGrid = () => {
        this._grid?.setEnabled(true);
        this.state = { gridEnable: true };
    };

    public disableGrid = () => {
        this._grid?.setEnabled(false);
        this.state = { gridEnable: false };
    };

    public changeGridColor = (color: string) => {
        if (this._grid?.material && this._grid.material instanceof GridMaterial) {
            const color3 = Color3.FromHexString(color);
            (this._grid.material as GridMaterial).lineColor = color3;
            this.state = { gridColor: color };
        }
    };

    public addHDREnvironment = (name: string, url: string) => {
        if (this._skybox) {
            this._skybox.dispose();
        }

        this._skybox = MeshBuilder.CreateSphere(DEFAULT_SKYBOX_ID, { diameter: 1000 }, this.editor.scene);
        this._skybox.isPickable = false;
        this._skybox.id = DEFAULT_SKYBOX_ID;
        this._skybox.doNotSerialize = true;

        this._skybox.parent = this._mesh;

        const hdr = new HDRCubeTexture(url, this.editor.scene, 512);
        hdr.name = name;

        const backgroundMaterial = new StandardMaterial(`${DEFAULT_SKYBOX_ID}_MATERIAL`, this.editor.scene);
        backgroundMaterial.backFaceCulling = false;

        backgroundMaterial.reflectionTexture = hdr;

        backgroundMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

        this.state = {
            backgroundImage: {
                name,
                url,
            },
        };

        this._skybox.material = backgroundMaterial;
        this._skybox.material.doNotSerialize = true;
    };

    public removeHDREnvironment = () => {
        if (!this._skybox) return;
        this._skybox.dispose();
        this._skybox = null;
        this.state = { backgroundImage: null };
    };

    public setBackgroundColor = (color: Nullable<string>) => {
        const bgColor = color ? color : DEFAULT_BACKGROUND_COLOR;
        this.editor.scene.clearColor = Color4.FromHexString(bgColor);
        document.body.style.background = bgColor;
        this.state = { backgroundColor: color ? color : undefined };
    };

    public setLightIntensity = (value: number) => {
        if (!this._light) return;
        this._light.intensity = value;
        this.state = { ambientLightIntensity: value };
    };

    public setAudio = (url: string, name: string) => {
        if (this._audio) {
            this._audio.dispose();
        }
        this._audio = new Sound(DEFAULT_AUDIO_ID, url, this.editor.scene, null, { loop: this.state.audioLooping, autoplay: false, volume: this.state.audioVolume || 1 });

        this._audio.onended = () => {
            this.state = { audioPlaying: false };
        };

        this.state = {
            audioPlaying: false,
            audio: {
                name,
                url,
            },
        };
    };

    public removeAudio = () => {
        if (this._audio) {
            this._audio.dispose();
        }
        this.state = { audioPlaying: false, audioLooping: false, audio: null };
    };

    public setAudioVolume = (value: number) => {
        if (!this._audio) return;
        this._audio.setVolume(value);
        this.state = { audioVolume: value };
    };

    public playAudio = () => {
        if (!this._audio || this.state.audioPlaying) return;
        Engine.audioEngine?.audioContext
            ?.resume()
            .then(() => {
                this._audio?.play();
                this.state = { audioPlaying: true };
            })
            .catch((err) => {
                console.log(err);
            });
    };

    public restartAudio = () => {
        if (!this._audio) return;
        Engine.audioEngine?.audioContext
            ?.resume()
            .then(() => {
                this._audio?.stop();
                this._audio?.play();
                if (this.state.audioLooping) return;
                this.state = { audioPlaying: true };
            })
            .catch((err) => {
                console.log(err);
            });
    };

    public pauseAudio = () => {
        if (!this._audio) return;
        this._audio.pause();
        this.state = { audioPlaying: false };
    };

    public toggleLoop = (loop?: boolean) => {
        if (!this._audio) return;
        this._audio.loop = loop || !this.state.audioLooping;
        this.state = { audioLooping: this._audio.loop };
    };
}
