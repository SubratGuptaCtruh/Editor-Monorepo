import { Nullable } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import { Command, Editor } from "../../editor";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_GRID_COLOR } from "../../../../2D/Hooks/useBackgroundState";

export class ChangeHDRCommand implements Command {
    private editor: Editor;
    public type: string = "ChangeHDRCommand";

    private newData: { name: Nullable<string>; url: Nullable<string> };

    private oldData: { name: Nullable<string>; url: Nullable<string> } = {
        name: null,
        url: null,
    };

    public id: string = uuidv4();

    constructor(editor: Editor, newHDR: { name: Nullable<string>; url: Nullable<string> }) {
        this.editor = editor;
        const state = editor.backGroundSystem?.state;
        this.oldData = state?.backgroundImage ? state.backgroundImage : this.oldData;
        this.newData = { name: newHDR.name, url: newHDR.url };
    }

    public execute = () => {
        if (this.newData.name && this.newData.url) {
            this.editor.backGroundSystem?.addHDREnvironment(this.newData.name, this.newData.url);
        } else {
            this.editor.backGroundSystem?.removeHDREnvironment();
        }
    };

    public undo = () => {
        if (this.oldData.url && this.oldData.name) {
            this.editor.backGroundSystem?.addHDREnvironment(this.oldData.name, this.oldData.url);
        } else {
            this.editor.backGroundSystem?.removeHDREnvironment();
        }
    };
}

export class ChangeBackgroundColorCommand {
    private editor: Editor;
    public type: string = "ChangeBackgroundColorCommand";

    private oldColour: string;
    private newColour: string;

    public id: string = uuidv4();

    constructor(editor: Editor, newColour: string, oldColour: string) {
        this.editor = editor;
        this.newColour = newColour;
        this.oldColour = oldColour || DEFAULT_BACKGROUND_COLOR;
        console.log(this.oldColour, this.newColour, "BACKGROUND COLOR");   
    }

    public execute = () => {
        this.editor.backGroundSystem?.setBackgroundColor(this.newColour);
    };

    public undo = () => {
        this.editor.backGroundSystem?.setBackgroundColor(this.oldColour);
    };
}

export class ChangeGridColorCommand {
    private editor: Editor;
    public type: string = "ChangeGridColorCommand";

    private oldColour: string;
    private newColour: string;

    public id: string = uuidv4();

    constructor(editor: Editor, newColour: string, oldColour: string) {
        this.editor = editor;
        this.newColour = newColour;
        this.oldColour = oldColour || DEFAULT_GRID_COLOR;
    }

    public execute = () => {
        this.editor.backGroundSystem?.changeGridColor(this.newColour);
    };

    public undo = () => {
        this.editor.backGroundSystem?.changeGridColor(this.oldColour);
    };
}

export class ChangeBackgroundAudioCommand {
    private editor: Editor;
    public type: string = "ChangeBackgroundAudioCommand";

    private newData: { name: Nullable<string>; url: Nullable<string> };

    private oldData: { name: Nullable<string>; url: Nullable<string> } = {
        name: null,
        url: null,
    };

    public id: string = uuidv4();

    constructor(editor: Editor, newAudio: { name: Nullable<string>; url: Nullable<string> }) {
        this.editor = editor;
        const state = editor.backGroundSystem?.state;
        this.oldData = state?.audio ? state?.audio : this.oldData;
        this.newData = { name: newAudio.name, url: newAudio.url };
    }

    public execute = () => {
        console.log(this.newData, "AUDIODATAINCOMMAND");
        if (this.newData.name && this.newData.url) {
            this.editor.backGroundSystem?.setAudio(this.newData.url, this.newData.name);
        } else {
            this.editor.backGroundSystem?.removeAudio();
        }
    };

    public undo = () => {
        console.log(this.oldData, "AUDIODATAINCOMMAND");
        if (this.oldData.name && this.oldData.url) {
            this.editor.backGroundSystem?.setAudio(this.oldData.url, this.oldData.name);
        } else {
            this.editor.backGroundSystem?.removeAudio();
        }
    };
}
