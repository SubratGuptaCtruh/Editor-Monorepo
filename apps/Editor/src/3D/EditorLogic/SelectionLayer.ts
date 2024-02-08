import { AbstractMesh, Mesh } from "@babylonjs/core";
import { DEFAULT_GRID_ID } from "./BackgroundSystem";
import { Editor } from "./editor";
import { findClosestCommonAncestor, findMeshInAncestors, getAncestorAtLevel, getParent, traceAncestors } from "./utils";

export class SelectionLayer {
    private currentRoot: Mesh | AbstractMesh | Node | null = null;
    private currentSelection: AbstractMesh | null = null;
    private currenSelectedAncestors: Mesh[] = [];

    private _editor: Editor;

    constructor(editor: Editor) {
        this._editor = editor;
    }

    public singleClick = (mesh: AbstractMesh) => {
        if (mesh.name === DEFAULT_GRID_ID) return;
        const root = getParent(mesh);
        if (!this.currentRoot) {
            this.currentRoot = root as Mesh;
            this.currenSelectedAncestors = traceAncestors(root as Mesh) as Mesh[];
            this.currentSelection = root as Mesh;
        } else if (this.currentRoot === root) {
            this.currenSelectedAncestors = traceAncestors(root as Mesh) as Mesh[];
            this.currentRoot = root as AbstractMesh;
            this.currentSelection = root as AbstractMesh;
        } else {
            this.currentRoot = root as AbstractMesh;
            this.currenSelectedAncestors = traceAncestors(root as Mesh) as Mesh[];
            this.currentSelection = root as AbstractMesh;
        }

        return root;
    };

    public doubleClick = (mesh: AbstractMesh) => {
        if (mesh.name === DEFAULT_GRID_ID) return;
        if (this.currentSelection === mesh) return mesh;
        const root = getParent(mesh);

        if (!this.currentRoot || !this.currentSelection || root !== this.currentRoot) {
            this.currentRoot = root as Mesh;
            const selectedMesh = getAncestorAtLevel(mesh as Mesh, 1);
            const ancestors = traceAncestors(mesh as Mesh);
            this.currentSelection = selectedMesh as Mesh;
            this.currenSelectedAncestors = ancestors as Mesh[];
            return selectedMesh;
        }
        const ancestors = traceAncestors(mesh as Mesh);

        const level = findMeshInAncestors(this.currentSelection as Mesh, ancestors as Mesh[]);
        if (level >= 0) {
            const selectedMesh = getAncestorAtLevel(mesh as Mesh, level + 1);

            this.currentRoot = root as Mesh;
            this.currentSelection = selectedMesh as Mesh;
            this.currenSelectedAncestors = ancestors as Mesh[];

            return selectedMesh;
        } else {
            const closestCommonAncestor = findClosestCommonAncestor(this.currenSelectedAncestors, ancestors as Mesh[], mesh as Mesh);

            this.currentRoot = root as Mesh;
            this.currentSelection = closestCommonAncestor as Mesh;
            this.currenSelectedAncestors = ancestors as Mesh[];
            return closestCommonAncestor;
        }
    };

    public directSelection = (mesh: AbstractMesh) => {
        this.currentRoot = getParent(mesh) as Mesh;
        this.currentSelection = mesh;
        this.currenSelectedAncestors = traceAncestors(mesh as Mesh) as Mesh[];

        this._editor.selector.select(mesh);
    };

    public dispose = () => {
        this.currentRoot = null;
        this.currentSelection = null;
        this.currenSelectedAncestors = [];
    };
}
