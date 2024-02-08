import { Vector3, type Nullable } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import type { Command, Editor } from "../../editor";

export class AddTextCommand implements Command {
    private editor: Editor;
    private name: string;
    private textID: Nullable<string> = null;
    public type: string = "AddTextCommand";
    public textContent: string;
    public id: string = uuidv4();
    constructor(editor: Editor, name: string, textContent: string) {
        this.editor = editor;
        this.name = name;
        this.textContent = textContent;
    }
    public execute = () => {
        if (!this.textID) {
            this.textID = uuidv4();
        }
        this.editor.add3DText(
            this.textContent,
            this.textID,
            this.name,
            {
                Position: Vector3.Zero(),
                Rotate: new Vector3(0, -Math.PI, 0),
                scale: Vector3.One(),
            },
            {
                name: "PressStart",
                bold: false,
                Italic: false,
            }
        );
    };
    public undo = () => {
        if (!this.textID) return;
        const mesh = this.editor.scene.getMeshById(this.textID);
        if (!mesh) return;
        this.editor.removeObject(mesh, false);
        this.editor.selector.deselect();
    };
}
