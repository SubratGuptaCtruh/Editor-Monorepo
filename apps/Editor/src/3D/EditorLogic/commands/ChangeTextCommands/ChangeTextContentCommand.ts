import type { Mesh, TransformNode } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import type { Command, Editor, MeshMetadata, PossibelMeshMetadata } from "../../editor";

export class ChangeTextContentCommand implements Command {
    private editor: Editor;
    private textID: string;
    public type: string = "AddPrimitiveCommand";
    public textContent: string;
    public PrevTextContent: string;
    public id: string = uuidv4();
    constructor(editor: Editor, TextNode: TransformNode, textContent: string) {
        const metadata = TextNode.metadata as PossibelMeshMetadata;
        if (metadata.type !== "Text") throw Error("input TextMesh was not a text mesh,because metadata for text was not provided");
        z.string().uuid().parse(TextNode.id);
        this.PrevTextContent = (metadata as MeshMetadata<"Text">).data.textContent;
        this.textID = TextNode.id;
        this.editor = editor;
        this.textContent = textContent;
    }
    public execute = () => {
        const prevTextMesh = this.editor.scene.getMeshById(this.textID) as Mesh;
        if (!prevTextMesh) throw Error(`no mesh found with id ${this.textID}`);
        this.editor.set3DTextContent(prevTextMesh, this.textContent);
    };
    public undo = () => {
        const oldmesh = this.editor.scene.getMeshById(this.textID) as Mesh;
        if (!oldmesh) throw Error(`no mesh found with id ${this.textID}`);
        this.editor.set3DTextContent(oldmesh, this.PrevTextContent);
    };
}
