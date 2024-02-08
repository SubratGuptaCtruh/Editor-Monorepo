import type { AbstractMesh } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import type { Command, Editor } from "../../editor";

export class RemoveObjCommand implements Command {
    private editor: Editor;
    public mesh: AbstractMesh;
    public type: string = "RemoveObjCommand";
    public id: string = uuidv4();
    public meshId: string;
    private dispose: boolean;
    constructor(editor: Editor, mesh: AbstractMesh, dispose: boolean) {
        this.editor = editor;
        this.mesh = mesh;
        this.meshId = this.mesh.id;
        this.dispose = dispose;
    }
    public execute = () => {
        const mesh = this.editor.scene.getMeshById(this.meshId); //this.editor.scene.meshes.find((mesh) => mesh.id === this.meshId); //getMeshById(this.meshId);
        console.log(mesh?.uniqueId, this.mesh.uniqueId);
        if (mesh?.uniqueId && this.mesh.uniqueId) {
            if (mesh.uniqueId !== this.mesh.uniqueId) {
                this.mesh = mesh;
            }
        }
        this.editor.removeObject(mesh ? mesh : this.mesh, this.dispose);
        this.editor.selector.deselect();
    };
    public undo = () => {
        const mesh = this.editor.scene.getMeshById(this.meshId); //meshes.find((mesh) => mesh.id === this.meshId);
        if (mesh?.uniqueId && this.mesh.uniqueId) {
            if (mesh.uniqueId !== this.mesh.uniqueId) {
                this.mesh = mesh;
            }
        }
        this.editor.scene.addMesh(mesh ? mesh : this.mesh, true);
    };
}
