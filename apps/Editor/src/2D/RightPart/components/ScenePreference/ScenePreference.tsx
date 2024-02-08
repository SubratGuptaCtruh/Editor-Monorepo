import { useEffect, useRef, useState } from "react";
import { ChangeBackgroundColorCommand, ChangeGridColorCommand, ChangeHDRCommand } from "../../../../3D/EditorLogic/commands/BackgroundCommands/BackgroundCommands";
import { editor } from "../../../../3D/EditorLogic/editor";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_GRID_COLOR, useBackgroundState } from "../../../Hooks/useBackgroundState";
import ColorModal from "../3DObject/3DComponent/ColorModal/ColorModal";
import styles from "../3DObject/3DObject.module.css";
import { VrpanoSvg } from "../Icon/Icon";
import Backdrop from "./SceneComponent/Backdrop";
import Effects from "./SceneComponent/Effects";
const ScenePreference = () => {
    const [selectedTabGrid, setSelectedTabGrid] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false); // Color picker state

    const backgroundState = useBackgroundState();
    const [selectedTabColor, seSelectedTabColor] = useState(backgroundState.backgroundImage ? 2 : 1);
    const [selectedTab, setSelectedTab] = useState(1);
    const [selectedColorGrid, setSelectedColorGrid] = useState<string>("");
    const [selectedColorBackground, setSelectedColorBackground] = useState<string>("");
    const [GridModalOpen, setGridModalOpen] = useState(false);

    const action = (index: number) => {
        setSelectedTab(index);
    };

    // Function to open color picker
    const openColorPicker = () => {
        setIsModalOpen((prevIsModalOpen) => !prevIsModalOpen);
    };
    const handleGridModalOpen = () => {
        setGridModalOpen((prevIsModalOpen) => !prevIsModalOpen);
    };
    useEffect(() => {
        if (backgroundState.gridColor) {
            setSelectedColorGrid(backgroundState.gridColor);
        }
    }, [backgroundState.gridColor]);
    useEffect(() => {
        if (backgroundState.backgroundColor) {
            setSelectedColorBackground(backgroundState.backgroundColor);
        }
    }, [backgroundState.backgroundColor]);

    const oldColor = useRef(backgroundState.backgroundColor);

    const oldGridColor = useRef(backgroundState.gridColor);

    return (
        <>
            <div className={styles.mainContainer}>
                <h5 className={styles.topHeading}>Scene Preference</h5>
                <div className={styles.tabContainer}>
                    <div className={styles.tabs}>
                        <div onClick={() => action(1)} className={selectedTab === 1 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                            <VrpanoSvg />
                            <p className={styles.tabHeading} style={{ fontSize: "11px" }}>
                                ENVIRONMENT
                            </p>{" "}
                        </div>
                    </div>
                    <div className={styles.contents}>
                        <div className={selectedTab === 1 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                            <Backdrop
                                handleOpenColorPicker={openColorPicker}
                                selectedTab={selectedTabColor}
                                setSelectedTab={seSelectedTabColor}
                                selectedColorGrid={selectedColorGrid}
                                setSelectedColorGrid={setSelectedColorGrid}
                                handleGridModalOpen={handleGridModalOpen}
                                selectedColorBg={selectedColorBackground}
                                setSelectedColorBg={setSelectedColorBackground}
                            />
                        </div>
                        <div className={selectedTab === 3 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                            <Effects />
                        </div>
                    </div>

                    {/* Color picker  */}
                    {isModalOpen && (
                        <div className={styles.openSection}>
                            <ColorModal
                                value={selectedColorBackground}
                                closeModal={() => setIsModalOpen(false)}
                                onChange={(color) => {
                                    editor.backGroundSystem?.setBackgroundColor(color);
                                    setSelectedColorBackground(color);
                                }}
                                onComplete={(color) => {
                                    editor.executer(new ChangeBackgroundColorCommand(editor, color, oldColor.current || DEFAULT_BACKGROUND_COLOR));
                                    setSelectedColorBackground(color);
                                }}
                                onStart={() => {
                                    oldColor.current = backgroundState.backgroundColor;
                                    backgroundState.backgroundImage?.url && editor.executer(new ChangeHDRCommand(editor, { name: null, url: null }));
                                }}
                                selectedTab={selectedTabColor}
                                setSelectedTab={seSelectedTabColor}
                                selectedImage={{ url: backgroundState.backgroundImage?.url || "", name: backgroundState.backgroundImage?.name || "" }}
                                setSelectedImage={(imageState) => {
                                    editor.executer(new ChangeHDRCommand(editor, { name: imageState.name, url: imageState.url }));
                                    return imageState;
                                }}
                                context="ScenePreference"
                            />
                        </div>
                    )}
                    {GridModalOpen && (
                        <div className={styles.openSection} style={{ bottom: 0, top: "auto" }}>
                            <ColorModal
                                closeModal={() => setGridModalOpen(false)}
                                onChange={(color) => {
                                    setSelectedColorGrid(color);
                                    editor.backGroundSystem?.changeGridColor(color);
                                }}
                                onComplete={(e) => {
                                    setSelectedColorGrid(e);
                                    editor.executer(new ChangeGridColorCommand(editor, e, oldGridColor.current || DEFAULT_GRID_COLOR));
                                }}
                                onStart={(e) => {
                                    setSelectedColorGrid(e);
                                    oldGridColor.current = backgroundState.gridColor;
                                    editor.backGroundSystem?.changeGridColor(e);
                                }}
                                value={selectedColorGrid}
                                selectedTab={selectedTabGrid}
                                setSelectedTab={setSelectedTabGrid}
                                context="Grid"
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ScenePreference;
