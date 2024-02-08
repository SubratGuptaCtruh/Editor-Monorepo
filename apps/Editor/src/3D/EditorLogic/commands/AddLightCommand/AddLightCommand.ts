import type { Nullable } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import type { Command, Editor, LightValueParms } from "../../editor";

export class AddLightCommand implements Command {
    private editor: Editor;
    public id: string = uuidv4();
    public type: string = "AddLightCommand";
    public light: LightValueParms;
    public lightId: Nullable<string> = null;
    constructor(editor: Editor, light: LightValueParms) {
        this.editor = editor;
        this.light = light;
    }
    public execute = () => {
        if (!this.lightId) {
            this.lightId = uuidv4();
        }
        this.editor.createLight(this.light, this.lightId);
    };
    public undo = () => {
        if (!this.lightId) return;
        const lightHelper = this.editor.scene.getMeshById(this.lightId);
        if (lightHelper) {
            this.editor.selector.deselect();
            lightHelper.dispose();
        }
    };
}
