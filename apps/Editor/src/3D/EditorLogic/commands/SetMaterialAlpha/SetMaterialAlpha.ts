import { AbstractMesh, StandardMaterial } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import type { Command, Editor } from "../../editor";

export class SetMaterialAlphaCommand implements Command {
    private editor: Editor;
    public id: string = uuidv4();
    public type: string = "SetMaterialAlphaCommand";
    public currMesh: AbstractMesh;
    public objectId: string;
    public materialAlpha: number;
    public oldMaterialAlpha: number;
    constructor(editor: Editor, mesh: AbstractMesh, alpha: number, oldAlpha?: number) {
        this.editor = editor;
        this.currMesh = mesh;
        this.objectId = mesh.id;
        this.materialAlpha = alpha;
        if (mesh.material instanceof StandardMaterial) {
            console.log();
        }
        if (!mesh.material) throw Error("no matrial on this mesh");
        this.oldMaterialAlpha = oldAlpha ? oldAlpha : mesh.material?.alpha;
    }
    public execute = () => {
        const currMesh = this.editor.scene.getMeshById(this.objectId);
        this.editor.changeMaterialProperties(currMesh ? currMesh : this.currMesh, { type: "alpha", value: this.materialAlpha });
    };
    public undo = () => {
        const currMesh = this.editor.scene.getMeshById(this.objectId);
        this.editor.changeMaterialProperties(currMesh ? currMesh : this.currMesh, { type: "alpha", value: this.oldMaterialAlpha });
    };
}
