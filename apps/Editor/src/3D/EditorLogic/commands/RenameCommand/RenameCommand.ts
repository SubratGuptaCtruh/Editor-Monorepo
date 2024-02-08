import type { AbstractMesh } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import type { Command, Editor } from "../../editor";

export class RenameCommand implements Command {
    private editor: Editor;
    public mesh: AbstractMesh;
    public type: string = "RenameCommand";
    public id: string = uuidv4();
    public newName: string;
    public oldName: string;
    constructor(editor: Editor, mesh: AbstractMesh, newName: string) {
        this.editor = editor;
        this.mesh = mesh;
        this.newName = newName;
        this.oldName = mesh.name;
    }
    public execute = () => {
        this.editor.renameObject(this.mesh, this.newName);
    };
    public undo = () => {
        this.editor.renameObject(this.mesh, this.oldName);
    };
}
