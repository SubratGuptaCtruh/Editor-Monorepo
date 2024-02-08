import QRCode from "react-qr-code";
import styles from "./XRExperience.module.css";

function XRExperience() {
    return (
        <div className={styles.XRMainContainer}>
            <div className={styles.XRTitle}>
                <h1>XR-ready Link</h1>
                <div className={styles.titleInner}>
                    <p>publish.ctruh.com/projectid?=fjas0j32-jaower25-9h89831</p>
                    <button>Copy Link</button>
                </div>
            </div>
            <div className={styles.qrContainer}>
                <div className={styles.qrMain}>
                    <h1>Scan the QR Code</h1>
                    <QRCode style={{ width: "12rem", height: "12rem" }} value={"Demo Text"} />
                </div>
                <button>Download as Image</button>
            </div>
        </div>
    );
}

export default XRExperience;
