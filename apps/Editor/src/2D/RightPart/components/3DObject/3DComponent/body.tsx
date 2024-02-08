import styles from "../3DObject.module.css";

import SliderWithInput from "../../../../Components/SlidersWithInput/SliderWithInput";
function Body() {
    const handleChange = (event: number) => {
        console.log(event);
    };
    return (
        <div className={styles.BodyContainer}>
            <div className={styles.contentContainer}>
                <span className={styles.text}>MESH</span>
                <div className={styles.horizontalLineappearence}></div>
            </div>
            <div className={styles.positionContainer}>
                <span className={styles.materialText}>Subdivisions</span>
                <div>
                    <div className={styles.SliderProperty}>
                        <SliderWithInput
                            min={-50}
                            max={50}
                            onChange={handleChange}
                            onComplete={(e: number) => console.log(e, "complete")}
                            onStart={(e: number) => console.log(e, "start")}
                            steps={3}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.buttonContainer} style={{ marginTop: "15px" }}>
                <button className={styles.btn}> Fuse Child Meshes</button>
            </div>
        </div>
    );
}
export default Body;
