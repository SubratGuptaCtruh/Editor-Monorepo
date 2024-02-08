import { AbstractMesh, BaseTexture, Color3, StandardMaterial, Texture } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import type { Command, Editor } from "../../editor";
// import { BaseTexture } from "babylonjs";
export class SetMaterialCommnand implements Command {
    private editor: Editor;
    public id: string = uuidv4();
    public type: string = "SetMaterialCommnand";
    public currMesh: AbstractMesh;
    public materialTexture: BaseTexture | null;
    public materialColor: Color3 | null;
    public oldMaterial: BaseTexture | Color3;
    private meshId: string;
    constructor(editor: Editor, mesh: AbstractMesh, color: Color3 | null, texture: Texture | null, oldMaterial: BaseTexture | Color3) {
        this.oldMaterial = oldMaterial ? oldMaterial : (mesh.material as StandardMaterial).diffuseColor;
        this.materialColor = color;
        this.meshId = mesh.id;
        this.materialTexture = texture;
        this.currMesh = mesh;
        this.editor = editor;
    }
    public execute = () => {
        const mesh = this.editor.scene.getMeshById(this.meshId) as AbstractMesh;
        if (!mesh) return;
        if (this.materialColor instanceof Color3) {
            this.editor.changeMaterialProperties(mesh, { type: "diffuseColor", value: this.materialColor });
        }
        // removing else condition for applying reset material texture to null
        else {
            this.editor.changeMaterialProperties(mesh, { type: "diffuseTexture", value: this.materialTexture });
        }
    };
    public undo = () => {
        const mesh = this.editor.scene.getMeshById(this.meshId) as AbstractMesh;
        if (!mesh) return;
        if (this.oldMaterial instanceof Texture) {
            this.editor.changeMaterialProperties(mesh, { type: "diffuseTexture", value: this.oldMaterial });
        } else if (this.oldMaterial instanceof Color3) {
            this.editor.changeMaterialProperties(mesh, { type: "diffuseColor", value: this.oldMaterial });
        }
    };
}
