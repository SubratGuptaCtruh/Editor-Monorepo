import React, { useEffect, useState } from "react";
import { HotspotSettingsType, editor } from "../../../../../3D/EditorLogic/editor";
import SliderWithInput from "../../../../Components/SlidersWithInput/SliderWithInput";
import Toggle from "../../../../Components/Toggle/Toggle";
import { useSecneGraph } from "../../../../Hooks/useSecneGraph";
import { useSelectedState } from "../../../../Hooks/useSelected";
import styles from "../../3DObject/3DObject.module.css";

function Attributes() {
    const threeDObjects = useSecneGraph(editor);
    const selected = useSelectedState(editor);
    const options = threeDObjects.filter((data) => data.ref?.ref?.metadata?.tags && data.ref.ref.metadata?.tags.includes("FocusTarget"));
    const defaultState = selected?.metadata.data.settings || {};

    const [hotspotSettings, setHotspotSettings] = useState<HotspotSettingsType>(defaultState);

    useEffect(() => {
        const sethotspotState = (id: string, state: HotspotSettingsType) => {
            if (!editor.selector.selected) return;
            if (editor.selector.selected.id === id) {
                const newState = { ...state };
                setHotspotSettings(newState);
            }
        };

        editor.UIeventEmitter.on("hotspotStateChanged", sethotspotState);

        return () => {
            editor.UIeventEmitter.off("hotspotStateChanged", sethotspotState);
        };
    }, []);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (event.target instanceof HTMLSelectElement) {
            const selectedValue = event.target.value;
            const targetOption = options.find((option) => String(option.ref.ref.id) === selectedValue);
            if (editor.selector.selected) {
                const hotspot = editor.hotspotSystem.getHotspotById(editor.selector.selected.id);
                targetOption && hotspot && hotspot.setFocusTarget(targetOption.ref.ref, true);
            }
        }
    };

    const handleToggleFocusLock = () => {
        if (!editor.selector.selected) return;
        const hotspot = editor.hotspotSystem.getHotspotById(editor.selector.selected.id);
        if (hotspot) {
            const targetOption = options.find((option) => String(option.ref.uuid) === hotspotSettings.focusedTarget) || options[0];
            hotspot.setFocusTarget(targetOption.ref.ref, !hotspotSettings.focusLocked);
        }
    };

    const handlePreviewMode = () => {
        if (!editor.selector.selected) return;
        const hotspot = editor.hotspotSystem.getHotspotById(editor.selector.selected.id);
        if (!hotspot) return;
        if (!hotspot.state.preview) {
            hotspot.zoomCameraHotspot();
        } else {
            hotspot.panCameraBackToOriginalPosition();
        }
    };

    const handleProjectionMode = (mode: number) => {
        if (!editor.selector.selected) return;
        const hotspot = editor.hotspotSystem.getHotspotById(editor.selector.selected.id);
        if (!hotspot) return;
        hotspot.setCameraProjections(mode);
    };

    const handleSliderChange = (value: number) => {
        if (!editor.selector.selected) return;
        const hotspot = editor.hotspotSystem.getHotspotById(editor.selector.selected.id);
        if (!hotspot) return;
        hotspot.setCameraFOV(value);
    };

    return (
        <div className={styles.BodyContainer}>
            <div className={styles.positionContainer}>
                <div>
                    <div className={styles.toggleTextContent}>Preview</div>
                    <Toggle initialValue={hotspotSettings.preview} onChange={handlePreviewMode} />
                </div>
            </div>
            {/* <div className={styles.imagePreview}></div> */}
            <div className={hotspotSettings.preview ? styles.contentContainer : styles.contentGrayContainer}>
                <span className={styles.text}>LENS</span>
                <div className={styles.horizontalLineappearence}></div>
            </div>
            <div className={hotspotSettings.preview ? styles.contentContainer : styles.contentGrayContainer}>
                <span className={styles.materialText}>PROJECTION</span>
            </div>
            <div className={hotspotSettings.preview ? styles.tabContainerProjection : styles.grayedtabContainer}>
                <div className={hotspotSettings.preview ? styles.tabs : styles.grayTabs}>
                    <div
                        onClick={() => {
                            handleProjectionMode(0);
                        }}
                        className={hotspotSettings.preview ? (hotspotSettings.mode === 0 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`) : styles.graytab}
                    >
                        <p className={styles.tabHeading}>Perspective</p>{" "}
                    </div>
                    <div
                        onClick={() => {
                            handleProjectionMode(1);
                        }}
                        className={hotspotSettings.preview ? (hotspotSettings.mode === 1 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`) : styles.graytab}
                    >
                        <p className={styles.tabHeading}>Isometric</p>
                    </div>
                </div>
                <div>
                    <div className={hotspotSettings.mode === 0 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <div className={hotspotSettings.preview ? styles.positionContainer : styles.positionGrayContainer}>
                            <span className={styles.materialText}>Field of View</span>
                            <div>
                                <div className={styles.SliderProperty}>
                                    <SliderWithInput
                                        initialValue={hotspotSettings.fov}
                                        min={0}
                                        max={90}
                                        steps={3}
                                        onChange={handleSliderChange}
                                        sliderEnabled={!hotspotSettings.preview}
                                        context="initialValueZero"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={hotspotSettings.focusLocked ? styles.contentContainer : styles.contentGrayContainer}>
                <span className={styles.text}>LOCK FOCUS</span>
                <div className={styles.horizontalLineappearence}></div>
                <Toggle initialValue={hotspotSettings.focusLocked} onChange={handleToggleFocusLock} />
            </div>
            <div className={hotspotSettings.focusLocked ? styles.positionContainer : styles.positionGrayContainer}>
                <span className={styles.materialText}>FOCUS TARGET</span>
                <div>
                    <select
                        value={hotspotSettings.focusedTarget || ""}
                        onChange={handleSelectChange}
                        className={hotspotSettings.focusLocked ? styles.colorDropdown : styles.graycolorDropdown}
                    >
                        {options.map((option) =>
                            option.type === "Grid" ? null : (
                                <option key={option.ref.ref.id} value={option.ref.ref.id}>
                                    {option.name}
                                </option>
                            )
                        )}
                    </select>
                </div>
            </div>
            {/* <div className={styles.positionContainer}>
                <span className={styles.materialText}>VIEWER HEIGHT</span>
                <div>
                    <div className={styles.SliderProperty}>
                        <SliderWithInput min={-50} max={50} steps={3} />
                    </div>
                </div>
            </div> */}
        </div>
    );
}
export default Attributes;
