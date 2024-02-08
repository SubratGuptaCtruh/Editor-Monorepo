import { useAtomValue, useSetAtom } from "jotai";
import { handleMaterialPreviewModal, materialPreviewAtom } from "../../../../../../../store/store";
import Button from "../../../../../../Components/Button/Button";
import SliderWithInput from "../../../../../../Components/SlidersWithInput/SliderWithInput";
import styles from "../../../../../../RightPart/components/3DObject/3DObject.module.css";
import { BackArrowIcons } from "../../../../Icons/Icons";
import style from "./MaterialPreview.module.css";

function MaterialPreview() {
    const fullScreen = useAtomValue(materialPreviewAtom);
    const setSelectedCard = useSetAtom(handleMaterialPreviewModal);
    // for closing the materialPreview Modal
    const closeMaterialPreviewModal = () => {
        setSelectedCard(false);
        console.log("clicked");
    };
    // for applying texture
    const handleMaterialApply = () => {
        console.log(fullScreen.texture);
    };
    return (
        <div className={style.materialPreviewContainer}>
            <div className={style.rightPart}>
                <div className={style.rightHeading}>
                    <div onClick={closeMaterialPreviewModal}>
                        <BackArrowIcons />
                    </div>
                    {fullScreen.name}
                </div>
                <div className={styles.rightPartContent}>
                    <div className={styles.surface}>
                        <span className={styles.materialText}>SURFACE</span>
                        <div className={styles.surfaceContent}>
                            <div className={styles.colorPickerContainer}>
                                <div className={styles.backgroundImageContainer}>
                                    <img className={style.materialImage} src={fullScreen.texture} />
                                </div>
                                <input type="text" placeholder="#389634" className={styles.colorInputField} />
                            </div>
                        </div>
                    </div>
                    <div className={styles.positionContainer}>
                        <span className={styles.materialText}>METALLIC</span>
                        <div>
                            <div className={styles.SliderProperty}>
                                <SliderWithInput min={-50} max={50} steps={3} />
                            </div>
                        </div>
                    </div>
                    <div className={styles.positionContainer}>
                        <span className={styles.materialText}>GLASS</span>
                        <div>
                            <div className={styles.SliderProperty}>
                                <SliderWithInput min={-50} max={50} steps={3} />
                            </div>
                        </div>
                    </div>
                    <div className={styles.positionContainer}>
                        <span className={styles.materialText}>TRANSPARENCY</span>
                        <div>
                            <div className={styles.SliderProperty}>
                                <SliderWithInput min={-50} max={50} steps={3} />
                            </div>
                        </div>
                    </div>
                    <div className={styles.positionContainer}>
                        <span className={styles.materialText}>ROUGHNESS</span>
                        <div>
                            <div className={styles.SliderProperty}>
                                <SliderWithInput min={-50} max={50} steps={3} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={style.leftPart}>
                <img className={style.mountain} src={fullScreen.screenShot} />
            </div>
            <Button content="DELETE" />
            <Button onClick={handleMaterialApply} content="APPLY" />
        </div>
    );
}
export default MaterialPreview;
