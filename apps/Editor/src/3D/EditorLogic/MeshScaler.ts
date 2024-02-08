import { AbstractMesh } from "@babylonjs/core";
import { fitMeshInBox } from "./utils";

export class MeshScaler {
    addModelToSceneWithinBound = (glbRoot: AbstractMesh, bound: AbstractMesh) => {
        glbRoot.isVisible = false;
        console.log("MESH SCALER : addModelToScene", bound);
        fitMeshInBox(glbRoot, bound);
        glbRoot.isVisible = true;
    };
}
