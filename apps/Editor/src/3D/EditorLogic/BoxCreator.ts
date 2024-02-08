import { AbstractMesh, Matrix, MeshBuilder, Nullable, PointerEventTypes, PointerInfo, Scene, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import { DEFAULT_GRID_ID } from "./BackgroundSystem";
import { EventEmitter } from "./EventEmitter";

const createBox = (node: TransformNode, scene: Scene) => {
    const selectionBox = MeshBuilder.CreateBox("selection-helper", {}, scene);
    selectionBox.isPickable = false;
    selectionBox.parent = node;
    const halfWidth = selectionBox.scaling.x / 2;
    const halfHeight = selectionBox.scaling.y / 2;
    const halfDepth = selectionBox.scaling.z / 2;
    selectionBox.setPivotPoint(new Vector3(halfWidth, halfHeight, halfDepth));
    selectionBox.visibility = 0;
    selectionBox.showBoundingBox = true;
    // selectionBox.billboardMode = 2
    return selectionBox;
};

type BoxCreatorEventMap = {
    started: [];
    ended: [box: Nullable<AbstractMesh>];
};

// const NODE = new TransformNode("selection-helper-node");

/**
 * Class representing a tool for creating and managing a bounding box in a 3D scene.
 *
 * This class enables the creation of a bounding box in a Babylon.js scene. It provides methods to activate or deactivate
 * the box creation mode, set callbacks after the box is rendered, and dispose of created objects. The class uses the scene's
 * pointer observable to detect and handle pointer events for creating and modifying the box. The bounding box is visually
 * represented in the scene and can be manipulated by the user through pointer interactions. The class also handles the
 * visibility and pickability of a grid mesh in the scene.
 *
 * Usage:
 * - Instantiate with a canvas and a scene.
 * - Use `activate` to start the box creation mode.
 * - Use `deactivate` to stop the box creation mode.
 * - Use `setAfterBoxRenderedCallback` to set a callback function after the box is created.
 * - Use `dispose` to clean up and remove the box and related event listeners.
 *
 * @param {HTMLCanvasElement} canvas - The HTML canvas element associated with the scene.
 * @param {Scene} scene - The Babylon.js scene where the bounding box will be created.
 */
export class BoxCreator {
    private scene: Scene;
    private canvas: HTMLCanvasElement;

    private startPoint: Nullable<Vector3> = null;
    private endPoint: Nullable<Vector3> = null;

    private currentBOX: Nullable<AbstractMesh> = null;

    private isActive: boolean = false;

    private selectionBox: AbstractMesh;

    private opacityMaterial: StandardMaterial;

    private node: Nullable<TransformNode> = null;

    private EventSystem = new EventEmitter<BoxCreatorEventMap>();
    private onStartedCallbacks: (() => void)[] = [];
    public onEndedCallbacks: ((box: Nullable<AbstractMesh>) => void)[] = [];

    constructor(canvas: HTMLCanvasElement, scene: Scene) {
        if (this.node) {
            this.node.dispose();
        }
        this.scene = scene;
        this.node = new TransformNode("selection-helper-node", scene);
        this.canvas = canvas;
        this.scene.onPointerObservable.add(this.pointerDown);
        this.scene.onPointerObservable.add(this.pointerMove);
        this.scene.onPointerObservable.add(this.pointerUp);

        this.selectionBox = createBox(this.node, this.scene);

        this.opacityMaterial = new StandardMaterial("bound-cube-material", scene);
        this.opacityMaterial.alpha = 0.5;
    }

    private pointerDown = (pointerInfo: PointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:
                if (this.isActive) {
                    this.currentBOX?.dispose();
                    this.startPoint = pointerInfo?.pickInfo?.pickedPoint || null;
                    this.startPoint && this.selectionBox.position.set(this.startPoint.x, 0.01, this.startPoint.z);
                    this.EventSystem.emit("started");
                }
                break;
        }
    };

    private pointerMove = (pointerInfo: PointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERMOVE:
                if (this.isActive) {
                    const ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, Matrix.Identity(), this.scene._activeCamera);
                    const hit = this.scene.pickWithRay(ray);
                    this.endPoint = hit?.pickedPoint || null;
                    if (!this.startPoint || !this.endPoint) return;
                    const x = Math.abs(this.startPoint.x - this.endPoint.x);
                    const z = Math.abs(this.startPoint.z - this.endPoint.z);
                    const size = Math.max(x, z);
                    const endVector = this.endPoint.subtract(this.startPoint).negate();
                    this.selectionBox.visibility = 0.4;
                    this.selectionBox.position.y = size;
                    this.selectionBox.scaling.set(size * Math.sign(endVector.x), size, size * Math.sign(endVector.z));
                }
                break;
        }
    };

    private pointerUp = (pointerInfo: PointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERUP:
                if (this.isActive) {
                    this.currentBOX = this.createCube(this.startPoint, this.endPoint);
                    if (!this.currentBOX) {
                        this.EventSystem.emit("ended", null);
                        return;
                    }
                    this.selectionBox.visibility = 0;
                    this.deactivate();
                    this.EventSystem.emit("ended", this.currentBOX);
                    this.startPoint = null;
                    this.endPoint = null;
                    // this.dispose();
                }
                break;
        }
    };

    private createCube(startPoint: Nullable<Vector3>, endPoint: Nullable<Vector3>) {
        if (!startPoint || !endPoint) return null;
        const x = Math.abs(startPoint.x - endPoint.x);
        const z = Math.abs(startPoint.z - endPoint.z);
        const size = Math.max(x, z);
        const cube = MeshBuilder.CreateBox("cube", { size }, this.scene);
        const center = this.selectionBox.getBoundingInfo().boundingBox.centerWorld;
        cube.position = center;
        return cube;
    }

    /**
     * Activates the box creation mode in the scene.
     *
     * This method enables the creation of a bounding box by setting up necessary configurations. makes the grid mesh in the scene pickable if present, detaches the scene's active camera
     * control, and sets `isActive` to `true`. If the selection box doesn't exist, it is created.
     */
    public activate = () => {
        const grid = this.scene.getMeshByName(DEFAULT_GRID_ID);
        if (grid) {
            grid.isPickable = true;
        }
        this.scene.activeCamera?.detachControl();
        this.isActive = true;
        if (!this.selectionBox && this.node) {
            this.selectionBox = createBox(this.node, this.scene);
        }
    };

    /**
     * Deactivates the box creation mode in the scene.
     *
     * This method cleans up after the bounding box creation, making the grid mesh in the scene
     * non-pickable if present, attaching the scene's active camera control back, disposing of the created box, and setting
     * `isActive` to `false`. The selection box is also disposed of.
     */
    public deactivate = () => {
        const grid = this.scene?.getMeshByName(DEFAULT_GRID_ID);
        if (grid) {
            grid.isPickable = false;
        }
        this.scene?.activeCamera?.attachControl(this.canvas, false);
        this.isActive = false;
        this.currentBOX?.dispose();
        this.selectionBox?.dispose();
    };

    /**
     * Registers a callback function to be called when the box creation process starts.
     *
     * This method allows for the registration of a callback function that will be executed when the box creation process is initiated.
     * The function is added to a list of callbacks which are called upon the 'started' event.
     *
     * @param {() => void} callback - The callback function to be executed when the box creation starts.
     * @returns {() => void} A function to deregister the provided callback from the 'started' event.
     */
    public onStarted = (callback: () => void) => {
        this.EventSystem.on("started", callback);
        this.onStartedCallbacks.push(callback);
        return () => {
            this.EventSystem.off("started", callback);
        };
    };

    /**
     * Registers a callback function to be called when the box creation process ends.
     *
     * This method allows for the registration of a callback function that will be executed when the box creation process ends.
     * The function is added to a list of callbacks which are called upon the 'ended' event. The created box, if any, is passed
     * as a parameter to the callback.
     *
     * @param {(box: Nullable<AbstractMesh>) => void} callback - The callback function to be executed when the box creation ends.
     *                                                           Receives the created box as a parameter.
     * @returns {() => void} A function to deregister the provided callback from the 'ended' event.
     */
    public onEnded = (callback: (box: Nullable<AbstractMesh>) => void) => {
        this.EventSystem.on("ended", callback);
        this.onEndedCallbacks.push(callback);
        return () => {
            this.EventSystem.off("ended", callback);
        };
    };

    public removeListeners = () => {
        this.onStartedCallbacks.forEach((callback) => {
            this.EventSystem.off("started", callback);
        });
        this.onEndedCallbacks.forEach((callback) => {
            this.EventSystem.off("ended", callback);
        });
    };

    /**
     * Disposes of all resources and event listeners associated with the box creator.
     *
     * This method is used for cleanup, removing all event listeners attached to the scene's pointer observable, disposing
     * of the created box, the opacity material, the selection box, and making the grid mesh in the scene non-pickable if
     * present. It also resets related properties to their initial state.
     */
    public dispose = () => {
        this.deactivate();
        this.isActive = false;
        this.scene.onPointerObservable.removeCallback(this.pointerDown);
        this.scene.onPointerObservable.removeCallback(this.pointerMove);
        this.scene.onPointerObservable.removeCallback(this.pointerUp);
        this.onStartedCallbacks.forEach((callback) => {
            this.EventSystem.off("started", callback);
        });
        this.onEndedCallbacks.forEach((callback) => {
            this.EventSystem.off("ended", callback);
        });
        this.currentBOX?.dispose();
        this.opacityMaterial?.dispose();
        this.selectionBox?.dispose();
        const grid = this.scene.getMeshByName(DEFAULT_GRID_ID);
        if (grid) {
            grid.isPickable = false;
        }
        this.startPoint = null;
        this.endPoint = null;
    };
}
