import type { Nullable } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import type { Command, Editor, PrimitiveObjectType } from "../../editor";

export class AddPrimitiveCommand implements Command {
    private editor: Editor;
    private name: string;
    private inputType: PrimitiveObjectType;
    private meshId: Nullable<string> = null;
    public type: string = "AddPrimitiveCommand";
    public id: string = uuidv4();
    constructor(editor: Editor, type: PrimitiveObjectType, name: string) {
        this.editor = editor;
        this.name = name;
        this.inputType = type;
    }
    public execute = () => {
        if (!this.meshId) {
            this.meshId = uuidv4();
        }
        this.editor.addPrimitiveObjects(this.inputType, this.name, this.meshId);
        console.log("MESH ADDED EXECUTED", this.meshId);
    };
    public undo = () => {
        if (!this.meshId) return;
        const mesh = this.editor.scene.getMeshById(this.meshId);
        if (!mesh) return;
        this.editor.removeObject(mesh, false);
        this.editor.selector.deselect();
    };
}
