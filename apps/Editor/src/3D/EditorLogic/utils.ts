import {
    AbstractMesh,
    BoundingInfo,
    Color3,
    Mesh,
    MeshBuilder,
    Node,
    Nullable,
    Quaternion,
    Scene,
    TransformNode,
    UniversalCamera,
    UtilityLayerRenderer,
    Vector3,
} from "@babylonjs/core";
import gsap from "gsap";
import { Editor, Link } from "./editor";

export type GetReturnType<T extends (...args: unknown[]) => unknown> = ReturnType<T>;
export const BOX_COLOR = Color3.FromHexString("#3d75f3");

/**
 * Retrieves the topmost parent of a given 3D object in a scene hierarchy.
 *
 * This function traverses up the scene graph starting from the provided 3D object (_3DObject) until it reaches the topmost parent.
 * If the provided object has no parent, it returns the object itself. The function is compatible with AbstractMesh, Mesh, and Node
 * types from a 3D graphics library like Babylon.js.
 *
 * @param {AbstractMesh | Mesh | Node} _3DObject - The starting 3D object from which to find the topmost parent.
 * @returns {AbstractMesh | Mesh | Node} The topmost parent of the provided 3D object. If the object has no parent, returns the object itself.
 *
 * @example
 * // Assuming '_3DObject' is an instance of AbstractMesh, Mesh, or Node
 * let topParent = getParent(_3DObject);
 * console.log(topParent); // Logs the topmost parent or the object itself if it has no parent.
 */
export function getParent(_3DObject: AbstractMesh | Mesh | Node) {
    let child = _3DObject;
    let parent;
    do {
        if (child?.parent === null) {
            parent = _3DObject;
            break;
        } else {
            parent = child?.parent;
            child = parent;
        }
    } while (child?.parent !== null);
    return parent;
}

