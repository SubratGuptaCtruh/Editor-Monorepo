import type { AbstractMesh, Nullable } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import { AudioInstance, AudioStateType } from "../../AudioSystem";
import type { Command, Editor } from "../../editor";

export class AddSpatialAudio implements Command {
    private editor: Editor;
    public id: string = uuidv4();
    public type: string = "AddSpatialAudio";
    private spatialAudioId: Nullable<string> = null;
    public audioName: string;
    private url: Nullable<string> = null;

    private state: Nullable<AudioStateType> = null;

    constructor(editor: Editor, url: string | null, audioName: string) {
        this.editor = editor;
        this.url = url;
        this.audioName = audioName;
    }

    execute() {
        if (!this.spatialAudioId) {
            this.spatialAudioId = uuidv4();
        }
        const specs = this.state ? this.state : {};

        this.editor.audioSystem.addAudio({ id: this.spatialAudioId, name: this.audioName, audioUrl: this.url, ...specs, playing: false });
    }

    undo() {
        if (!this.spatialAudioId) return;
        const audioInstance = this.editor.audioSystem.getAudioById(this.spatialAudioId);
        this.state = { ...audioInstance.state };
        this.editor.audioSystem.deleteAudio(this.spatialAudioId);
        this.editor.selector.deselect();
    }
}

export class RemoveSpatialAudio implements Command {
    private editor: Editor;
    public id: string = uuidv4();
    public type: string = "RemoveSpatialAudio";
    private spatialAudio: Nullable<AudioInstance> = null;

    constructor(editor: Editor, audioMesh: AbstractMesh) {
        this.editor = editor;
        this.spatialAudio = editor.audioSystem.getAudioById(audioMesh.id);
    }

    execute = () => {
        if (!this.spatialAudio) return;
        this.spatialAudio.removeAudio(false);
        const mesh = this.spatialAudio.mesh;
        if (!mesh) return;
        this.editor.scene.removeMesh(mesh, true);
        this.editor.selector.deselect();
        this.editor.UIeventEmitter.emit("sceneGraphChange", () => {});
    };

    undo = () => {
        if (!this.spatialAudio) return;
        const mesh = this.spatialAudio.mesh;
        if (!mesh) return;
        this.editor.scene.addMesh(mesh, true);
        this.editor.audioSystem.mount(mesh);
    };
}

export class DuplicateSpatialAudioCommand implements Command {
    private editor: Editor;
    public id: string = uuidv4();
    public type: string = "DuplicateSpatialAudioCommand";
    private spatialAudio: Nullable<AudioInstance> = null;

    private spatialAudioId: Nullable<string> = null;

    private specs: Nullable<AudioStateType> = null;

    constructor(editor: Editor, audioMesh: AbstractMesh) {
        this.editor = editor;
        this.spatialAudio = editor.audioSystem.getAudioById(audioMesh.id);
    }

    public execute = () => {
        if (!this.spatialAudio) return;
        if (!this.spatialAudioId) {
            this.spatialAudioId = uuidv4();
        }
        this.specs = this.spatialAudio.state;

        this.specs.playing = false;
        this.editor.audioSystem.addAudio({ id: this.spatialAudioId, name: `${this.spatialAudio.name}_copy`, ...this.specs });
    };

    public undo = () => {
        if (!this.spatialAudioId) return;
        this.editor.audioSystem.deleteAudio(this.spatialAudioId);
        this.editor.selector.deselect();
    };
}
