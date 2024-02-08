import type { AbstractMesh, Nullable } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import type { Command, Editor } from "../../editor";

export class AddDuplicatedMeshCommand implements Command {
    private editor: Editor;
    // private inputType: PrimitiveObjectType;
    private meshId: Nullable<string> = null;
    private mesh: AbstractMesh;
    private name: string;
    public type: string = "AddDuplicatedMeshCommand";
    public id: string = uuidv4();
    constructor(editor: Editor, name: string, mesh: AbstractMesh) {
        this.editor = editor;
        this.mesh = mesh;
        this.name = name;

        // this.inputType = type;
    }
    public execute = () => {
        if (!this.meshId) {
            this.meshId = uuidv4();
        }
        this.editor.addDuplicateObjects(this.mesh, this.name, this.meshId);
    };
    public undo = () => {
        if (!this.meshId) return;
        const mesh = this.editor.scene.getMeshById(this.meshId);
        this.editor.removeObject(mesh ? mesh : this.mesh, true);
        this.editor.selector.deselect();
    };
}
