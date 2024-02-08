import { AbstractMesh, BoundingBoxGizmo, BoundingInfo, Color3, Matrix, Mesh, PositionGizmo, RotationGizmo, ScaleGizmo, Scene, Vector3, type Nullable } from "@babylonjs/core";
import { SetPositionCommand, SetRotationCommand, SetScalingCommand } from "./commands";
import { Editor, MeshMetadata, MeshType } from "./editor";
import { getParent } from "./utils";

export class DragMovments {
    public editor: Editor;
    constructor(editor: Editor) {
        this.editor = editor;
    }
    public init = () => {
        if (!this.editor.selector.positionGizmo) return;
        if (!this.editor.selector.rotationGizmo) return;
        if (!this.editor.selector.scaleGizmo) return;
        let oldPostion: undefined | Vector3 = undefined;
        let oldRotation: undefined | Vector3 = undefined;
        let oldScale: undefined | Vector3 = undefined;

        //position
        this.editor.selector.positionGizmo.onDragEndObservable.add(() => {
            if (!this.editor.selector.selected) return;

            this.editor.executer(new SetPositionCommand(this.editor, this.editor.selector.selected, this.editor.selector.selected.position.clone(), oldPostion));
            this.editor.UIeventEmitter.emit("transformChange", this.editor.selector.selected);
        });
        this.editor.selector.positionGizmo.onDragStartObservable.add((e) => {
            if (!this.editor.selector.selected) return;
            oldPostion = this.editor.selector.selected.position.clone();
            console.log(e, "postion a");
        });
        //scale
        this.editor.selector.scaleGizmo.onDragEndObservable.add(() => {
            if (!this.editor.selector.selected) return;

            this.editor.executer(new SetScalingCommand(this.editor, this.editor.selector.selected, this.editor.selector.selected.scaling.clone(), oldScale));
            this.editor.UIeventEmitter.emit("transformChange", this.editor.selector.selected);
        });
        this.editor.selector.scaleGizmo.onDragStartObservable.add(() => {
            if (!this.editor.selector.selected) return;
            oldScale = this.editor.selector.selected.scaling.clone();
        });
        //rotation
        this.editor.selector.rotationGizmo.onDragEndObservable.add(() => {
            if (!this.editor.selector.selected) return;

            const selected = this.editor.selector.selected;
            const rotation = selected.rotationQuaternion ? selected.rotationQuaternion.toEulerAngles() : selected.rotation.clone();
            this.editor.executer(new SetRotationCommand(this.editor, this.editor.selector.selected, rotation, oldRotation));
            this.editor.UIeventEmitter.emit("transformChange", this.editor.selector.selected);
        });
        this.editor.selector.rotationGizmo.onDragStartObservable.add(() => {
            if (!this.editor.selector.selected) return;
            oldRotation = this.editor.selector.selected.rotation.clone();
        });
    };
}

class MultiSelect {
    public static calculateBoundingBoxCenter = (meshes: AbstractMesh[], worldMatrix: Matrix) => {
        let min: Nullable<Vector3> = null;
        let max: Nullable<Vector3> = null;

        meshes.forEach((mesh: Mesh | AbstractMesh) => {
            mesh.computeWorldMatrix(true);
            const boundingInfo = mesh.getBoundingInfo();

            if (min === null) {
                min = new Vector3();

                min.copyFrom(boundingInfo.boundingBox.minimumWorld);
            }

            if (max === null) {
                max = new Vector3();
                max.copyFrom(boundingInfo.boundingBox.maximumWorld);
            }

            min.minimizeInPlace(boundingInfo.boundingBox.minimumWorld);
            max.maximizeInPlace(boundingInfo.boundingBox.maximumWorld);
        });

        if (!min || !max) throw "no bounding info";

        const minVec = min as Vector3;
        const maxVec = max as Vector3;

        return new BoundingInfo(minVec, maxVec, worldMatrix).boundingBox.center;
    };

