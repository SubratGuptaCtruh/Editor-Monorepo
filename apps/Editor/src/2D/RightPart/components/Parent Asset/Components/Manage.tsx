import { useState } from "react";
// import Toggle from "../../../../Components/Toggle/Toggle";
import styles from "../../3DObject/3DObject.module.css";

const Manage = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    return (
        <div className={styles.BodyContainer}>
            <div className={styles.contentContainer}>
                <span className={styles.text}>CHILD OPTIONS</span>
                <div className={styles.horizontalLineappearence}></div>
            </div>
            <div className={styles.contentContainer}>
                <span className={styles.materialText} style={{ marginTop: "10px" }}>
                    Rotation Behaviour
                </span>
            </div>
            <div className={styles.tabContainerProjection}>
                <div className={styles.tabs}>
                    <div className={selectedTab === 0 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`} onClick={() => setSelectedTab(0)}>
                        <p className={styles.tabHeading}>Relative</p>{" "}
                    </div>
                    <div className={selectedTab === 1 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`} onClick={() => setSelectedTab(1)}>
                        <p className={styles.tabHeading}>Absolute</p>
                    </div>
                </div>
            </div>
            <div className={styles.contentContainer} style={{ marginTop: "10px" }}>
                <span className={styles.materialText}>Scaling Behaviour</span>
            </div>
            <div className={styles.tabContainerProjection}>
                <div className={styles.tabs}>
                    <div className={selectedTab === 0 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <p className={styles.tabHeading}>Relative</p>{" "}
                    </div>
                    <div className={selectedTab === 1 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <p className={styles.tabHeading}>Absolute</p>
                    </div>
                </div>
            </div>
            {/* <div className={styles.positionContainer}>
                <div>
                    <div className={styles.toggleTextContent} style={{ marginTop: "10px" }}>
                        Preserve Transformations
                    </div>

                    <Toggle
                        initialValue={true}
                        onChange={() => {
                            console.log("change");
                        }}
                    />
                </div>
            </div>
            <div className={styles.buttonContainer} style={{ marginTop: "15px" }}>
                <button className={styles.btn}> Fuse Child Meshes</button>
            </div> */}
        </div>
    );
};

export default Manage;
