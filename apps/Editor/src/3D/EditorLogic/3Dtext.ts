import { AbstractMesh, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";
import earcut from "earcut";
import { z } from "zod";
import { Editor, MeshMetadata, MeshType, editor } from "./editor";
const fontsDir: z.infer<typeof ThreeDText.fontDirSchema> = [
    {
        FontName: "PressStart",
        Regular: "https://ctruhcdn.azureedge.net/3dtext/PressStart/PressStart_Regular.json",
        Bold: null,
        BoldItalic: null,
        Italic: null,
    },
    {
        FontName: "BrunoAce",
        Regular: "https://ctruhcdn.azureedge.net/3dtext/BrunoAce/BrunoAce_Regular.json",
        Bold: null,
        BoldItalic: null,
        Italic: null,
    },
    {
        FontName: "Lobster",
        Regular: "https://ctruhcdn.azureedge.net/3dtext/Lobster/Lobster_Regular.json",
        Bold: null,
        BoldItalic: null,
        Italic: null,
    },
    {
        FontName: "Oswald",
        Regular: "https://ctruhcdn.azureedge.net/3dtext/Oswald/Oswald_Regular.json",
        Bold: "https://ctruhcdn.azureedge.net/3dtext/Oswald/Oswald_Bold.json",
        BoldItalic: null,
        Italic: null,
    },
    {
        FontName: "Merriweather",
        Regular: "https://ctruhcdn.azureedge.net/3dtext/Merriweather/Merriweather_Regular.json",
        Bold: "https://ctruhcdn.azureedge.net/3dtext/Merriweather/Merriweather_Bold.json",
        BoldItalic: "https://ctruhcdn.azureedge.net/3dtext/Merriweather/Merriweather_BoldItalic.json",
        Italic: "https://ctruhcdn.azureedge.net/3dtext/Merriweather/Merriweather_Italic.json",
    },
    {
        FontName: "Nunito",
        Regular: "https://ctruhcdn.azureedge.net/3dtext/Nunito/Nunito_Regular.json",
        Bold: "https://ctruhcdn.azureedge.net/3dtext/Nunito/Nunito_Bold.json",
        BoldItalic: "https://ctruhcdn.azureedge.net/3dtext/Nunito/Nunito_BoldItalic.json",
        Italic: "https://ctruhcdn.azureedge.net/3dtext/Nunito/Nunito_Italic.json",
    },
    {
        FontName: "Poppins",
        Regular: "https://ctruhcdn.azureedge.net/3dtext/Poppins/Poppins_Regular.json",
        Bold: "https://ctruhcdn.azureedge.net/3dtext/Poppins/Poppins_Bold.json",
        BoldItalic: "https://ctruhcdn.azureedge.net/3dtext/Poppins/Poppins_BoldItalic.json",
        Italic: "https://ctruhcdn.azureedge.net/3dtext/Poppins/Poppins_Italic.json",
    },
];
export class ThreeDText {
    public editor: Editor;
    public static allAvalibelFonts = z.enum(["Poppins", "Oswald", "Nunito", "PressStart", "Merriweather", "Lobster", "BrunoAce"]);
    public static fontDirSchema = z.array(
        z.object({
            FontName: this.allAvalibelFonts,
            Regular: z.string().url(),
            Bold: z.string().url().nullable(),
            Italic: z.string().url().nullable(),
            BoldItalic: z.string().url().nullable(),
        })
    );
    constructor(editor: Editor) {
        this.editor = editor;
    }
    public static getAvalibelFormate = (fontName: z.infer<typeof ThreeDText.allAvalibelFonts>) => {
        const fontUrls = fontsDir.find((data) => {
            return data.FontName === fontName;
        });
        if (!fontUrls) throw Error("no fontUrls fornd for a given name");
        return {
            enableBold: fontUrls.Bold ? true : false,
            enableItalic: fontUrls.Italic ? true : false,
        };
    };
    public static getTextMesh = (textMeshParent: Mesh | AbstractMesh): AbstractMesh => {
        const meshType = (textMeshParent.metadata as MeshMetadata<MeshType>).type;
        if (meshType !== "Text") throw Error("input was not textmesh");
        const textmesh = textMeshParent.getChildren()[0];
        if (textmesh instanceof AbstractMesh || textmesh instanceof Mesh) {
            return textmesh;
        } else {
            throw Error("this is not textmesh");
        }
    };
    public static getFontUrl = (fontName: z.infer<typeof this.allAvalibelFonts>, bold: boolean, italic: boolean) => {
        this.fontDirSchema.parse(fontsDir);
        const fontUrl = fontsDir.find((data) => {
            return data.FontName === fontName;
        });
        if (!fontUrl) throw Error("somthing went wrong with types");

        if (bold && italic) {
            if (fontUrl.BoldItalic === null) throw Error(`BoldItalic font varity dose not exgist on ${fontName} `);
            return fontUrl.BoldItalic;
        } else if (!bold && !italic) {
            return fontUrl.Regular;
        }
        if (bold) {
            if (fontUrl.Bold === null) throw Error(`Bold font varity dose not exgist on ${fontName} `);
            return fontUrl.Bold;
        }
        if (italic) {
            if (fontUrl.Italic === null) throw Error(`italic font varity dose not exgist on ${fontName} `);
            return fontUrl.Italic;
        }
    };
    public static getFontDataFromURL = async (url: string) => {
        return await (await fetch(url)).json();
    };

    private static _createTextMesh = async (
        textInput: string,
        font: { name: z.infer<typeof ThreeDText.allAvalibelFonts>; bold: boolean; Italic: boolean },
        material: StandardMaterial,
        Transform: { scale: Vector3; Rotate: Vector3; Position: Vector3 },
        scene: Scene
    ) => {
        const fontUrl = ThreeDText.getFontUrl(font.name, font.bold, font.Italic);
        if (!fontUrl) throw Error("did not foud the url");
        const fontData = await ThreeDText.getFontDataFromURL(fontUrl);
        const Textmesh = MeshBuilder.CreateText(
            "TextMesh" + textInput,
            textInput,
            fontData,
            {
                size: 2,
                resolution: 64,
                depth: 0.5,
            },
            scene,
            earcut
        );
        if (!Textmesh) throw Error("no textmesh created");
        Textmesh.showBoundingBox = false;
        Textmesh.material = material;
        Textmesh.position = Transform.Position;
        Textmesh.rotation = Transform.Rotate;
        Textmesh.scaling = Transform.scale;
        editor.lightEmitter.shadows.castShadowForMesh(Textmesh, scene);
        return Textmesh;
    };
    public add3DText = async (
        textInput: string,
        uuid: string,
        name: string,
        initialTransform: { scale: Vector3; Rotate: Vector3; Position: Vector3 },
        font: { name: z.infer<typeof ThreeDText.allAvalibelFonts>; bold: boolean; Italic: boolean }
    ) => {
        z.string().uuid().parse(uuid);
        this.editor.afterLoad(async (scene) => {
            const parentNode = new Mesh(name, scene);
            parentNode.id = uuid;
            const metadata: MeshMetadata<"Text"> = {
                isroot: false,
                data: {
                    uuid: uuid,
                    textContent: textInput,
                    font: font,
                },
                tags: ["FocusTarget"],
                allowedSelectionModes: ["position", "rotation", "scale"],
                meshType: null,
                type: "Text",
            };
            parentNode.metadata = metadata;
            const Textmesh = await ThreeDText._createTextMesh(textInput, font, new StandardMaterial(name, scene), initialTransform, scene);
            if (!Textmesh) throw Error("No text mesh created");
            Textmesh.setParent(parentNode);
            this.editor.selector.select(parentNode);
            this.editor.UIeventEmitter.emit("sceneGraphChange", () => {});
        });
    };
    public set3DTextContent = (textnode: Mesh, textContent: string) => {
        const metadata = textnode.metadata as MeshMetadata<"Text">;
        const oldmesh = ThreeDText.getTextMesh(textnode);
        if (!oldmesh.material) throw "No Matrial";
        if (!(oldmesh.material instanceof StandardMaterial)) throw "Not correct Matrial type";
        const oldmat = oldmesh.material.clone(oldmesh.material.name);
        oldmesh.dispose();
        this.editor.afterLoad(async (scene) => {
            const newTextMesh = await ThreeDText._createTextMesh(
                textContent,
                metadata.data.font,
                oldmat,
                {
                    scale: textnode.scaling.clone(),
                    Rotate: textnode.rotationQuaternion ? textnode.rotationQuaternion.toEulerAngles() : textnode.rotation.clone(),
                    Position: textnode.position.clone(),
                },
                scene
            );
            if (!newTextMesh) throw Error("newTextMesh not created");
            (textnode.metadata as MeshMetadata<"Text">).data.textContent = textContent;
            newTextMesh.setParent(textnode);
            this.editor.selector.BoundingBoxGizmo?.updateBoundingBox();
            this.editor.UIeventEmitter.emit("sceneGraphChange", () => {});
        });
    };
    public set3DTextFont = (textnode: Mesh, font: { name: z.infer<typeof ThreeDText.allAvalibelFonts>; bold: boolean; Italic: boolean }) => {
        const metadata = textnode.metadata as MeshMetadata<"Text">;
        const oldmesh = ThreeDText.getTextMesh(textnode);
        if (!oldmesh.material) throw "No Matrial";
        if (!(oldmesh.material instanceof StandardMaterial)) throw "Not correct Matrial type";
        const oldmat = oldmesh.material.clone(oldmesh.material.name);
        oldmesh.dispose();
        this.editor.afterLoad(async (scene) => {
            const newTextMesh = await ThreeDText._createTextMesh(
                metadata.data.textContent,
                font,
                oldmat,
                {
                    scale: textnode.scaling.clone(),
                    Rotate: textnode.rotationQuaternion ? textnode.rotationQuaternion.toEulerAngles() : textnode.rotation.clone(),
                    Position: textnode.position.clone(),
                },
                scene
            );
            if (!newTextMesh) throw Error("newTextMesh not created");
            (textnode.metadata as MeshMetadata<"Text">).data.font = font;
            newTextMesh.setParent(textnode);
            this.editor.selector.BoundingBoxGizmo?.updateBoundingBox();
            this.editor.UIeventEmitter.emit("textChange");
            this.editor.UIeventEmitter.emit("sceneGraphChange", () => {});
        });
    };
}
export type AllAvalibelFonts = z.infer<typeof ThreeDText.allAvalibelFonts>;
