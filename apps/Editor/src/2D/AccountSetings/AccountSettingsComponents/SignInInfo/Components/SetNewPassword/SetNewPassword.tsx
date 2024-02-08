import { useState } from "react";
import OtpInput from "../../../../../Components/OtpInput/OtpInput";
import styles from "./SetNewPassword.module.css";
const SetNewPassword = () => {
    const [otp, setOtp] = useState("");
    const onChange = (value: string) => setOtp(value);
    return (
        <div className={styles.container}>
            <h4>Setting New Password</h4>
            <p>We’ve sent you an OTP on your email ID.</p>
            <OtpInput value={otp} valueLength={6} onChange={onChange} />
            <input type="text" placeholder="Set a secure password" />
            <div className={styles.buttoContainer}>
                <button>CONFIRM</button>
                <button>CANCEL</button>
            </div>
        </div>
    );
};

export default SetNewPassword;
