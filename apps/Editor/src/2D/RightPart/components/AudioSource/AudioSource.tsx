import { useState } from "react";
import styles from "../3DObject/3DObject.module.css";
import { EditSvg, SettingsSvg } from "../Icon/Icon";
import Placement from "../Placement/Placement";
import Attribute from "./AudioComponent/Attribute";

const AudioSource = () => {
    const [selectedTab, seSelectedTab] = useState(1);

    const action = (index: number) => {
        seSelectedTab(index);
        console.log(index);
    };
    return (
        <div className={styles.mainContainer}>
            <h5 className={styles.topHeading}>Spatial Audio</h5>
            <div className={styles.tabContainer}>
                <div className={styles.tabs}>
                    <div onClick={() => action(1)} className={selectedTab === 1 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <SettingsSvg />
                        <p className={styles.tabHeading}>ATTRIBUTES</p>{" "}
                    </div>
                    <div onClick={() => action(2)} className={selectedTab === 2 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <EditSvg />
                        <p className={styles.tabHeading}>PLACEMENT</p>
                    </div>
                </div>
                <div className={styles.contents}>
                    <div className={selectedTab === 1 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <Attribute />
                    </div>

                    <div className={selectedTab === 2 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <Placement />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AudioSource;
