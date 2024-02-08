import { useState } from "react";
import styles from "../3DObject/3DObject.module.css";
import { EditSvg } from "../Icon/Icon";
import Placement from "../Placement/Placement";

const ParentAsset = () => {
    const [selectedTab, seSelectedTab] = useState(1);
    const action = (index: number) => {
        seSelectedTab(index);
        console.log(index);
    };
    return (
        <div className={styles.mainContainer}>
            <h5 className={styles.topHeading}>Parent Asset</h5>
            <div className={styles.tabContainer}>
                <div className={styles.tabs}>
                    <div onClick={() => action(1)} className={selectedTab === 1 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <EditSvg />
                        <p className={styles.tabHeading}>TRANSFORM</p>
                    </div>
                </div>
                <div className={styles.contents}>
                    <div className={selectedTab === 1 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <Placement />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentAsset;
