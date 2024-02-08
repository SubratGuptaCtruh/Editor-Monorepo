import type { Nullable, Vector3 } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import type { Command, Editor, MeshMetadata } from "../../editor";

export class AddScreenCommand implements Command {
    private editor: Editor;

    public type: string = "AddScreenCommand";

    public id: string = uuidv4();

    private meshId: Nullable<string> = null;

    private name: string;
    private link: string | null = null;
    private position: Vector3;
    private aspectRatio: string;
    private metaData: MeshMetadata<"Screen"> | null = null;
    private fileName: string | null;

    constructor(editor: Editor, aspectRatio: string, name: string, link: string | null, fileName: string | null, position: Vector3) {
        this.editor = editor;
        this.name = name;
        this.link = link;
        this.position = position;
        this.aspectRatio = aspectRatio;
        this.fileName = fileName;
    }

    public execute = () => {
        if (!this.meshId) {
            this.meshId = uuidv4();
        }
        this.editor.addScreens(this.aspectRatio, this.name, this.meshId, this.link, this.fileName, this.position);

        const mesh = this.editor.scene.getMeshById(this.meshId);

        if (this.metaData && mesh) {
            mesh.metadata.data = { ...this.metaData.data };
            const texture = mesh.metadata.data.imageSources ? mesh.metadata.data.imageSources : mesh.metadata.data.videoSources;
            this.editor.screenLoader.updateTexture(mesh, texture, mesh.metadata.data.fileName || "");
        }
    };

    public undo = () => {
        if (!this.meshId) return;
        const mesh = this.editor.scene.getMeshById(this.meshId);
        if (!mesh) return;
        this.link = mesh.metadata.data.imageSources ? mesh.metadata.data.imageSources : mesh.metadata.data.videoSources;
        this.metaData = { ...mesh.metadata };

        this.editor.screenLoader.removeTexture(mesh);
        if (this.editor.selector.selected === mesh) {
            this.editor.selector.deselect();
        }
        mesh.dispose();
    };
}
