import { ConfirmationResult } from "firebase/auth";
import { useAtom } from "jotai";
import { useState } from "react";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { userDetails } from "../../../../store/store";
import { updateUserDetails } from "../../../APIs/actions";
import Button from "../../../Components/Button/Button";
import OtpInput from "../../../Components/OtpInput/OtpInput";
import useInterval, { setUpRecaptcha } from "../../../Utils/Otp.utils";
import styles from "./YourProfile.module.css";

interface ContactInformation {
    userName?: string;
    email_id?: string;
    phone?: string;
}
const YourProfile = () => {
    const [userInfo, setUserInfo] = useAtom(userDetails);
    const [contactInformationErrors, setContactInformationErrors] = useState<ContactInformation>({});
    const [contactInformation, setContactInformation] = useState({
        userName: userInfo.User?.UserName || "",
        email_id: userInfo.User?.email_id || "",
        phone: userInfo.User?.Phone || "",
    });
    const [otp, setOtp] = useState("");
    const [isOtpField, setIsOtpField] = useState(false);
    const [isCaptcha, setIsCaptcha] = useState(true);
    const [captchaResult, setCaptchaResult] = useState<ConfirmationResult | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const handleContactInformationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setContactInformation((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdateDetails = async () => {
        if (!isExecuting) {
            setIsExecuting(true);
            if (validateContactInformation()) {
                const emailRegEx = /^[a-zA-Z0-9._]+@[a-z]+\.[a-z]{2,6}$/;
                if (!emailRegEx.test(contactInformation.email_id)) {
                    toast.error("Please enter a valid email address");
                    setIsExecuting(false);
                    return;
                }
                const response = await getOtp();
                if (response) {
                    setIsOtpField(true);
                    toast.success("OTP sent successfully");
                    setIsExecuting(false);
                } else {
                    toast.error("OTP sending failed");
                    setIsExecuting(false);
                }
            } else {
                setIsExecuting(false);
            }
        }
    };
    const validateContactInformation = () => {
        let isValid = true;
        const errors: ContactInformation = {};

        // Validate name
        if (!contactInformation.userName.trim()) {
            errors.userName = "Name is required";
            isValid = false;
        }
        // Validate email
        if (!contactInformation.email_id.trim()) {
            errors.email_id = "Email is required";
            isValid = false;
        }
        // Validate phone
        if (!contactInformation.phone.trim() || contactInformation.phone.trim().length < 3) {
            errors.phone = "Phone is required";
            isValid = false;
        }
        setContactInformationErrors(errors);
        return isValid;
    };

    // Function to trigger OTP
    async function getOtp() {
        try {
            const response = await setUpRecaptcha(contactInformation?.phone);
            if (response) {
                setCaptchaResult(response);
                handleStart();
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    // Function to Verify OTP
    async function verifyOtp() {
        if (!isExecuting) {
            setIsExecuting(true);
            try {
                if (otp.length === 6) {
                    await captchaResult?.confirm(otp);
                    const { data, status } = await toast.promise(updateUserDetails(contactInformation, userInfo.User?.id), {
                        loading: "Updating details...",
                        success: "Details updated successfully",
                        error: "Something went wrong!",
                    });
                    if (status === 200) {
                        localStorage.setItem("u_inf", JSON.stringify(data));
                        setUserInfo(data);
                        setIsOtpField(false);
                        setOtp("");
                        setIsExecuting(false);
                    } else {
                        setIsExecuting(false);
                    }
                } else {
                    toast.error("Please fill all fields.");
                    setIsExecuting(false);
                }
            } catch (err: Error | unknown) {
                if (err instanceof Error) {
                    if (err.message === "Firebase: Error (auth/invalid-verification-code).") {
                        toast.error("Whoops! Invalid Otp");
                    } else {
                        console.log(err);
                        toast.error("Something went wrong!");
                    }
                } else {
                    console.log(err);
                    toast.error("Something went wrong!");
                }
                setIsExecuting(false);
            }
        }
    }

    // Resend Otp Timer logic start
    const INITIAL_COUNT = 30;
    const twoDigits = (num: number) => String(num).padStart(2, "0");
    const [secondsRemaining, setSecondsRemaining] = useState(INITIAL_COUNT);
    const secondsToDisplay = secondsRemaining % 60;
    const minutesRemaining = (secondsRemaining - secondsToDisplay) / 60;
    const minutesToDisplay = minutesRemaining % 60;

    // Function to start timer
    const handleStart = () => {
        setIsCaptcha(false);
        setStatus(STATUS.STARTED);
        setSecondsRemaining(INITIAL_COUNT);
    };
    type StatusType = {
        STARTED: string;
        STOPPED: JSX.Element;
    };
    const STATUS: StatusType = {
        STARTED: "Started",
        STOPPED: (
            <p
                className={styles.resendOtp}
                style={{
                    color: "#697A8B",
                    fontStyle: "normal",
                    fontWeight: "400",
                    fontSize: "16px",
                    lineHeight: "20px",
                    marginBottom: "20px",
                }}
            >
                Didn’t get the OTP?{" "}
                <span
                    className={styles.resendOtp}
                    style={{
                        border: "none",
                        background: "transparent",
                        color: "#3D75F3",
                        cursor: "pointer",
                        fontStyle: "normal",
                        fontWeight: "400",
                        fontSize: "16px",
                        lineHeight: "20px",
                        marginLeft: "5px",
                    }}
                    onClick={getOtp}
                >
                    Resend
                </span>
            </p>
        ),
    };
    const [status, setStatus] = useState<string | JSX.Element>(STATUS.STOPPED);

    useInterval(
        () => {
            if (secondsRemaining > 0) {
                setSecondsRemaining(secondsRemaining - 1);
            } else {
                setIsCaptcha(true);
                setStatus(STATUS.STOPPED);
            }
        },
        status === STATUS.STARTED ? 1000 : null
    );
    // Resend Otp Timer logic end
    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <div className={styles.contactInfoWrapper}>
                    <h4>Contact Information</h4>
                    <p>OTP verification is required to update the following.</p>
                    <div className={styles.form}>
                        <div className={styles.inputWrapper}>
                            <p className={styles.label}>Your name</p>
                            <input
                                style={
                                    contactInformationErrors.userName
                                        ? {
                                              border: "1px solid red",
                                              borderRadius: "8px",
                                          }
                                        : {}
                                }
                                value={contactInformation.userName}
                                type="text"
                                name={"userName"}
                                onChange={handleContactInformationChange}
                                placeholder="Enter your name"
                            />
                            <p className={styles.error}>{contactInformationErrors.userName}</p>
                        </div>
                        <div className={styles.inputWrapper}>
                            <p className={styles.label}>Email Id</p>
                            <input
                                style={
                                    contactInformationErrors.email_id
                                        ? {
                                              border: "1px solid red",
                                              borderRadius: "8px",
                                          }
                                        : {}
                                }
                                value={contactInformation.email_id}
                                type="email"
                                name={"email_id"}
                                onChange={handleContactInformationChange}
                                placeholder="Enter your email address"
                            />
                            <p className={styles.error}>{contactInformationErrors.email_id}</p>
                        </div>
                        <div className={styles.inputWrapper}>
                            <p className={styles.label}>Phone number</p>
                            <PhoneInput
                                containerStyle={{
                                    border: contactInformationErrors.phone && "1px solid red",
                                }}
                                containerClass={styles.phoneInputContainer}
                                inputStyle={{ backgroundColor: "transparent", border: "none" }}
                                buttonStyle={{ backgroundColor: "transparent", border: "none" }}
                                dropdownClass={styles.inputDropdownStyle}
                                country={"in"}
                                value={contactInformation.phone}
                                onChange={(phone) => {
                                    console.log(contactInformation);
                                    setContactInformation({
                                        ...contactInformation,
                                        phone: "+" + phone.trim(),
                                    });
                                }}
                            />
                            <p className={styles.error}>{contactInformationErrors.phone}</p>
                        </div>
                        {isOtpField && (
                            <div className={styles.otpWrapper}>
                                <OtpInput value={otp} valueLength={6} onChange={(value) => setOtp(value)} />
                                {status === STATUS.STARTED ? (
                                    <p
                                        className={styles.resendOtp}
                                        style={{
                                            color: "#697A8B",
                                            fontStyle: "normal",
                                            fontWeight: "400",
                                            fontSize: "16px",
                                            lineHeight: "20px",
                                        }}
                                    >
                                        Seconds remaining
                                        <span
                                            className={styles.resendOtp}
                                            style={{
                                                border: "none",
                                                background: "transparent",
                                                cursor: "default",
                                                fontStyle: "normal",
                                                fontWeight: "400",
                                                fontSize: "16px",
                                                lineHeight: "20px",
                                                marginLeft: "4px",
                                            }}
                                        >
                                            {twoDigits(minutesToDisplay) + ":" + twoDigits(secondsToDisplay)}
                                        </span>
                                    </p>
                                ) : (
                                    status
                                )}
                                {isCaptcha && <div id="recaptcha-container"></div>}
                            </div>
                        )}
                        {isCaptcha && <div id="recaptcha-container"></div>}
                        <div className={styles.buttonWrapper}>
                            <Button
                                onClick={() => {
                                    if (isOtpField) {
                                        verifyOtp();
                                    } else {
                                        handleUpdateDetails();
                                    }
                                }}
                                content={isOtpField ? "Verify" : "Update"}
                                type="primary"
                                size="small"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YourProfile;
