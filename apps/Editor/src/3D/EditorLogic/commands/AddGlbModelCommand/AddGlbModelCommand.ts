import type { AbstractMesh, Nullable } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import type { Command, Editor, Link } from "../../editor";

export class AddGlbModelCommand implements Command {
    private editor: Editor;
    private name: string;
    private link: Link;
    public type: string = "AddGlbModelCommand";
    private meshId: Nullable<string> = null;

    private onSuccess: (() => void) | undefined;
    private onError: (() => void) | undefined;

    public id: string = uuidv4();
    private bounds: AbstractMesh | undefined | null = null;

    constructor(editor: Editor, name: string, link: Link, bounds?: AbstractMesh | undefined | null, onSuccess?: () => void, onError?: () => void) {
        this.editor = editor;
        this.name = name;
        this.link = link;
        this.bounds = bounds;
        this.onSuccess = onSuccess;
        this.onError = onError;
    }
    public execute = () => {
        if (!this.meshId) {
            this.meshId = uuidv4();
        }
        this.editor.importModel(this.name, this.link, this.meshId, this.bounds, this.onSuccess, this.onError);
    };
    public undo = () => {
        if (!this.meshId) return;
        const mesh = this.editor.scene.getMeshById(this.meshId);
        if (!mesh) return;
        console.log("aah");
        this.editor.removeObject(mesh, false);
        mesh.dispose();
    };
}