    public static VarifyMultiselectGroup = (MultiSelectGroup: AbstractMesh): boolean => {
        if ((MultiSelectGroup.metadata && (MultiSelectGroup.metadata.type as MeshType)) !== "MultiSelectGroup") return false;
        if (MultiSelectGroup.getDescendants(true).length <= 1) return false;
        return true;
    };
    public static disposeMultiselectGroup = (MultiSelectGroup: AbstractMesh) => {
        if (!MultiSelect.VarifyMultiselectGroup(MultiSelectGroup)) throw Error("input is not MultiSelectGroup");
        (MultiSelectGroup.metadata as MeshMetadata<"MultiSelectGroup">).data.selectedMesh.forEach((selectedMeshData) => {
            selectedMeshData.mesh.setParent(selectedMeshData.prevParent ? selectedMeshData.prevParent : null, true, true);
        });
        MultiSelectGroup.dispose(true, true);
    };
    public static createMultiselectGroup = (scene: Scene, meshesToBeSelected: AbstractMesh[]) => {
        if (!scene._activeCamera) throw Error("no acative camera");
        const MultiselectGroupMesh = new Mesh("MultiselectGroup", scene, undefined);
        MultiselectGroupMesh.id = "MultiselectGroup";
        const meshAllowedMods = meshesToBeSelected
            .filter((mesh) => {
                const metadata = mesh.metadata as MeshMetadata<MeshType>;
                if (!metadata) return false;
                if (!metadata.type) return false;
                if (!metadata.allowedSelectionModes) return false;
                return true;
            })
            .map((mesh) => {
                return (mesh.metadata as MeshMetadata<MeshType>).allowedSelectionModes;
            });
        console.log(meshAllowedMods, "sjb");
        const allowedMode: MeshMetadata<"MultiSelectGroup">["allowedSelectionModes"] = [
            meshAllowedMods.map((modes) => modes[0]).includes(null) ? null : "position",
            meshAllowedMods.map((modes) => modes[1]).includes(null) ? null : "rotation",
            meshAllowedMods.map((modes) => modes[2]).includes(null) ? null : "scale",
        ];
        const selectedMeshs = meshesToBeSelected.map((mesh) => {
            return {
                mesh: mesh,
                uniqueId: mesh.uniqueId,
                prevParent: mesh.parent ? mesh.parent : undefined,
                prevParentUid: mesh.parent?.uniqueId,
            };
        });
        const metadata: MeshMetadata<"MultiSelectGroup"> = {
            isroot: false,
            data: {
                name: "",
                selectedMesh: selectedMeshs,
            },
            tags: [],
            type: "MultiSelectGroup",
            allowedSelectionModes: allowedMode,
            meshType: null,
        };
        MultiselectGroupMesh.metadata = metadata;
        const center = MultiSelect.calculateBoundingBoxCenter(meshesToBeSelected, scene._activeCamera.getWorldMatrix());
        MultiselectGroupMesh.position = center;
        if (MultiselectGroupMesh.rotationQuaternion) {
            MultiselectGroupMesh.rotation = MultiselectGroupMesh.rotationQuaternion.toEulerAngles();
            MultiselectGroupMesh.rotationQuaternion = null;
        }
        meshesToBeSelected.forEach((mesh) => {
            MultiselectGroupMesh.addChild(mesh, true);
        });
        return MultiselectGroupMesh;
    };
    public static getMultiselectMeshes = (MultiSelectGroup: AbstractMesh): AbstractMesh[] => {
        if (!MultiSelect.VarifyMultiselectGroup(MultiSelectGroup)) throw Error("input is not MultiSelectGroup");
        return (MultiSelectGroup.metadata as MeshMetadata<"MultiSelectGroup">).data.selectedMesh.map((data) => {
            return data.mesh;
        });
    };
}

export class Selector {
    private editor: Editor;
    public selected: Nullable<AbstractMesh> = null;
    public static readonly modetype: "position" | "rotation" | "scale";
    private mode: typeof Selector.modetype = "position";
    public positionGizmo: Nullable<PositionGizmo> = null;
    public rotationGizmo: Nullable<RotationGizmo> = null;
    public scaleGizmo: Nullable<ScaleGizmo> = null;
    public BoundingBoxGizmo: Nullable<BoundingBoxGizmo> = null;
    private AvativeGizmo: Nullable<ScaleGizmo | RotationGizmo | PositionGizmo> = null;
    public rootOfSelected: Nullable<Mesh> = null;
    public enable: boolean = true;
    constructor(editor: Editor) {
        this.editor = editor;
    }

