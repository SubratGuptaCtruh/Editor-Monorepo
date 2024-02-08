import type { AbstractMesh, Mesh } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import type { Command, Editor } from "../../editor";
import { LightSystem } from "../../lights";

export class ChangeLightColorCommand implements Command {
    private editor: Editor;
    public id: string = uuidv4();
    public type: string = "ChangeLightColorCommand";
    public light: AbstractMesh;
    public lightId: string;
    public color: string;
    public prevColor: string;
    constructor(editor: Editor, light: AbstractMesh, color: string, oldColor?: string) {
        this.editor = editor;
        this.light = light;
        this.color = color;
        this.lightId = light.id;
        this.prevColor = oldColor ? oldColor : LightSystem.getLightColor(light);
    }
    public execute = () => {
        const lightHelper = this.editor.scene.getMeshById(this.lightId) as Mesh;
        LightSystem.setLightColor(lightHelper, this.color);
    };
    public undo = () => {
        if (!this.lightId) return;
        const lightHelper = this.editor.scene.getMeshById(this.lightId) as Mesh;
        LightSystem.setLightColor(lightHelper, this.prevColor);
    };
}
