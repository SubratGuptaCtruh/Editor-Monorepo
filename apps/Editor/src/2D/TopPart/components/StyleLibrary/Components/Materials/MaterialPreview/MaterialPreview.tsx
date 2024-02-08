import { Color3, Texture } from "@babylonjs/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import toast from "react-hot-toast";
import { SetMaterialCommnand } from "../../../../../../../3D/EditorLogic/commands/SetMaterialCommnand/SetMaterialCommnand";
import { editor } from "../../../../../../../3D/EditorLogic/editor";
import { handleMaterialPreviewModal, materialPreviewAtom, openStyle, styleLibraryModalAtom } from "../../../../../../../store/store";
import { BackArrowIcons, CircleIcon, CubeIcon, TorusIcon } from "../../../../Icons/Icons";
import style from "./MaterialPreview.module.css";
import MaterialPreviewCanvas from "./MaterialPreviewCanvas/MaterialPreviewCanvas";
function MaterialPreview() {
    const fullScreen = useAtomValue(materialPreviewAtom);
    const setSelectedCard = useSetAtom(handleMaterialPreviewModal);
    const [shapeToggle, setShapeToggle] = useState([true, false, false]);
    const setStyleModal = useSetAtom(styleLibraryModalAtom);
    const setCloseStyleModal = useSetAtom(openStyle);
    // for closing the materialPreview Modal
    const closeMaterialPreviewModal = () => {
        setSelectedCard(false);
        console.log("clicked");
    };

    // for applying texture
    const handleMaterialApply = () => {
        if (editor.selector.selected) {
            console.log(editor.selector.selected.metadata);
            if (editor.selector.selected.metadata.type === "TransformNode") {
                toast.error("Cannot be applied on glbs", {
                    duration: 3000,
                });
                return;
            } else if (fullScreen.texture) {
                const texture = new Texture(fullScreen.texture, editor.scene);
                editor.executer(new SetMaterialCommnand(editor, editor.selector.selected, null, texture, new Color3(1, 1, 1)));
            }
            // editor.executer(new SetMaterialTextureCommnand(editor, editor.selector.selected, fullScreen.texture, new Color3(1, 1, 1)));
        } else {
            toast.error("Please select the Object to apply texture", {
                duration: 3000,
            });
        }
        setCloseStyleModal(false);
        setStyleModal(false);
        setSelectedCard(false);
    };

    return (
        <div className={style.materialPreviewContainer}>
            <div className={style.rightPart}>
                <div className={style.rightHeading}>
                    <div className={style.rightHeadingMain}>
                        <div onClick={closeMaterialPreviewModal}>
                            <BackArrowIcons />
                        </div>
                        {fullScreen.name}
                    </div>
                    <div className={style.iconContainer}>
                        <div className={shapeToggle[0] ? style.shapIconActive : style.shapIcon} onClick={() => setShapeToggle([true, false, false])}>
                            <CircleIcon />
                        </div>
                        <div className={shapeToggle[1] ? style.shapIconActive : style.shapIcon} onClick={() => setShapeToggle([false, true, false])}>
                            <CubeIcon />
                        </div>
                        <div className={shapeToggle[2] ? style.shapIconActive : style.shapIcon} onClick={() => setShapeToggle([false, false, true])}>
                            <TorusIcon />
                        </div>
                    </div>
                </div>
                <div className={style.materialPreviewCanvasContainer}>
                    <MaterialPreviewCanvas url={fullScreen.texture} className={style.previewMaterialCanvas} toggle={shapeToggle} />
                </div>
            </div>
            {/* <button className={style.bottomButton}>CUSTOMIZE</button> */}
            <button className={style.bottomRightButton} onClick={handleMaterialApply}>
                APPLY
            </button>
        </div>
    );
}
export default MaterialPreview;
