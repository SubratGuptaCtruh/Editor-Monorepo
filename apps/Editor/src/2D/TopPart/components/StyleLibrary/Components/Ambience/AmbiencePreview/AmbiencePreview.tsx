import { useSetAtom } from "jotai";
import { useState } from "react";
import { handleAmbiencePreviewModal } from "../../../../../../../store/store";
import { VrpanoSvg } from "../../../../../../RightPart/components/Icon/Icon";
import { BackArrowIcons, LightModeIcons, MusicNoteIcons } from "../../../../Icons/Icons";
import styles from "./AmbiencePreview.module.css";
function AmbiencePreview() {
    const [selectedAmbience, setSelectedAmbience] = useState(""); // State to keep track of selected ambience

    const handleAmbienceClick = (ambience: string) => {
        setSelectedAmbience(ambience);
    };
    const setSelectedCard = useSetAtom(handleAmbiencePreviewModal);
    // for closing the ambiencePreview Modal
    const closeObjectPreviewModal = () => {
        setSelectedCard(false);
        console.log("clicked");
    };
    return (
        <div className={styles.ambienceMainContainer}>
            <div className={styles.rightPart}>
                <div className={styles.rightHeading}>
                    <div onClick={closeObjectPreviewModal}>
                        {" "}
                        <BackArrowIcons />
                    </div>
                    Mighty Mountains
                </div>
                <div className={styles.rightPartContent}>
                    <li className={styles.content} onClick={() => handleAmbienceClick("snowyValley")}>
                        <VrpanoSvg />
                        SNOWY VALLEY
                    </li>
                    <li className={styles.content} onClick={() => handleAmbienceClick("backgroundLight")}>
                        <LightModeIcons />
                        BLUE AREA LIGHT
                    </li>
                    <li className={styles.content} onClick={() => handleAmbienceClick("pointLight")}>
                        <LightModeIcons />
                        WHITE POINT LIGHT
                    </li>
                    <li className={styles.content} onClick={() => handleAmbienceClick("snowyValley")}>
                        <MusicNoteIcons />
                        FLOWING RIVER
                    </li>
                </div>
            </div>
            <div className={styles.leftPart}>
                {selectedAmbience === "snowyValley" ? (
                    <img className={styles.mountain} src="./mountain.webp" alt="Snowy Valley" />
                ) : selectedAmbience === "backgroundLight" ? (
                    <img className={styles.mountain} src="./backgroundLight.jpg" alt="light" />
                ) : selectedAmbience === "pointLight" ? (
                    <img className={styles.mountain} src="./pointlight.avif" alt="pointLight" />
                ) : (
                    "Select an element to preview it here"
                )}
            </div>
            <button className={styles.bottomRightButton}>APPLY</button>
        </div>
    );
}
export default AmbiencePreview;