    public select = (mesh: AbstractMesh) => {
        if (!this.enable) return;
        if (!mesh.metadata) throw Error("mesh with no meta data can not be selected");
        if (this.selected && !this.selected.metadata) console.error("fvkd");
        if (!this.AvativeGizmo) {
            this.editor.afterLoad(() => {
                this.positionGizmo = new PositionGizmo(this.editor.utilLayer);
                this.rotationGizmo = new RotationGizmo(this.editor.utilLayer);
                this.scaleGizmo = new ScaleGizmo(this.editor.utilLayer);
                this.BoundingBoxGizmo = new BoundingBoxGizmo(Color3.FromHexString("#a9a9a9"), this.editor.utilLayer);
                this.BoundingBoxGizmo.setEnabledScaling(false);
                this.BoundingBoxGizmo.setEnabledRotationAxis("");
                this.AvativeGizmo = this.positionGizmo;
                this.editor.dragMovments.init();
            });
        }
        if (!this.AvativeGizmo) return;
        //{ console.error(`no meta data found on this mesh ${mesh}`)};

        this.rootOfSelected = getParent(mesh) as Mesh;
        if (this.BoundingBoxGizmo) {
            this.BoundingBoxGizmo.attachedMesh = mesh;
        }
        this.AvativeGizmo.attachedMesh = mesh;
        this.AvativeGizmo.updateGizmoPositionToMatchAttachedMesh = true;
        this.AvativeGizmo.updateGizmoRotationToMatchAttachedMesh = false;
        if (this.selected) {
            if (MultiSelect.VarifyMultiselectGroup(this.selected) && !MultiSelect.VarifyMultiselectGroup(mesh)) {
                if (this.selected.uniqueId !== mesh.uniqueId) {
                    MultiSelect.disposeMultiselectGroup(this.selected);
                }
            }
        }

        this.selected = mesh;
        this.selected.onAfterWorldMatrixUpdateObservable.add(() => {
            this.editor.UIeventEmitter.emit("transformChange", this.selected);
        });
        this.editor.UIeventEmitter.emit("selectedChange", () => {});
    };
    public deselect = () => {
        if (!this.enable) return;
        if (!this.AvativeGizmo) return;
        if (this.selected) {
            if (MultiSelect.VarifyMultiselectGroup(this.selected)) {
                MultiSelect.disposeMultiselectGroup(this.selected);
            }
        }
        if (this.BoundingBoxGizmo) {
            this.BoundingBoxGizmo.attachedMesh = null;
        }
        this.AvativeGizmo.attachedMesh = null;
        this.selected = null;
        this.rootOfSelected = null;
        this.editor.UIeventEmitter.emit("selectedChange", () => {});
    };
    public toggleMode = (mode: typeof this.mode) => {
        if (!this.enable) return;

        switch (mode) {
            case "position":
                if (!this.AvativeGizmo) return;

                this.AvativeGizmo.attachedMesh = null;
                this.AvativeGizmo = this.positionGizmo;
                if (this.selected) this.select(this.selected);

                //   handlePosition();
                break;

            case "rotation":
                if (!this.AvativeGizmo) return;
                this.AvativeGizmo.attachedMesh = null;
                this.AvativeGizmo = this.rotationGizmo;
                if (this.selected) this.select(this.selected);

                //   handleRotation();
                break;

            case "scale":
                if (!this.AvativeGizmo) return;
                this.AvativeGizmo.attachedMesh = null;
                this.AvativeGizmo = this.scaleGizmo;
                if (this.selected) this.select(this.selected);

                //   handleScale();
                break;

            default:
                console.error("Invalid mode:", this.mode);
        }
    };
    public selectMultiple = (meshs: AbstractMesh[]) => {
        if (!this.enable) return;
        if (meshs.length === 0) throw Error("need to provide more than 1 AbstractMesh");
        this.editor.afterLoad((scene) => {
            this.deselect();
            const oldmesh = scene.getMeshById("MultiselectGroup");
            if (oldmesh) {
                MultiSelect.disposeMultiselectGroup(oldmesh);
            }
            const selectionGroup = MultiSelect.createMultiselectGroup(scene, meshs);
            this.select(selectionGroup);
        });

        console.log(meshs, "hcvssc");
    };
}
