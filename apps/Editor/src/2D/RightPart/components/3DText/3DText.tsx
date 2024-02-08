import { Color3 } from "@babylonjs/core";
import { useEffect, useRef, useState } from "react";
import { ThreeDText as ThreeDTextStatic } from "../../../../3D/EditorLogic/3Dtext";
import { SetMaterialCommnand } from "../../../../3D/EditorLogic/commands";
import { editor } from "../../../../3D/EditorLogic/editor";
import { useSelectedState } from "../../../Hooks/useSelected";
import ColorModal, { ImageStateType } from "../3DObject/3DComponent/ColorModal/ColorModal";
import styles from "../3DObject/3DObject.module.css";
import { EditSvg, SettingsSvg } from "../Icon/Icon";
import Placement from "../Placement/Placement";
import Attribute from "./3DTextComponents/Attribute";

function ThreeDText() {
    const [selectedTab, seSelectedTab] = useState(1);
    const [FontColorModalOpen, setFontColorModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImageStateType>({ url: "", name: "" });
    // const [selectedImageFileName, setSelectedImageFileName] = useState<string>("");
    const [selectedTabColor, seSelectedTabColor] = useState(1);
    const [selectedTextColor, setSelectedTextColor] = useState<string>("");

    const action = (index: number) => {
        seSelectedTab(index);
    };
    const selected = useSelectedState(editor);

    if (!selected) throw "Not selected";
    const openColorPicker = () => {
        setFontColorModalOpen((prevIsModalOpen) => !prevIsModalOpen);
    };
    useEffect(() => {
        if (selected.metadata.data.colorHex) setSelectedTextColor(selected.metadata.data.colorHex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const oldColor = useRef(Color3.Blue());
    const initialColor = (() => {
        let alpha = oldColor.current;
        try {
            alpha = editor.get.color(ThreeDTextStatic.getTextMesh(selected));
        } catch (error) {
            console.log(error);
        }
        return alpha;
    })();
    oldColor.current = initialColor;
    console.log(oldColor.current, "3dtext");
    return (
        <div className={styles.mainContainer}>
            <h5 className={styles.topHeading}>3D Text</h5>
            <div className={styles.tabContainer}>
                <div className={styles.tabs}>
                    <div onClick={() => action(1)} className={selectedTab === 1 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <EditSvg />
                        <p className={styles.tabHeading}>PLACEMENT</p>
                    </div>
                    <div onClick={() => action(2)} className={selectedTab === 2 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <SettingsSvg />
                        <p className={styles.tabHeading}>ATTRIBUTES</p>{" "}
                    </div>
                </div>
                <div className={styles.contents}>
                    <div className={selectedTab === 1 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <Placement />
                    </div>

                    <div className={selectedTab === 2 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <Attribute handleOpenColorPicker={openColorPicker} selected={selected} setSelectedTextColor={setSelectedTextColor} selectedTextColor={selectedTextColor} />
                    </div>
                </div>
                {FontColorModalOpen && (
                    <div className={styles.openSection} style={{ bottom: 0, top: "auto" }}>
                        <ColorModal
                            closeModal={() => setFontColorModalOpen(false)}
                            onChange={(e) => {
                                editor.update.color(ThreeDTextStatic.getTextMesh(selected), Color3.FromHexString(e));
                                editor.UIeventEmitter.emit("textColorChange");
                                setSelectedTextColor(e);
                            }}
                            onComplete={(e) => {
                                editor.update.color(ThreeDTextStatic.getTextMesh(selected), Color3.FromHexString(e));
                                editor.UIeventEmitter.emit("textColorChange");
                                editor.executer(new SetMaterialCommnand(editor, selected, Color3.FromHexString(e), null, oldColor.current));
                                setSelectedTextColor(e);
                            }}
                            onStart={(e) => {
                                console.log("start", e);
                                oldColor.current = Color3.FromHexString(e);
                                setSelectedTextColor(e);
                            }}
                            selectedTab={selectedTabColor}
                            setSelectedTab={seSelectedTabColor}
                            selectedImage={selectedImage}
                            setSelectedImage={(image) => {
                                setSelectedImage(image);
                                return image;
                            }}
                            context="Grid"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ThreeDText;
