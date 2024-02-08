import type { AbstractMesh, TransformNode, Vector3 } from "@babylonjs/core";
import { v4 as uuidv4 } from "uuid";
import type { Command, Editor } from "../../editor";

export class SetScalingCommand implements Command {
    private editor: Editor;
    public id: string = uuidv4();
    public type: string = "SetScalingCommand";
    public object: AbstractMesh;
    public oldScaling: Vector3;
    public newScaling: Vector3;
    private objectId: string;

    constructor(editor: Editor, object: AbstractMesh, newScaling: Vector3, oldScaling?: Vector3) {
        this.editor = editor;
        this.object = object;
        this.objectId = object.id;
        this.oldScaling = oldScaling ? oldScaling.clone() : object.scaling.clone(); // Default to identity scaling
        this.newScaling = newScaling.clone();
    }

    execute() {
        const object = this.editor.scene.getNodeById(this.objectId) as AbstractMesh | TransformNode;
        this.editor.transformObject(object || this.object, {
            transform: "Scaling",
            value: this.newScaling,
        });
        this.editor.UIeventEmitter.emit("transformChangeEnd", this.object);
    }

    undo() {
        const object = this.editor.scene.getNodeById(this.objectId) as AbstractMesh | TransformNode;
        this.editor.transformObject(object || this.object, {
            transform: "Scaling",
            value: this.oldScaling,
        });
        this.editor.UIeventEmitter.emit("transformChangeEnd", this.object);
    }
}

export class SetRotationCommand implements Command {
    private editor: Editor;
    public id: string = uuidv4();
    public type: string = "SetRotationCommand";
    public updatable: boolean = true;
    public object: AbstractMesh;
    public oldRotation: Vector3;
    public newRotation: Vector3;
    private objectId: string;

    constructor(editor: Editor, object: AbstractMesh, newRotation: Vector3, oldRotation?: Vector3) {
        this.editor = editor;
        this.object = object;
        this.objectId = object.id;
        const objectRotation = object.rotationQuaternion ? object.rotationQuaternion.toEulerAngles() : object.rotation.clone();
        this.oldRotation = oldRotation ? oldRotation.clone() : objectRotation; // Default to identity rotation
        this.newRotation = newRotation.clone();
    }

    execute() {
        const object = this.editor.scene.getNodeById(this.objectId) as AbstractMesh | TransformNode;
        this.editor.transformObject(object || this.object, {
            transform: "Rotation",
            value: this.newRotation,
        });
        this.editor.UIeventEmitter.emit("transformChangeEnd", object as AbstractMesh);
    }

    undo() {
        const object = this.editor.scene.getNodeById(this.objectId) as AbstractMesh | TransformNode;
        this.editor.transformObject(object || this.object, {
            transform: "Rotation",
            value: this.oldRotation,
        });
        this.editor.UIeventEmitter.emit("transformChangeEnd", object as AbstractMesh);
    }
}

export class SetPositionCommand implements Command {
    private editor: Editor;
    public id: string = uuidv4();
    public type: string = "SetPositionCommand";
    public updatable: boolean = true;
    public object: AbstractMesh;
    public oldPosition: Vector3;
    public newPosition: Vector3;
    private objectId: string;

    constructor(editor: Editor, object: AbstractMesh, newPosition: Vector3, oldPosition?: Vector3) {
        this.editor = editor;
        this.object = object;
        this.objectId = object.id;
        this.oldPosition = oldPosition ? oldPosition.clone() : object.position.clone(); // Set the default old position
        this.newPosition = newPosition.clone();
    }

    execute() {
        const object = this.editor.scene.getNodeById(this.objectId) as AbstractMesh | TransformNode;
        this.editor.transformObject(object || this.object, {
            transform: "Position",
            value: this.newPosition,
        });
        this.editor.UIeventEmitter.emit("transformChangeEnd", this.object);
    }

    undo() {
        const object = this.editor.scene.getNodeById(this.objectId) as AbstractMesh | TransformNode;
        this.editor.transformObject(object || this.object, {
            transform: "Position",
            value: this.oldPosition,
        });
        this.editor.UIeventEmitter.emit("transformChangeEnd", this.object);
    }
}
