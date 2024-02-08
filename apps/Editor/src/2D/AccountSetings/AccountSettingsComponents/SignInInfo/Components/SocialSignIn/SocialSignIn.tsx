import { FaceBook, GitHub, GoogleIcon, LinkedIn } from "../../../icons/icons";
import styles from "./SocialSignIn.module.css";

const AddSocialAccount = () => {
    return (
        <div className={styles.socialSignIn}>
            <h4>Social Sign In</h4>
            <p>Select a social login service to link to your Ctruh account. NOTE: You will be taken to an external site to authenticate.</p>
            <div className={styles.socialMediaIcons}>
                <div className={styles.iconBox}>
                    <GoogleIcon />
                </div>
                <div className={styles.iconBox}>
                    <GitHub />
                </div>
                <div className={styles.iconBox}>
                    <FaceBook />
                </div>
                <div className={styles.iconBox}>
                    <LinkedIn />
                </div>
            </div>
            <button className={styles.socialSignInButton}>CANCEL</button>
        </div>
    );
};

export default AddSocialAccount;
