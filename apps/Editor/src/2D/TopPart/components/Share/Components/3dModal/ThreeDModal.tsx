import { useRef } from "react";
import { editor } from "../../../../../../3D/EditorLogic/editor";
import styles from "./ThreeDModal.module.css";
function ThreeDModal() {
    const options = useRef({
        separateChildMeshes: false,
    });

    // Array of download format options
    const downloadFormats = [
        { value: "GLB", format: ".GLB Format" },
        { value: "GLTF", format: ".GLTF Format" },
    ];

    const selectRef = useRef<HTMLSelectElement>(null);

    const download = () => {
        if (selectRef.current) {
            const selectedFormat = selectRef.current.value as "GLTF" | "GLB";
            const shouldExportChildSeparate = options.current.separateChildMeshes;
            if (shouldExportChildSeparate) {
                const sceneGraph = editor.get.SceneGraph();
                sceneGraph.forEach((node) => {
                    if (node.type !== "Grid") {
                        editor.export({ fileFormat: selectedFormat, fileName: node.name, object: node.ref.ref });
                    }
                });
            } else {
                editor.export({ fileFormat: selectedFormat, fileName: "ctruh-scene" });
            }
        }
    };

    return (
        <div className={styles.threeDContainer}>
            <div className={styles.threeDTitle}>
                <h1>3D Model Settings</h1>
                <div className={styles.checkBoxContainer}>
                    <div className={styles.checkBoxInner}>
                        <input
                            onChange={(e) => {
                                options.current.separateChildMeshes = e.target.checked;
                            }}
                            type="checkbox"
                            name="separateChildMeshes"
                        />
                        <label>Separate Child Meshes</label>
                    </div>
                </div>
                <div className={styles.downloadContainer}>
                    <select style={{ cursor: "pointer" }} ref={selectRef}>
                        {/* Download format options */}
                        {downloadFormats.map((type, index) => (
                            <option key={index} value={type.value}>
                                {type.format}
                            </option>
                        ))}
                    </select>
                    <button onClick={download}>Download</button>
                </div>
            </div>
        </div>
    );
}
export default ThreeDModal;
