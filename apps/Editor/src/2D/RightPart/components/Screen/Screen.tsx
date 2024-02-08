import { AbstractMesh, Vector3 } from "@babylonjs/core";
import { useRef, useState } from "react";
import { getSizeFromAspect } from "../../../../3D/EditorLogic/ScreenLoader";
import { SetScalingCommand } from "../../../../3D/EditorLogic/commands";
import { editor } from "../../../../3D/EditorLogic/editor";
import SliderWithInput from "../../../Components/SlidersWithInput/SliderWithInput";
import styles from "../3DObject/3DObject.module.css";
import { EditSvg, SettingsSvg } from "../Icon/Icon";
import Placement from "../Placement/Placement";
import Attribute from "./ScreenComponents/Attribute";

function Screen() {
    const [selectedTab, seSelectedTab] = useState(1);
    const action = (index: number) => {
        seSelectedTab(index);
        console.log(index);
    };

    const screen = editor.selector.selected;

    const aspectRatio = screen?.metadata.data.aspectRatio;

    const screenSize = getSizeFromAspect(aspectRatio);

    const actualScale = editor.selector.selected?.scaling;

    const virtualScale = actualScale ? actualScale.x / screenSize[0] : 17.77 / screenSize[0];

    const oldScaling = useRef<Vector3>();

    return (
        <>
            <div className={styles.mainContainer}>
                <h5 className={styles.topHeading}>Screen</h5>
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
                            <Placement>
                                <>
                                    <div className={styles.contentContainer}>
                                        <span className={styles.text}>Scale</span>
                                        <div className={styles.horizontalLineappearence}></div>
                                    </div>
                                    <div className={styles.SliderDoubleContainer}>
                                        <SliderWithInput
                                            min={-50}
                                            max={50}
                                            initialValue={virtualScale}
                                            onChange={(value) => {
                                                const newScaleX = value * screenSize[0];
                                                const newScaleY = value * screenSize[1];
                                                const selectedMesh = editor.selector.selected;
                                                if (!selectedMesh) return;
                                                editor.update.transform(selectedMesh as AbstractMesh, {
                                                    transform: "Scaling",
                                                    value: new Vector3(newScaleX, newScaleY, 1),
                                                });
                                            }}
                                            steps={0.01}
                                            onComplete={(value) => {
                                                const newScaleX = value * screenSize[0];
                                                const newScaleY = value * screenSize[1];
                                                const selectedMesh = editor.selector.selected;
                                                if (!selectedMesh) return;
                                                editor.executer(
                                                    new SetScalingCommand(editor, selectedMesh as AbstractMesh, new Vector3(newScaleX, newScaleY, 1), oldScaling.current)
                                                );
                                            }}
                                            onStart={() => {
                                                const selectedMesh = editor.selector.selected;
                                                if (!selectedMesh) return;
                                                oldScaling.current = (selectedMesh as AbstractMesh).scaling.clone();
                                            }}
                                        />
                                    </div>
                                </>
                            </Placement>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default Screen;
