import { useState } from "react";
import styles from "../3DObject/3DObject.module.css";
import { EditSvg, SettingsSvg } from "../Icon/Icon";
import Placement from "../Placement/Placement";
import Manage from "./Components/Manage";

const MultiSelect = () => {
    const [selectedTab, setSelectedTab] = useState(2);
    const action = (index: number) => {
        setSelectedTab(index);
        console.log(index);
    };
    return (
        <div className={styles.mainContainer}>
            <h5 className={styles.topHeading}>Selection Group</h5>
            <div className={styles.tabContainer}>
                <div className={styles.tabs}>
                    <div onClick={() => action(2)} className={selectedTab === 2 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <EditSvg />
                        <p className={styles.tabHeading}>TRANSFORM</p>
                    </div>
                    <div onClick={() => action(1)} className={selectedTab === 1 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <SettingsSvg />
                        <p className={styles.tabHeading}>MANAGE</p>{" "}
                    </div>
                </div>
                <div className={styles.contents}>
                    <div className={selectedTab === 1 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <Manage />
                    </div>

                    <div className={selectedTab === 2 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <Placement />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiSelect;
