import { Nullable, UniversalCamera, Vector3 } from "@babylonjs/core";
import { Editor } from "./editor";

const PAN_SPEED = 0.1;
const DOLLY_SPEED = 1.1; // Adjust the dolly speed as needed
const ZOOM_SPEED = 1.1; // Adjust the zoom speed as needed

export class CameraSystem {
    private editor: Editor;

    private isPanning: boolean = false;
    private initialMousePosition: { x: number; y: number } | null = null;
    private initialCameraPosition: Nullable<Vector3> = null;

    public isPanEnabled: boolean = false;
    public isDollyEnabled: boolean = false;

    constructor(editor: Editor) {
        this.editor = editor;
        this.enablePan();
        this.enableDolly();
    }

    public get camera() {
        return this.editor.scene.activeCamera;
    }

    public enablePan = () => {
        if (!this.isPanEnabled) {
            this.editor.canvas.addEventListener("pointerdown", this.pointerDown);
            this.editor.canvas.addEventListener("pointermove", this.pointerMove);
            this.editor.canvas.addEventListener("pointerup", this.pointerUp);
            this.editor.canvas.addEventListener("blur", this.pointerUp);
        }
        this.isPanEnabled = true;
    };

    public disablePan = () => {
        if (this.isPanEnabled) {
            this.editor.canvas.removeEventListener("pointerdown", this.pointerDown);
            this.editor.canvas.removeEventListener("pointermove", this.pointerMove);
            this.editor.canvas.removeEventListener("pointerup", this.pointerUp);
            this.editor.canvas.addEventListener("blur", this.pointerUp);
        }
        if (this.isPanning) {
            this.editor.scene.activeCamera?.attachControl(this.editor.canvas, false);
            this.isPanning = false;
        }

        this.isPanEnabled = false;
    };

    private pointerDown = (e: PointerEvent) => {
        if (e.button === 2) {
            this.isPanning = true;
            const camera = this.editor.scene.activeCamera as UniversalCamera;
            camera?.detachControl();
            this.initialMousePosition = {
                x: e.clientX,
                y: e.clientY,
            };
            this.initialCameraPosition = camera.position.clone();
        }
    };

    private pointerMove = (e: PointerEvent) => {
        if (this.isPanning) {
            if (this.initialCameraPosition && this.initialMousePosition) {
                const currentX = e.clientX;
                const currentY = e.clientY;

                const deltaX = currentX - this.initialMousePosition.x;
                const deltaY = currentY - this.initialMousePosition.y;

                const camera = this.editor.scene.activeCamera as UniversalCamera;

                const forward = camera.getForwardRay().direction;
                const up = camera.upVector;
                const right = Vector3.Cross(up, forward);
                right.normalize();

                const backward = forward.scale(-1);

                right.scaleInPlace(deltaX * PAN_SPEED);
                backward.scaleInPlace(deltaY * PAN_SPEED);

                const newPos = this.initialCameraPosition.clone();
                newPos.subtractInPlace(right);
                newPos.subtractInPlace(backward);

                camera.position.set(newPos.x, camera.position.y, newPos.z);
            }
        }
    };

    private pointerUp = () => {
        if (this.isPanning) {
            this.editor.scene.activeCamera?.attachControl(this.editor.canvas, false);
            this.isPanning = false;
        }
    };

    public enableDolly = () => {
        !this.isDollyEnabled && this.editor.canvas.addEventListener("wheel", this.dolly);
        this.isDollyEnabled = true;
    };

    public disableDolly = () => {
        this.isDollyEnabled && this.editor.canvas.removeEventListener("wheel", this.dolly);
        this.isDollyEnabled = false;
    };

    // dolly used for the event listener

    private dolly = (e: WheelEvent) => {
        const camera = this.editor.scene.activeCamera as UniversalCamera;

        if (camera && camera.mode === UniversalCamera.ORTHOGRAPHIC_CAMERA) {
            const delta = -Math.sign(e.deltaY);

            let currentScale: number;
            if (camera.orthoTop !== null && camera.orthoBottom !== null) {
                currentScale = camera.orthoTop - camera.orthoBottom;
            } else {
                currentScale = 0;
            }
            const newScale = Math.max(currentScale + delta * ZOOM_SPEED, 0.1); // Ensure a minimum scale

            const center = Vector3.Center(camera.position, camera.getTarget());
            const halfHeight = newScale / 2;
            const halfWidth = (this.editor.scene.getEngine().getAspectRatio(camera) * newScale) / 2;

            // Update orthographic properties
            if (camera.orthoTop !== undefined) {
                camera.orthoTop = center.y + halfHeight;
            }
            if (camera.orthoBottom !== undefined) {
                camera.orthoBottom = center.y - halfHeight;
            }
            if (camera.orthoLeft !== undefined) {
                camera.orthoLeft = center.x - halfWidth;
            }
            if (camera.orthoRight !== undefined) {
                camera.orthoRight = center.x + halfWidth;
            }
        } else if (camera && camera.mode !== UniversalCamera.ORTHOGRAPHIC_CAMERA) {
            // Perspective camera dolly logic (if needed)
            const delta = -Math.sign(e.deltaY);
            const forward = camera.getForwardRay().direction;
            camera.position.addInPlace(forward.scale(delta * DOLLY_SPEED));
        }
    };
}
