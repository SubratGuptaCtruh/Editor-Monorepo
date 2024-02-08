import { useEffect, useState } from "react";
import { MeshMetadata, MeshType, editor } from "../../3D/EditorLogic/editor";
import { useSelectedState } from "../Hooks/useSelected";
import styles from "./Gizmo.module.css";
import { DragAndPan, Rotation, Scale } from "./icons";

function Gizmo() {
    const [gizmoClicked, setGizmoClicked] = useState<string>("position");
    const selected = useSelectedState(editor);
    useEffect(() => {
        console.log(selected, "selected");
        if (selected) {
            editor.selector.toggleMode("position");
            setGizmoClicked("position");
        }
    }, [selected]);
    if (!selected) return <></>;
    const metadata = selected.metadata as MeshMetadata<MeshType>;
    const buttonData = [
        {
            enabeled: metadata.allowedSelectionModes[0],
            title: "position",
            icons: <DragAndPan />,
            onClick: () => (editor.selector.toggleMode("position"), setGizmoClicked("position")),
        },
        {
            enabeled: metadata.allowedSelectionModes[1],
            title: "rotation",
            icons: <Rotation />,
            onClick: () => (editor.selector.toggleMode("rotation"), setGizmoClicked("rotation")),
        },
        {
            enabeled: metadata.allowedSelectionModes[2],
            title: "scale",
            icons: <Scale />,
            onClick: () => (editor.selector.toggleMode("scale"), setGizmoClicked("scale")),
        },
    ].filter((button) => button.enabeled);

    return (
        <>
            {buttonData.length !== 1 ? (
                <div className={styles.gizmoMainContainer}>
                    {buttonData.map((data, index) => (
                        <button key={index} className={data.title === gizmoClicked ? styles.gizmoClicked : ""} onClick={data.onClick}>
                            {data.icons}
                        </button>
                    ))}
                </div>
            ) : (
                <></>
            )}
        </>
    );
}

export default Gizmo;
