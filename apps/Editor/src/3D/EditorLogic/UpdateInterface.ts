import type { AbstractMesh, Color3 } from "@babylonjs/core";
import type { Editor, TransformObjectProps } from "./editor";

export class UpdateInterface {
    private editor: Editor;
    constructor(editor: Editor) {
        this.editor = editor;
    }
    public transform = (object: AbstractMesh, prop: TransformObjectProps) => {
        this.editor.transformObject(object, prop);
    };
    public color = (mesh: AbstractMesh, Color: Color3) => {
        this.editor.changeMaterialProperties(mesh, {
            type: "diffuseColor",
            value: Color,
        });
    };
    public alpha = (mesh: AbstractMesh, alpha: number) => {
        this.editor.changeMaterialProperties(mesh, {
            type: "alpha",
            value: alpha,
        });
    };
}
