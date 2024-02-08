import { Nullable } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import { AudioInstance } from "../../AudioSystem";
import { Command, Editor } from "../../editor";

export class ChangeAudioCommand implements Command {
    private editor: Editor;
    public type: string = "ChangeAudioCommand";

    private newData: { name: Nullable<string>; url: Nullable<string> };

    private oldData: { name: Nullable<string>; url: Nullable<string> } = {
        name: null,
        url: null,
    };

    private audioInstance: AudioInstance;

    public id: string = uuidv4();

    constructor(editor: Editor, audioInstance: AudioInstance, newAudio: { name: Nullable<string>; url: Nullable<string> }) {
        this.editor = editor;
        this.audioInstance = audioInstance;
        const state = audioInstance.state;
        this.oldData = state.audioUrl ? { name: state.audioName || "", url: state.audioUrl } : this.oldData;
        this.newData = { name: newAudio.name, url: newAudio.url };
    }

    public execute = () => {
        const audioInstance = this.editor.audioSystem.getAudioById(this.audioInstance.id);
        if (this.newData.name && this.newData.url) {
            audioInstance?.setAudio(this.newData.url, this.newData.name);
        } else {
            audioInstance?.removeAudio();
        }
    };

    public undo = () => {
        const audioInstance = this.editor.audioSystem.getAudioById(this.audioInstance.id);
        if (this.oldData.name && this.oldData.url) {
            audioInstance?.setAudio(this.oldData.url, this.oldData.name);
        } else {
            audioInstance?.removeAudio();
        }
    };
}
