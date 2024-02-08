import { Nullable } from "@babylonjs/core";
import { useEffect, useState } from "react";
import Placement from "../../../../2D/RightPart/components/Placement/Placement";
import { Hotspot } from "../../../../3D/EditorLogic/HotspotSystem";
import { editor } from "../../../../3D/EditorLogic/editor";
import styles from "../3DObject/3DObject.module.css";
import Attributes from "../CameraSettings/CameraComponent/Attributes";
import { EditSvg, SettingsSvg } from "../Icon/Icon";

function CameraSettings() {
    const [selectedTab, seSelectedTab] = useState(1);

    const action = (index: number) => {
        seSelectedTab(index);
        console.log(index);
    };

    const [disablePlacement, setDisablePlacement] = useState(false);

    const base = styles.tab;
    const active = `${styles.tab} ${styles.activeTab}`;
    const disable = `${styles.tab} ${styles.inactive}`;

    useEffect(() => {
        const callback = (hotspotInPreview: Nullable<Hotspot>) => {
            if (hotspotInPreview) {
                setDisablePlacement(true);
                seSelectedTab((currentTab) => {
                    return currentTab === 2 ? 1 : currentTab;
                });
            } else {
                setDisablePlacement(false);
            }
        };

        const unsubscriber = editor.hotspotSystem.setPreviewHotspotChangedCallback(callback);

        return () => {
            unsubscriber();
        };
    }, []);

    return (
        <div className={styles.mainContainer}>
            <h5 className={styles.topHeading}>Camera Settings</h5>
            <div className={styles.tabContainer}>
                <div className={styles.tabs}>
                    <div onClick={() => action(1)} className={selectedTab === 1 ? active : base}>
                        <SettingsSvg />
                        <p className={styles.tabHeading}>Attributes</p>{" "}
                    </div>
                    <div onClick={() => !disablePlacement && action(2)} className={selectedTab === 2 ? (disablePlacement ? disable : active) : disablePlacement ? disable : base}>
                        <EditSvg />
                        <p className={styles.tabHeading}>Placement</p>
                    </div>
                </div>
                <div className={styles.contents}>
                    <div className={selectedTab === 1 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <Attributes />
                    </div>

                    <div className={selectedTab === 2 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <Placement />
                    </div>
                </div>
            </div>
        </div>
    );
}
export default CameraSettings;
