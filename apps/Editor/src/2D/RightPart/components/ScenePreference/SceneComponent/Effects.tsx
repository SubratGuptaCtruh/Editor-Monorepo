import SliderWithInput from "../../../../Components/SlidersWithInput/SliderWithInput";
import Toggle from "../../../../Components/Toggle/Toggle";
import styles from "../../3DObject/3DObject.module.css";
function Effects() {
    return (
        <div className={styles.BodyContainer}>
            <div className={styles.contentContainer}>
                <span className={styles.text}>GRAVITY</span>
                <div className={styles.horizontalLineappearence}></div>
                <Toggle />
            </div>
            <div className={styles.positionContainer}>
                <div>
                    <div className={styles.SliderProperty}>
                        <SliderWithInput min={-50} max={50} steps={3} />
                    </div>
                </div>
            </div>
            <div className={styles.contentContainer}>
                <span className={styles.toggleTextContent}>Solid Floor</span>
                <hr className={styles.horizontalLine} />
                <Toggle />
            </div>
            <div className={styles.contentContainer}>
                <span className={styles.text}>OBJECT DEFAULTS</span>
                <div className={styles.horizontalLineappearence}></div>
            </div>

            <div className={styles.physicsContainer}>
                <div className={styles.toggleContainer}>
                    <span className={styles.toggleTextContent}>Rigid Body</span>
                    <Toggle />
                </div>
                <div className={styles.toggleContainer}>
                    <span className={styles.toggleTextContent}>Precise Collosion</span>
                    <Toggle />
                </div>
                <div className={styles.toggleContainer}>
                    <span className={styles.toggleTextContent}>Fuse Child Objects</span>
                    <Toggle />
                </div>
            </div>
            <div className={styles.buttonContainer}>
                <button className={styles.btn}>UPDATE FOR ALL OBJECTS</button>
            </div>
        </div>
    );
}
export default Effects;
