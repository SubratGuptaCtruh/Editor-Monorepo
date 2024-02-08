import { useEffect, useRef, useState } from "react";
import { ChangeLightColorCommand } from "../../../../3D/EditorLogic/commands";
import { editor } from "../../../../3D/EditorLogic/editor";
import { LightSystem } from "../../../../3D/EditorLogic/lights";
import { useSelectedState } from "../../../Hooks/useSelected";
import ColorModal, { ImageStateType } from "../3DObject/3DComponent/ColorModal/ColorModal";
import styles from "../3DObject/3DObject.module.css";
import { EditSvg, SettingsSvg } from "../Icon/Icon";
import Placement from "../Placement/Placement";
import Attributes from "./LightComponent/Attributes";

function LightSource() {
    const [selectedTab, seSelectedTab] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false); // Color picker state
    const [selectedImage, setSelectedImage] = useState<ImageStateType>({ url: "", name: "" });
    const [selectedTabColor, seSelectedTabColor] = useState(1);
    const [lightColor, setLightColor] = useState<string>(""); // Color picker state
    const selected = useSelectedState(editor);
    const oldColor = useRef<string>();

    useEffect(() => {
        if (selected) setLightColor(LightSystem.getLightColor(selected));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!selected) return <>not selected</>;
    const selectedLightColor = LightSystem.getLightColor(selected);

    // Function to open color picker

    return (
        <div className={styles.mainContainer}>
            <h5 className={styles.topHeading}>{selected?.name}</h5>
            <div className={styles.tabContainer}>
                <div className={styles.tabs}>
                    <div onClick={() => seSelectedTab(1)} className={selectedTab === 1 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <SettingsSvg />
                        <p className={styles.tabHeading}>ATTRIBUTES</p>{" "}
                    </div>
                    <div onClick={() => seSelectedTab(2)} className={selectedTab === 2 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <EditSvg />
                        <p className={styles.tabHeading}>PLACEMENT</p>
                    </div>
                </div>
                <div className={styles.contents}>
                    <div className={selectedTab === 1 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <Attributes
                            selected={selected}
                            handleOpenColorPicker={() => {
                                setIsModalOpen((prevIsModalOpen) => !prevIsModalOpen);
                            }}
                            selectedLightColorState={lightColor}
                            setSelectedLightColor={setLightColor}
                        />
                    </div>

                    <div className={selectedTab === 2 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <Placement />
                    </div>
                </div>
                {/* Color picker  */}
                {isModalOpen && (
                    <div className={styles.openSection}>
                        <ColorModal
                            closeModal={() => setIsModalOpen(false)}
                            onChange={(e) => {
                                LightSystem.setLightColor(selected, e);
                                setLightColor(e);
                            }}
                            onComplete={(e) => {
                                console.log(e, "fdjhbshfbhis");
                                editor.executer(new ChangeLightColorCommand(editor, selected, e, oldColor.current));
                                setLightColor(e);
                            }}
                            onStart={(e) => {
                                console.log("xy");
                                oldColor.current = e;
                                setLightColor(e);
                            }}
                            value={selectedLightColor}
                            selectedTab={selectedTabColor}
                            setSelectedTab={seSelectedTabColor}
                            selectedImage={selectedImage}
                            setSelectedImage={(image) => {
                                setSelectedImage(image);
                                return image;
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
export default LightSource;
