import type { AbstractMesh, Nullable, Vector3 } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import { Hotspot } from "../../HotspotSystem";
import type { Command, Editor, HotspotSettingsType } from "../../editor";

export class AddCameraCommand implements Command {
    private editor: Editor;
    private name: string;
    public type: string = "AddCameraCommand";
    private cameraId: Nullable<string> = null;
    private camera: Nullable<Hotspot> = null;
    public id: string = uuidv4();
    constructor(editor: Editor, name: string) {
        this.editor = editor;
        this.name = name;
    }
    public execute = () => {
        if (!this.cameraId) {
            this.cameraId = uuidv4();
        }
        this.camera = this.editor.hotspotSystem.addHotspot(this.cameraId, this.name);
    };
    public undo = () => {
        if (!this.cameraId || !this.camera) return;
        this.editor.hotspotSystem.disposeHotspotByid(this.cameraId);
    };
}

export class RemoveCameraCommand implements Command {
    public type: string = "RemoveCameraCommand";
    public id: string = uuidv4();

    private data: HotspotSettingsType | null = null;
    private editor: Editor;
    private cameraId: string;
    private mesh: AbstractMesh;

    private position: Vector3;
    private rotation: Vector3;

    constructor(editor: Editor, mesh: AbstractMesh) {
        this.editor = editor;
        this.mesh = mesh;
        this.cameraId = mesh.id;
        this.position = mesh.position.clone();
        this.rotation = mesh.rotationQuaternion ? mesh.rotationQuaternion.toEulerAngles() : mesh.rotation.clone();
    }

    public execute = () => {
        if (!this.cameraId) return;
        const hotspot = this.editor.hotspotSystem.getHotspotById(this.cameraId);
        if (!hotspot) return;
        this.data = { ...hotspot.state };
        this.editor.hotspotSystem.disposeHotspotByid(this.cameraId);
    };

    public undo = () => {
        if (!this.cameraId) return;
        const data = this.data || {};
        const specs = { ...data } as HotspotSettingsType;
        const hotspot = this.editor.hotspotSystem.addHotspot(this.cameraId, this.mesh.name, specs.focusLocked, specs.focusedTarget || undefined, specs.mode);
        if (hotspot && this.position && this.rotation) {
            hotspot.onLoaded((hotspotRef) => {
                hotspotRef.setTransformation(this.position, this.rotation);
            });
        }
    };
}

export class AddDuplicateCameraCommand implements Command {
    public type: string = "RemoveCameraCommand";
    public id: string = uuidv4();

    private data: HotspotSettingsType | null = null;
    private editor: Editor;
    private cameraId: string | null = null;
    private mesh: AbstractMesh;

    private position: Vector3;
    private rotation: Vector3;

    constructor(editor: Editor, mesh: AbstractMesh) {
        this.editor = editor;
        this.mesh = mesh;
        const hotspot = this.editor.hotspotSystem.getHotspotById(mesh.id);
        if (hotspot) {
            this.data = { ...hotspot.state };
        }
        this.position = mesh.position.clone();
        this.rotation = mesh.rotationQuaternion ? mesh.rotationQuaternion.toEulerAngles() : mesh.rotation.clone();
    }

    public execute = () => {
        if (!this.cameraId) {
            this.cameraId = uuidv4();
        }
        let hotspot;
        if (this.data) {
            hotspot = this.editor.hotspotSystem.addHotspot(this.cameraId, `${this.mesh.name}_copy`, this.data.focusLocked, this.data.focusedTarget || undefined, this.data.mode);
        } else {
            hotspot = this.editor.hotspotSystem.addHotspot(this.cameraId, `${this.mesh.name}_copy`);
        }
        console.log(hotspot, this.position, this.rotation, "HOTSPOT :Hotspot DUPLICATE by id");
        if (hotspot && this.position && this.rotation) {
            hotspot.onLoaded((hotspotRef) => {
                hotspotRef.setTransformation(this.position, this.rotation);
            });
        }
    };

    public undo = () => {
        if (!this.cameraId) return;
        this.editor.hotspotSystem.disposeHotspotByid(this.cameraId);
    };
}
