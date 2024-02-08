import type { AbstractMesh, Mesh } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import type { Command, Editor, MeshMetadata, PossibelMeshMetadata } from "../../editor";

export class ChangeFontCommand implements Command {
    private editor: Editor;
    private textID: string;
    public type: string = "ChangeFontCommand";
    public font: MeshMetadata<"Text">["data"]["font"];
    public Prevfont: MeshMetadata<"Text">["data"]["font"];
    public id: string = uuidv4();
    constructor(editor: Editor, TextMesh: AbstractMesh, Font: MeshMetadata<"Text">["data"]["font"]) {
        const metadata = TextMesh.metadata as PossibelMeshMetadata;
        if (metadata.type !== "Text") throw Error("input TextMesh was not a text mesh,because metadata for text was not provided");
        z.string().uuid().parse(TextMesh.id);
        this.Prevfont = (metadata as MeshMetadata<"Text">).data.font;
        this.textID = TextMesh.id;
        this.editor = editor;
        this.font = Font;
    }
    public execute = () => {
        const prevTextMesh = this.editor.scene.getMeshById(this.textID) as Mesh;
        if (!prevTextMesh) throw Error(`no mesh found with id ${this.textID}`);
        this.editor.set3DTextFont(prevTextMesh, this.font);
    };
    public undo = () => {
        const oldTextMesh = this.editor.scene.getMeshById(this.textID) as Mesh;
        if (!oldTextMesh) throw Error(`no mesh found with id ${this.textID}`);
        this.editor.set3DTextFont(oldTextMesh, this.Prevfont);
    };
}
