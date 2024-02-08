import { AbstractMesh, Nullable, Vector3 } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import type { Command, Editor, MeshMetadata } from "../../editor";

export class DuplicateScreenCommand implements Command {
    private editor: Editor;

    public type: string = "DuplicateScreenCommand";

    public id: string = uuidv4();

    private meshId: Nullable<string> = null;

    private metadata: MeshMetadata<"Screen"> | null = null;
    private originalScreen: AbstractMesh;

    constructor(editor: Editor, screen: AbstractMesh) {
        this.editor = editor;
        this.originalScreen = screen;
        this.metadata = { ...screen.metadata };
    }

    public execute = () => {
        if (!this.metadata) return;
        if (!this.meshId) {
            this.meshId = uuidv4();
        }
        const data = { ...this.metadata.data };
        const link = data.imageSources ? data.imageSources : data.videoSources;
        const pos = this.originalScreen.absolutePosition.addInPlace(new Vector3(10, 0, 10));
        const fileName = data.fileName;
        this.editor.addScreens(data.aspectRatio, `${this.originalScreen.name}_copy`, this.meshId, link, fileName, pos);
    };

    public undo = () => {
        if (!this.meshId) return;
        const mesh = this.editor.scene.getMeshById(this.meshId);
        if (!mesh) return;
        this.metadata = { ...mesh.metadata };
        this.editor.screenLoader.removeTexture(mesh);
        this.editor.removeObject(mesh, false);
    };
}
