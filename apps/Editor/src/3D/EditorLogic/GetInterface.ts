import { AbstractMesh, Color3, Light, Mesh, Node, PBRMaterial, TransformNode, type StandardMaterial } from "@babylonjs/core";
import { DEFAULT_GRID_ID } from "./BackgroundSystem";
import type { Editor, MeshType } from "./editor";
type Data = {
    name: string;
    type: MeshType;
    ref: {
        uuid: number;
        visible: boolean;
        ref: AbstractMesh;
    };
} | null;

// const a = {
//     items: {
//         root: {
//             index: "root",
//             canMove: true,
//             isFolder: true,
//             children: ["Donut", "Red", "Green", "Blue"],
//             data: "root",
//             meshData: "root",
//             canRename: true,
//         },
//         Donut: {
//             index: "Donut",
//             canMove: true,
//             isFolder: false,
//             data: "Donut",
//             meshData: {
//                 ref: {},
//                 type: "Mesh",
//             },
//             canRename: true,
//         },
//         Red: {
//             index: "Red",
//             canMove: true,
//             isFolder: false,
//             data: "Red",
//             meshData: {
//                 ref: {},
//                 type: "Mesh",
//             },
//             canRename: true,
//         },
//         Green: {
//             index: "Green",
//             canMove: true,
//             isFolder: false,
//             data: "Green",
//             meshData: {
//                 ref: {},
//                 type: "Mesh",
//             },
//             canRename: true,
//         },
//         Blue: {
//             index: "Blue",
//             canMove: true,
//             isFolder: false,
//             data: "Blue",
//             meshData: {
//                 ref: {},
//                 type: "Mesh",
//             },
//             canRename: true,
//         },
//     },
// };

function filterNullValues<T>(array: (T | null)[]): T[] {
    return array.filter((item) => item !== null) as T[];
}

