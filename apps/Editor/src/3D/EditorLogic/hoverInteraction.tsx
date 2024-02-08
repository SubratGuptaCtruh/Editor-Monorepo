import { AbstractMesh, BoundingInfo, Mesh, Nullable } from "@babylonjs/core";

export function isEmptyMesh(mesh: Mesh) {
    if (!mesh.geometry) {
        return true;
    } else {
        return false;
    }
}

export function calculateBoundingInfo(mesh: AbstractMesh) {
    const { min, max } = mesh.getHierarchyBoundingVectors(true);
    const boundingInfo = new BoundingInfo(min, max);
    boundingInfo.isLocked = true;
    mesh.setBoundingInfo(boundingInfo);
}

export class HoverInteraction {
    private hoveredMesh: Nullable<AbstractMesh> = null;

    public hover = (mesh: AbstractMesh) => {
        this.hoveredMesh = mesh;
        mesh.showBoundingBox = true;
    };

    public unhover = (mesh: AbstractMesh) => {
        mesh.showBoundingBox = false;
    };

    public setHoveredMesh = (mesh: Nullable<AbstractMesh>) => {
        if (!mesh && this.hoveredMesh) {
            this.unhover(this.hoveredMesh);
        }
        if (mesh && this.hoveredMesh !== mesh) {
            this.hoveredMesh && this.unhover(this.hoveredMesh);
            this.hover(mesh);
        }
        this.hoveredMesh = mesh;
    };
}
