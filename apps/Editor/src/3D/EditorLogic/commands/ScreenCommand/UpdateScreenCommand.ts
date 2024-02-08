import type { AbstractMesh } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import type { Command, Editor } from "../../editor";

export class UpdateScreenAspectRatio implements Command {
    private editor: Editor;

    private aspectRatio: string;
    private screen: AbstractMesh;
    private oldAspectRatio: string;
    private screenId: string;

    public id = uuidv4();

    public type: string = "UpdateScreenAspectRatio";

    constructor(editor: Editor, aspectRatio: string, screen: AbstractMesh) {
        this.editor = editor;
        this.aspectRatio = aspectRatio;
        this.screen = screen;
        this.screenId = screen.id;
        this.oldAspectRatio = screen.metadata.data.aspectRatio;
    }

    public execute = () => {
        const screen = this.editor.scene.getMeshById(this.screenId);
        this.editor.screenLoader.updateScreenResolution(screen || this.screen, this.aspectRatio);
    };

    public undo = () => {
        const screen = this.editor.scene.getMeshById(this.screenId);
        this.editor.screenLoader.updateScreenResolution(screen || this.screen, this.oldAspectRatio);
    };
}

export class UpdateScreenTextureCommand implements Command {
    private editor: Editor;

    private screen: AbstractMesh;
    private link: string | null;
    private oldLink: string | null;
    private screenId: string;
    private fileName: string;
    private oldFileName: string;
    public id = uuidv4();

    public type: string = "UpdateScreenTextureCommand";

    constructor(editor: Editor, link: string | null, fileName: string, screen: AbstractMesh) {
        this.editor = editor;
        this.screen = screen;
        this.screenId = screen.id;
        this.link = link;
        this.fileName = fileName;
        const url = screen.metadata.data.imageSources ? screen.metadata.data.imageSources : screen.metadata.data.videoSources;
        this.oldFileName = screen.metadata.data.fileName || "";
        this.oldLink = url;
    }

    public execute = () => {
        const screen = this.editor.scene.getMeshById(this.screenId);
        if (this.link) {
            this.editor.screenLoader.updateTexture(screen || this.screen, this.link, this.fileName);
        } else {
            this.editor.screenLoader.removeTexture(screen || this.screen);
        }
    };

    public undo = () => {
        const screen = this.editor.scene.getMeshById(this.screenId);
        if (this.oldLink) {
            this.editor.screenLoader.updateTexture(screen || this.screen, this.oldLink, this.oldFileName);
        } else {
            this.editor.screenLoader.removeTexture(screen || this.screen);
        }
    };
}

export class UpdateScreenBillboardMode implements Command {
    private editor: Editor;

    private screen: AbstractMesh;
    private billboardMode: number;
    private oldBillboardMode: number;
    private screenId: string;

    public id = uuidv4();

    public type: string = "UpdateScreenBillboardMode";

    constructor(editor: Editor, mode: number, screen: AbstractMesh) {
        this.editor = editor;
        this.screen = screen;
        this.screenId = screen.id;
        this.billboardMode = mode;
        this.oldBillboardMode = screen.billboardMode;
    }

    public execute = () => {
        const screen = this.editor.scene.getMeshById(this.screenId);
        this.editor.screenLoader.setBillboardMode(screen || this.screen, this.billboardMode);
    };

    public undo = () => {
        const screen = this.editor.scene.getMeshById(this.screenId);
        this.editor.screenLoader.setBillboardMode(screen || this.screen, this.oldBillboardMode);
    };
}