export class GetInterface {
    private editor: Editor;
    constructor(editor: Editor) {
        this.editor = editor;
    }
    public readonly Selected = () => {
        if (!this.editor.selector.selected) return null;
        return this.editor.selector.selected;
    };
    public readonly transform = (mesh: AbstractMesh) => {
        return {
            position: mesh.position.clone(),
            rotation: mesh.rotationQuaternion ? mesh.rotationQuaternion.toEulerAngles() : mesh.rotation.clone(),
            scale: mesh.rotation.clone(),
        } as const;
    };
    public readonly color = (mesh: AbstractMesh) => {
        /**
         * TODO: need to add matrial types
         */
        if (!(mesh.material as StandardMaterial).diffuseColor) {
            console.error("need to be fixed for other then stander matrial");
            return Color3.Blue();
        }

        return (mesh.material as StandardMaterial).diffuseColor.clone();
    };
    public readonly alpha = (mesh: AbstractMesh) => {
        if (!mesh.material) throw Error("no matrial");
        return mesh.material.alpha;
    };
    public readonly getCameraMode = () => {
        if (!this.editor.scene._activeCamera) throw Error("no camera found");
        return this.editor.scene._activeCamera.mode;
    };
    public readonly historyState = () => {
        return {
            undosEnable: this.editor.history.undos.length > 0,
            redosEnable: this.editor.history.redos.length > 0,
        };
    };
    public readonly getMaterialOfMesh = (mesh: AbstractMesh) => {
        if (!mesh.material) throw Error("");
        const meshColor = mesh.material instanceof PBRMaterial ? mesh.material.albedoColor : (mesh.material as StandardMaterial).diffuseColor?.clone();
        const meshTexture = mesh.material instanceof PBRMaterial ? mesh.material.albedoTexture : (mesh.material as StandardMaterial).diffuseTexture?.clone();
        const meshMaterial = meshTexture ? meshTexture : meshColor;
        return meshMaterial;
    };
    public readonly SecenGraphNew = () => {
        type Item = {
            index: string;
            canMove: true;
            isFolder: boolean;
            children: string[];
            data: string;
            meshData: {
                name: string;
                type: MeshType;
                id: string;
                uniqueIdNumber: number;
                ref: Node;
            };
            canRename: true;
        };
        const getNodeType = (node: Node): MeshType => {
            if (node.metadata && node.metadata.type) {
                return node.metadata.type as MeshType;
            } else if (node instanceof AbstractMesh || node instanceof Mesh) {
                return "Mesh";
            } else if (node instanceof TransformNode) {
                return "TransformNode";
            } else {
                return "Mesh";
            }
        };
        /**
         *
         * TODO:this funtions just uses the id to filter , but later it hidden objects should be difind in metadata
         */
        const filter = (node: Node): boolean => {
            if (!node.metadata) return false;
            if (!node.metadata.type) return false;
            if (node.id === DEFAULT_GRID_ID) return false;
            if ((node.metadata.type as MeshType) === "Background") return false;
            if (node.id === "defaultLight" || node.id === "Camera" || node.id === "selection-helper-node") return false;
            if (node instanceof Light) return false;
            return true;
        };
        const nodes = this.editor.scene
            .getNodes()
            .filter(filter)
            .map((node) => {
                const item: Item = {
                    index: node.uniqueId.toString(),
                    canMove: true,
                    isFolder: node.getChildren().filter(filter).length === 0 ? false : true,
                    children: node
                        .getChildren(undefined, true)
                        .filter(filter)
                        .map((node) => node.uniqueId.toString())
                        .sort(),
                    data: node.name,
                    meshData: {
                        name: node.name,
                        type: getNodeType(node),
                        id: node.id,
                        uniqueIdNumber: node.uniqueId,
                        ref: node,
                    },
                    canRename: true,
                };
                return item;
            })
            .sort();

        const result: Record<string, Item> = {
            root: {
                index: "root",
                canMove: true,
                isFolder: true,
                children: this.editor.scene.rootNodes.filter(filter).map((node) => node.uniqueId.toString()),
                data: "root",
                meshData: "root" as unknown as Item["meshData"],
                canRename: true,
            },
        };
        nodes.forEach((node) => {
            result[node.index] = {
                index: node.index,
                canMove: node.canMove,
                isFolder: node.isFolder,
                children: node.children,
                data: node.data,
                meshData: node.meshData,
                canRename: node.canRename,
            };
        });
        console.log({ items: result }, "yoush");
        return { items: result };
    };

    public readonly SecenGraphH = () => {
        type SceneNode = {
            name: string;
            type: MeshType;
            id: string;
            uniqueIdNumber: number;
            ref: Node;
            children: SceneNode[];
        };
        type sceneGraph = SceneNode[];
        const getchild = (nodes: Node[]): sceneGraph => {
            const result: sceneGraph = [];
            nodes.forEach((node) => {
                const nodeData: SceneNode = {
                    name: node.name,
                    children: [],
                    type: "Mesh",
                    id: "",
                    uniqueIdNumber: node.uniqueId,
                    ref: node,
                };
                if (node.getChildren().length === 0) {
                    result.push(nodeData);
                } else {
                    nodeData.children = getchild(node.getChildren());
                    result.push(nodeData);
                }
            });
            return result;
        };
        return getchild(this.editor.scene.rootNodes);
    };
    public readonly SceneGraph = () => {
        const a = this.editor.scene.rootNodes.map((node) => {
            const data: Data = {
                name: node.name,
                type: "Mesh",
                ref: {
                    uuid: node.uniqueId,
                    visible: true,
                    ref: node as AbstractMesh,
                },
            };

            if (node.metadata && node.metadata.type && (node instanceof AbstractMesh || node instanceof Mesh)) {
                data.type = node.metadata.type as MeshType;
                data.name = node.name;
                if (data.type === "Background") return null;
                if (
                    data.type === "Camera" ||
                    data.type === "PointLight" ||
                    data.type === "SpotLight" ||
                    data.type === "DirectionLight" ||
                    data.type === "Mesh" ||
                    data.type === "SpatialAudio"
                ) {
                    return data satisfies Data;
                }
            }
            if (node instanceof AbstractMesh) {
                return data satisfies Data;
            }
            return null;
        });
        return filterNullValues(a);
    };
}