export const calculateBoundingBox = (rootNode: Mesh | AbstractMesh) => {
    let min: Nullable<Vector3> = null;
    let max: Nullable<Vector3> = null;

    rootNode.getChildMeshes().forEach((mesh: Mesh | AbstractMesh) => {
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

    if (!min || !max) return null;

    const minVec = min as Vector3;
    const maxVec = max as Vector3;

    return { min: minVec, max: maxVec };
};

/**
 * Calculates the composite bounding box for a given root node and its child meshes in a scene.
 *
 * This function iterates through all child meshes of the provided root node, computes their world matrices,
 * and determines the minimum and maximum points of their bounding boxes. It then creates a composite bounding box
 * that encompasses all these child meshes. This bounding box is represented by a set of lines connecting the corners
 * of the bounding box.
 *
 * @param {Mesh | AbstractMesh} rootNode - The root node for which the composite bounding box is calculated.
 *                                         This can be a Mesh or an AbstractMesh.
 * @param {Scene} scene - The scene to which the root node belongs. This is used for creating the line system
 *                        that represents the bounding box.
 * @returns {Mesh} Returns a Mesh object representing the lines of the bounding box if the min and max vectors are valid.
 *                 Otherwise, returns the rootNode itself.
 *
 * @example
 * // Assuming 'rootNode' is a Mesh or AbstractMesh and 'scene' is a Babylon.js Scene
 * let boundingBoxLines = calculateCompositeBoundingBox(rootNode, scene);
 * scene.addMesh(boundingBoxLines);
 */
export function calculateCompositeBoundingBox(rootNode: Mesh | AbstractMesh, scene: Scene) {
    let min: Nullable<Vector3> = null;
    let max: Nullable<Vector3> = null;

    rootNode.getChildMeshes().forEach((mesh: Mesh | AbstractMesh) => {
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

    if (!min || !max) return rootNode;

    const minVec = min as Vector3;
    const maxVec = max as Vector3;

    const corners = [
        new Vector3(minVec.x, minVec.y, minVec.z),
        new Vector3(maxVec.x, minVec.y, minVec.z),
        new Vector3(minVec.x, maxVec.y, minVec.z),
        new Vector3(maxVec.x, maxVec.y, minVec.z),
        new Vector3(minVec.x, minVec.y, maxVec.z),
        new Vector3(maxVec.x, minVec.y, maxVec.z),
        new Vector3(minVec.x, maxVec.y, maxVec.z),
        new Vector3(maxVec.x, maxVec.y, maxVec.z),
    ];

    // Edges connecting the corners
    const lines = [];
    // Bottom
    lines.push([corners[0], corners[1]]);
    lines.push([corners[1], corners[5]]);
    lines.push([corners[5], corners[4]]);
    lines.push([corners[4], corners[0]]);
    // Top
    lines.push([corners[2], corners[3]]);
    lines.push([corners[3], corners[7]]);
    lines.push([corners[7], corners[6]]);
    lines.push([corners[6], corners[2]]);
    // Sides
    lines.push([corners[0], corners[2]]);
    lines.push([corners[1], corners[3]]);
    lines.push([corners[4], corners[6]]);
    lines.push([corners[5], corners[7]]);

    const boundingBoxLines = MeshBuilder.CreateLineSystem(
        "bboxLines",
        {
            lines: lines,
            updatable: false,
        },
        scene
    );

    boundingBoxLines.color = BOX_COLOR;

    boundingBoxLines.doNotSerialize = true;

    return boundingBoxLines;
}

/**
 * Overrides the default behavior of showing the bounding box for a mesh in a scene.
 *
 * This function adds custom properties to the mesh object for controlling the visibility of its bounding box.
 * It uses `Object.defineProperty` to define `showBoundingBox` and `customBoundingBox` properties on the mesh.
 * The `showBoundingBox` property controls the visibility of the bounding box, while `customBoundingBox`
 * holds the reference to the bounding box mesh created by `calculateCompositeBoundingBox`.
 *
 * @param {Mesh} mesh - The mesh for which the bounding box visibility is to be overridden.
 * @param {Scene} scene - The scene to which the mesh belongs. This is used for creating the custom bounding box.
 *
 * @example
 * // Assuming 'mesh' is a Babylon.js Mesh and 'scene' is a Babylon.js Scene
 * overrideShowBoundingBoxForMesh(mesh, scene);
 *
 * // To show the custom bounding box
 * mesh.showBoundingBox = true;
 *
 * // To hide the custom bounding box
 * mesh.showBoundingBox = false;
 */
export function overrideShowBoundingBoxForMesh(mesh: Mesh, parentNode: Node, layer: UtilityLayerRenderer) {
    // Private property to store the state
    mesh._showBoundingBox = false;

    Object.defineProperty(mesh, "utilityLayer", {
        get: function () {
            return this._utilityLayer;
        },
        set: function (value) {
            this._utilityLayer = value;
        },
    });

    Object.defineProperty(mesh, "showBoundingBox", {
        get: function () {
            return this._showBoundingBox;
        },
        set: function (value) {
            this._showBoundingBox = value;
            if (value) {
                if (!this._customBoundingBox) {
                    this._customBoundingBox = calculateCompositeBoundingBox(this, layer.utilityLayerScene);
                    this._customBoundingBox.setParent(parentNode);
                }
                this._customBoundingBox.visibility = 1;
            } else {
                // Hide custom bounding box
                if (this._customBoundingBox) {
                    this._customBoundingBox.visibility = 0;
                }
            }
        },
    });

    Object.defineProperty(mesh, "customBoundingBox", {
        get: function () {
            return this._customBoundingBox;
        },
        set: function (value) {
            if (this._customBoundingBox) {
                this._customBoundingBox.dispose();
            }
            if (value) {
                this._customBoundingBox = calculateCompositeBoundingBox(this, layer.utilityLayerScene);
                this._customBoundingBox.setParent(parentNode);
                this._customBoundingBox.visibility = this._showBoundingBox;
            }
        },
    });
}

export function overrideShowBoundingBoxForNode(node: TransformNode, parentNode: Node, layer: UtilityLayerRenderer) {
    // Private property to store the state
    Object.defineProperty(node, "utilityLayer", {
        get: function () {
            return this._utilityLayer;
        },
        set: function (value) {
            this._utilityLayer = value;
        },
    });

    Object.defineProperty(node, "boundingBoxIsDirty", {
        get: function () {
            return this._boundingBoxIsDirty;
        },
        set: function (value) {
            this._boundingBoxIsDirty = value;
        },
    });

    Object.defineProperty(node, "showBoundingBox", {
        get: function () {
            return this._showBoundingBox;
        },
        set: function (value) {
            this._showBoundingBox = value;
            if (value) {
                this._customBoundingBox?.dispose();
                this._customBoundingBox = calculateCompositeBoundingBox(this, layer.utilityLayerScene);
                this._customBoundingBox.setParent(parentNode);
                this._customBoundingBox.visibility = 1;
            } else {
                if (this._customBoundingBox) {
                    this._customBoundingBox.visibility = 0;
                }
            }
        },
    });
}

/**
 * Performs linear interpolation between two values.
 *
 * Linear interpolation is the process of finding a value that is a certain
 * percentage of the way between two given values. This function will return
 * the value that is `t` percent of the way between `a` and `b`.
 *
 * @param {number} a - The start value.
 * @param {number} b - The end value.
 * @param {number} t - The interpolation factor, a number between 0 and 1.
 * @returns {number} The interpolated value.
 */
export function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

/**
 * Retrieves an ancestor node at a specific level in the hierarchy of the given node.
 *
 * This function starts from the provided node and traverses up its parent hierarchy. It returns either the root node, if the specified level is 0, or an ancestor node at the given level. If the level specified is higher than the depth of the node's hierarchy, or if the input node is invalid, it returns null.
 *
 * @param {Mesh | AbstractMesh | Node} node - The starting node from which to find the ancestor.
 * @param {number} level - The level of the ancestor to retrieve. If 0, the root node is returned.
 * @returns {Mesh | AbstractMesh | Node | null} The ancestor node at the specified level, or null if it doesn't exist or the level is invalid.
 */
export function getAncestorAtLevel(node: Mesh | AbstractMesh | Node, level: number) {
    // Check if the node is valid
    if (!node) {
        return null;
    }

    let currentNode = node;
    let currentLevel = 0;

    // Traverse up the hierarchy to find the root or the specified level
    while (currentNode.parent) {
        currentNode = currentNode.parent;
        currentLevel++;
    }

    // If level is 0, return the root node
    if (level === 0) {
        return currentNode;
    }

    // Calculate the target level from the root
    const targetLevel = currentLevel - level;

    // Check if the level is valid
    if (targetLevel < 0) {
        return null;
    }

    // Reset to the original node
    currentNode = node;

    // Traverse down to the target level
    for (let i = 0; i < targetLevel; i++) {
        if (!currentNode.parent) {
            return null; // In case the hierarchy is shorter than expected
        }
        currentNode = currentNode.parent;
    }

    return currentNode;
}

/**
 * Collects and returns all ancestor nodes of a given mesh in their hierarchical order.
 *
 * Starting from the specified mesh, this function traverses up the mesh's parent hierarchy. It gathers all ancestor nodes in an array, ordered from the closest ancestor to the furthest. If the given mesh has no ancestors, an empty array is returned.
 *
 * @param {Mesh} mesh - The mesh whose ancestors are to be traced.
 * @returns {Mesh[]} An array of Mesh objects representing the ancestors of the given mesh, in order from nearest to furthest ancestor.
 */
export function traceAncestors(mesh: Mesh) {
    const ancestors = [];
    let currentMesh = mesh;

    // Traverse up the hierarchy
    while (currentMesh.parent) {
        ancestors.unshift(currentMesh.parent);
        currentMesh = currentMesh.parent as Mesh;
    }

    return ancestors;
}

/**
 * Searches for a target mesh within an array of ancestor meshes and returns its index.
 *
 * This function iterates through the provided array of ancestor meshes to find the target mesh. If found, it returns the index of the target mesh within the array. If the target mesh is not present in the array, the function returns -1.
 *
 * Note: The index returned is relative to the order of meshes in the ancestorMeshes array, not their hierarchical level.
 *
 * @param {Mesh} targetMesh - The mesh to search for in the array of ancestors.
 * @param {Mesh[]} ancestorMeshes - An array of Mesh objects representing ancestors in which to search for the target mesh.
 * @returns {number} The index of the target mesh in the ancestorMeshes array, or -1 if not found.
 */
export function findMeshInAncestors(targetMesh: Mesh, ancestorMeshes: Mesh[]) {
    // Check if the target mesh exists in the array of ancestor meshes
    let level = -1;
    for (let i = 0; i < ancestorMeshes.length; i++) {
        if (ancestorMeshes[i] === targetMesh) {
            level = i;
            return i;
        }
    }
    // Mesh not found, return -1
    return level;
}

/**
 * Finds the closest common ancestor between two sets of ancestor meshes of a given mesh.
 *
 * This function compares two arrays of ancestor meshes to find the closest common ancestor. If the arrays are of equal length and have the same last element, the function returns the given mesh itself as the common ancestor. Otherwise, it iterates through both arrays to find the first matching ancestor. If no common ancestor is found, the function returns null.
 *
 * @param {Mesh[]} ancestors1 - The first array of ancestor meshes.
 * @param {Mesh[]} ancestors2 - The second array of ancestor meshes.
 * @param {Mesh} mesh - The mesh for which common ancestors are being sought.
 * @returns {Mesh | null} The closest common ancestor Mesh if found, or null if no common ancestor exists.
 */
export function findClosestCommonAncestor(ancestors1: Mesh[], ancestors2: Mesh[], mesh: Mesh) {
    if (ancestors1.length === ancestors2.length) {
        if (ancestors1[ancestors1.length - 1] === ancestors2[ancestors2.length - 1]) {
            return mesh;
        }
    }

    for (let i = ancestors1.length - 1; i >= 0; i--) {
        for (let j = ancestors2.length - 1; j >= 0; j--) {
            if (ancestors1[i] === ancestors2[j]) {
                return ancestors1[i]; // or ancestors2[j], they are the same
            }
        }
    }
    return null; // No common ancestor found
}

export const handleUnsupportedFormat = (link: Link, extension: string) => {
    console.warn(`Unsupported file format: .${extension}`);
    URL.revokeObjectURL(link.fileName);
};

export const onError = (scene: Scene, message: string) => {
    console.log("Error while loading a file :", message);
    console.log(scene);
};

/**
 * Wraps a given mesh inside a bounding box.
 *
 * This function resets the position and rotation of the mesh to calculate its bounding dimensions and positions.
 * It creates a bounding box that encompasses the mesh and ensures that the box's scaling is non-zero to avoid undefined behavior.
 * The original position and rotation of the mesh are restored, and the mesh is then added as a child to the bounding box.
 * The visibility of the bounding box is set to 0 before returning it.
 *
 * @param {AbstractMesh} mesh - The mesh to be wrapped in the bounding box.
 * @returns {Mesh} The bounding box containing the mesh.
 */
export const wrapInBoundingBox = (mesh: AbstractMesh) => {
    const Epsilon = 0.001;
    // Reset position to get bounding box from origin with no rotation
    if (!mesh.rotationQuaternion) {
        mesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(mesh.rotation.y, mesh.rotation.x, mesh.rotation.z);
    }
    const oldPos = mesh.position.clone();
    const oldRot = mesh.rotationQuaternion.clone();
    mesh.rotationQuaternion.set(0, 0, 0, 1);
    mesh.position.set(0, 0, 0);
    // Update bounding dimensions/positions
    const box = MeshBuilder.CreateBox("box", { size: 1 }, mesh.getScene());
    const boundingMinMax = mesh.getHierarchyBoundingVectors();
    boundingMinMax.max.subtractToRef(boundingMinMax.min, box.scaling);
    // Adjust scale to avoid undefined behavior when adding child
    if (box.scaling.y === 0) {
        box.scaling.y = Epsilon;
    }
    if (box.scaling.x === 0) {
        box.scaling.x = Epsilon;
    }
    if (box.scaling.z === 0) {
        box.scaling.z = Epsilon;
    }
    box.position.set((boundingMinMax.max.x + boundingMinMax.min.x) / 2, (boundingMinMax.max.y + boundingMinMax.min.y) / 2, (boundingMinMax.max.z + boundingMinMax.min.z) / 2);
    // Restore original positions
    mesh.addChild(box);
    mesh.rotationQuaternion.copyFrom(oldRot);
    mesh.position.copyFrom(oldPos);
    // Reverse parenting
    mesh.removeChild(box);
    box.addChild(mesh);
    box.visibility = 0;
    return box;
};

/**
 * Fits a given mesh (GLB root mesh) within a specified bounding box.
 *
 * This function first wraps the provided GLB root mesh in a new bounding box using the `wrapInBoundingBox` function.
 * If no target box is provided, the function returns without further action.
 * It calculates the bounding vectors of the new root mesh and determines its size.
 * The function then computes the scale factor necessary to fit the GLB root mesh within the dimensions of the target box.
 * The GLB root mesh is scaled accordingly and positioned at the target box's position.
 * After scaling and positioning, the original GLB root mesh is removed from the new root and the new root is disposed.
 *
 * Note: The function does not return any value.
 *
 * @param {AbstractMesh} glbRootMesh - The GLB root mesh to be fitted inside the bounding box.
 * @param {AbstractMesh} [box] - The target bounding box within which to fit the GLB root mesh. If not provided, no action is taken.
 */
export const fitMeshInBox = (glbRootMesh: AbstractMesh, box?: AbstractMesh) => {
    const newRoot = wrapInBoundingBox(glbRootMesh);

    if (!box) return;

    const boundingBox = newRoot.getHierarchyBoundingVectors(true);
    const glbSize = boundingBox.max.subtract(boundingBox.min);

    // Get the size of the target box
    const boxSize = box.getBoundingInfo().boundingBox.extendSize.scale(2);

    // Calculate the scale factor for each axis
    const scaleFactor = Math.min(boxSize.x / glbSize.x, boxSize.y / glbSize.y, boxSize.z / glbSize.z);

    // Apply the scale to the GLB root mesh
    newRoot.scaling.scaleInPlace(scaleFactor);
    const p = box.position;
    newRoot.position.set(p.x, p.y, p.z);
    newRoot.removeChild(glbRootMesh);
    newRoot.dispose();
};

/**
 * Makes a given mesh and its child meshes uninteractive by setting their visibility to 0 and disabling pickability.
 *
 * @param {AbstractMesh} mesh - The main mesh to make uninteractive.
 * @param {boolean} [wholeFamily=true] - A flag indicating whether to make the entire family of child meshes uninteractive.
 *                                      If set to true, it includes all child meshes; if false, only the main mesh is affected.
 *
 * @returns {void}
 */
export const makeMeshUninteractive = (mesh: AbstractMesh, wholeFamily: boolean = true) => {
    const childMeshes = wholeFamily ? mesh.getChildMeshes() : [mesh];

    childMeshes.forEach((child) => {
        child.visibility = 0;
        child.isPickable = false;
    });
    mesh.isPickable = false;
    // mesh.visibility = 0
    // console.log("INTERACTIVE : FALSE", mesh);
};

/**
 * Makes a given mesh and its child meshes interactive by setting their visibility to 1 and enabling pickability.
 *
 * @param {AbstractMesh} mesh - The main mesh to make interactive.
 * @param {boolean} [wholeFamily=true] - A flag indicating whether to make the entire family of child meshes interactive.
 *                                      If set to true, it includes all child meshes; if false, only the main mesh is affected.
 *
 * @returns {void}
 */
export const makeMeshInteractive = (mesh: AbstractMesh, wholeFamily: boolean = true) => {
    const childMeshes = wholeFamily ? mesh.getChildMeshes() : [mesh];
    childMeshes.forEach((child) => {
        child.visibility = 1;
        child.isPickable = true;
    });
    mesh.isPickable = true;
    // console.log("INTERACTIVE : TRUE", mesh);
};

/**
 * Clones a given mesh's material, creating a copy with a modified name.
 * @param {Mesh} mesh - The mesh whose material is to be cloned.
 */
function cloneMaterial(mesh: Mesh) {
    if (mesh.material) {
        mesh.material = mesh.material.clone(mesh.material.name + "_clone");
    }
}

/**
 * Clones a node hierarchy, including any meshes and their materials. It supports cloning of different node types (including meshes),
 * and can optionally set a new parent for the cloned hierarchy.
 * @param {Node | Mesh} node - The root node of the hierarchy to be cloned.
 * @param {Nullable<Node | Mesh>} newParent - Optional. The new parent for the cloned node hierarchy. Defaults to null.
 * @returns {Nullable<Node | Mesh>} The cloned node hierarchy's root node.
 */
export function cloneNodeHierarchy(node: Node | Mesh, newParent: Nullable<Node | Mesh> = null, name: Nullable<string>) {
    let clonedNode: Nullable<Node | Mesh>;

    if (node instanceof Mesh) {
        // Clone the mesh
        clonedNode = node.clone(name ? name : node.name + "_copy", newParent, true);
        cloneMaterial(clonedNode as Mesh);
    } else {
        // Clone other types of nodes
        clonedNode = node.clone(name ? name : node.name + "_copy", newParent, true);
    }

    // Clone all child nodes
    node.getChildren().forEach((child) => {
        cloneNodeHierarchy(child, clonedNode, null);
    });

    return clonedNode;
}

/**
 * Clamps a value between a new min and max range, mapping it from an original min and max range.
 * @param value - The value to clamp and map
 * @param newMin - The new minimum value to clamp to
 * @param newMax - The new maximum value to clamp to
 * @param originalMin - The original minimum value to map from
 * @param originalMax - The original maximum value to map from
 * @returns The clamped and mapped value
 */
export function clampBetweenRange(value: number, newMin: number, newMax: number, originalMin: number = 0, originalMax: number = 100) {
    // First, clamp the value to the range 0-100
    const clampedValue = Math.max(originalMin, Math.min(originalMax, value));

    //get the mapped value
    const mappedValue = newMin + ((clampedValue - originalMin) / (originalMax - originalMin)) * (newMax - newMin);

    return mappedValue;
}

/**
 * Converts a value to a percentage based on a min and max range.
 *
 * @param value - The input value to convert.
 * @param originalMin - The minimum value of the original range.
 * @param originalMax - The maximum value of the original range.
 * @returns The input value converted to a percentage of the original range.
 */
export function convertToPercentage(value: number, originalMin: number, originalMax: number) {
    return ((value - originalMin) / (originalMax - originalMin)) * 100;
}
//get count of existing objects
export const getExistingObjectsCount = (editor: Editor, type: string) => {
    const existingObjects = editor.scene.rootNodes.filter((mesh) => mesh.name.includes(type));
    return existingObjects.length;
};

export const addNamesWithIncrement = (editor: Editor, baseName: string) => {
    const count = getExistingObjectsCount(editor, baseName);
    return count > 0 ? `${baseName}${count}` : baseName; // increments the name on every addition
};

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    // Visually indicate download to the user (optional)
    link.style.display = "none"; // Hide the link element
    document.body.appendChild(link); // Add it to the DOM
    link.click();

    document.body.removeChild(link); // Remove the link element
    URL.revokeObjectURL(url); // Revoke the temporary URL
}
export const toDegree = (radAngle: number) => {
    return (radAngle * 180) / Math.PI;
};

export const TAGS = {
    HOTSPOT: "Hotspot",
    SCREEN: "Screen",
    BACKGROUND: "Background",
    SPATIALAUDIO: "SpatialAudio",
};

export function jsonToFile(jsonData: { [key: string]: unknown }) {
    const jsonString = JSON.stringify(jsonData);
    console.log(jsonString, "JSONDATA");
    const blob = new Blob([jsonString], { type: "application/json" });

    const file = new File([blob], "scene.json", { type: "application/json" });

    return file;
}

export function dataURLtoImageFile(dataurl: string) {
    const parts = dataurl.split(",");
    const base64Data = parts[1];
    const contentType = parts[0].split(":")[1].split(";")[0];

    const binaryStr = atob(base64Data);

    const length = binaryStr.length;
    const uint8Array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        uint8Array[i] = binaryStr.charCodeAt(i);
    }

    const blob = new Blob([uint8Array], { type: contentType });
    return new File([blob], "scene.png", { type: "image/png" });
}

export const DUMMYSCENEID = "1501491e-1ae3-4978-b27b-7980c481a0d7";

export function getCurrentQueryParams(url?: string) {
    const queryParams = new URLSearchParams(url || window.location.search);
    const params: { [key: string]: string } = {};
    for (const [key, value] of queryParams) {
        params[key] = value;
    }
    return params;
}

export function hasPublishInUrl(url: string) {
    const parsedUrl = new URL(url);

    const pathname = parsedUrl.pathname;

    return pathname.startsWith("/publish");
}

export const retry = <T, Args extends unknown[]>(fn: (...args: Args) => Promise<T>, maxRetries: number, delay: number): ((...args: Args) => Promise<T>) => {
    return (...args: Args) =>
        new Promise<T>((resolve, reject) => {
            let retries = 0;
            const tryIt = () => {
                fn(...args)
                    .then(resolve)
                    .catch((error) => {
                        if (++retries > maxRetries) {
                            reject(error);
                        } else {
                            setTimeout(tryIt, delay);
                        }
                    });
            };
            tryIt();
        });
};

type FAILED_TASK_DATA_TYPE = {
    taskFunction: () => Promise<unknown>;
    onResolve?: (value: unknown) => void;
    onReject?: (value: unknown) => void;
};
export class PromiseTaskManager {
    private taskFunctions: Array<() => Promise<unknown>> = [];

    private onWorkDoneCallback: ((state: "SUCCESSFUL" | "FAILED") => void)[] = [];

    public inProgress = false;

    private failedTaskFunctions: Array<FAILED_TASK_DATA_TYPE> = [];

    public addTask(taskFunc: () => Promise<unknown>, onResolve?: (value: unknown) => void, onReject?: (value: unknown) => void): void {
        this.inProgress = true;

        const wrappedPromiseFunc = () => {
            const promise = taskFunc();
            this.taskFunctions.push(wrappedPromiseFunc);

            return promise
                .then((result) => {
                    const index = this.taskFunctions.indexOf(wrappedPromiseFunc);
                    if (index > -1) {
                        this.taskFunctions.splice(index, 1);
                    }

                    if (onResolve) {
                        onResolve(result);
                    }

                    if (this.taskFunctions.length === 0 && this.failedTaskFunctions.length === 0) {
                        this.onWorkDoneCallback.forEach((callback) => {
                            callback("SUCCESSFUL");
                        });
                        this.inProgress = false;
                    } else if (this.taskFunctions.length === 0 && this.failedTaskFunctions.length !== 0) {
                        this.inProgress = false;
                        this.onWorkDoneCallback.forEach((callback) => {
                            callback("FAILED");
                        });
                    }

                    return result;
                })
                .catch((error) => {
                    //push failed task to failedTask array
                    this.failedTaskFunctions.push({ taskFunction: wrappedPromiseFunc, onResolve, onReject });

                    //remove task from task array
                    const index = this.taskFunctions.indexOf(wrappedPromiseFunc);
                    if (index > -1) {
                        this.taskFunctions.splice(index, 1);
                    }

                    if (this.taskFunctions.length === 0 && this.failedTaskFunctions.length !== 0) {
                        this.inProgress = false;
                        this.onWorkDoneCallback.forEach((callback) => {
                            callback("FAILED");
                        });
                    }

                    onReject && onReject(error);
                });
        };

        wrappedPromiseFunc();
    }

    public retryFailedTasks(onWorkDoneCallback?: (state: "SUCCESSFUL" | "FAILED") => void): () => void {
        if (this.failedTaskFunctions.length === 0) {
            onWorkDoneCallback && onWorkDoneCallback("SUCCESSFUL");
            return () => {};
        }
        // Reset failed tasks
        const retryingTasks = [...this.failedTaskFunctions];
        this.failedTaskFunctions = [];

        retryingTasks.forEach((task) => {
            this.addTask(task.taskFunction, task.onResolve, task.onReject);
        });

        if (onWorkDoneCallback) {
            return this.setOnWorkDoneCallback(onWorkDoneCallback);
        }
        return () => {};
    }

    public setOnWorkDoneCallback(callback: (state: "SUCCESSFUL" | "FAILED") => void): () => void {
        this.onWorkDoneCallback.push(callback);

        return () => {
            this.onWorkDoneCallback.filter((value) => value !== callback);
        };
    }
}

export function zoomCameraToMesh(camera: UniversalCamera, mesh: AbstractMesh) {
    const boundingVecs = mesh.getHierarchyBoundingVectors(true);
    const center = new Vector3((boundingVecs.max.x + boundingVecs.min.x) / 2, (boundingVecs.max.y + boundingVecs.min.y) / 2, (boundingVecs.max.z + boundingVecs.min.z) / 2);
    const bounds = new BoundingInfo(boundingVecs.min, boundingVecs.max);
    const centerW = bounds.boundingSphere.centerWorld;
    // Point the camera towards the mesh and store the target rotation
    const originalPosition = camera.position.clone();
    const originalRotation = camera.rotation.clone();
    camera.setTarget(center);
    mesh.computeWorldMatrix(true);
    const targetRotation = camera.rotation.clone();
    const radius = mesh.getBoundingInfo().boundingSphere.radiusWorld;
    const distanceFromObject2 = radius / Math.tan(camera.fov / 2);
    const direction = camera.getForwardRay().direction;
    const newPosition = centerW.add(direction.scaleInPlace(-distanceFromObject2));
    camera.position.copyFrom(originalPosition);
    camera.rotation.copyFrom(originalRotation);
    // Use GSAP to animate the camera's rotation towards the target rotation
    gsap.timeline()
        .to(camera.rotation, {
            x: targetRotation.x,
            y: targetRotation.y,
            z: targetRotation.z,
            duration: 1,
            ease: "power1.inOut",
        })
        .to(camera.position, {
            x: newPosition.x,
            y: newPosition.y,
            z: newPosition.z,
            duration: 1,
            ease: "power1.inOut",
        });
}

// Function to get pathname fron current URL
export const getUrlPathName = () => {
    const pathName = window?.location?.pathname;
    return pathName;
};

export const VALID_UID_SCENE_ID_PATHS = ["/", "/publish"];
