import type { AbstractMesh } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import type { Command, Editor, MeshTypeMap } from "../../editor";

export class RemoveScreenCommand implements Command {
    private editor: Editor;

    public type: string = "RemoveScreenCommand";

    public id: string = uuidv4();
    private screen: AbstractMesh;

    private metaData: MeshTypeMap["Screen"];

    constructor(editor: Editor, screen: AbstractMesh) {
        this.editor = editor;
        this.screen = screen;
        this.metaData = { ...this.screen.metadata.data };
    }

    public execute = () => {
        this.editor.screenLoader.removeTexture(this.screen);
        this.editor.removeObject(this.screen, false);
    };

    public undo = () => {
        if (!this.screen) return;
        this.editor.afterLoad((scene) => {
            scene.addMesh(this.screen, false);
            this.screen.metadata.data = { ...this.metaData };
            const link = this.screen.metadata.data.imageSources ? this.screen.metadata.data.imageSources : this.screen.metadata.data.videoSources;
            if (!link) return;
            this.editor.screenLoader.updateTexture(this.screen, link, this.screen.metadata.data.fileName);
        });
    };
}
