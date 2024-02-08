import { useState } from "react";
import { FaceBook, GoogleIcon, LinkOff } from "../icons/icons";
import ChangePassword from "./Components/ChangePassword/ChangePassword";
import SetNewPassword from "./Components/SetNewPassword/SetNewPassword";
import AddSocialAccount from "./Components/SocialSignIn/SocialSignIn";
import styles from "./SignInInfo.module.css";

const SignInInfo = () => {
    const [newName, setNewName] = useState("brucewayne");
    const [inputFocused, setInputFocused] = useState(false);
    const [password, setPassword] = useState(false);
    const [SocialSignIn, setSocialSignIn] = useState(true);
    const [addSocial, setAddSocial] = useState(false);
    const handleInputStyle = () => {
        setNewName("");
        setInputFocused(true);
    };
    const handleClick = () => {
        setAddSocial(true);
        setSocialSignIn(true);
    };
    return (
        <div className={styles.signInContainer}>
            <div>
                {addSocial ? (
                    <AddSocialAccount />
                ) : (
                    <>
                        {password ? (
                            <SetNewPassword />
                        ) : (
                            <>
                                <h4>User Name</h4>
                                <p>This can be changed once in 90 days.</p>
                                <input
                                    type="text"
                                    placeholder={newName}
                                    value={newName}
                                    onClick={handleInputStyle}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className={inputFocused ? styles.whiteBackground : ""}
                                />
                                <button>UPDATE</button>
                                <div className={styles.signInMethod}>
                                    <h2>Sign-In Method</h2>
                                    {SocialSignIn ? (
                                        <>
                                            <p>Linked to Social Account(s)</p>
                                            <div className={styles.accountsLinked}>
                                                <div className={styles.eachAccount}>
                                                    <div className={styles.accDetails}>
                                                        <div className={styles.accIcon}>
                                                            <GoogleIcon />
                                                        </div>
                                                        <div className={styles.email}>bruce@gmail.com</div>
                                                    </div>
                                                    <div className={styles.linkOff}>
                                                        <LinkOff />
                                                    </div>
                                                </div>
                                                <div className={styles.eachAccount}>
                                                    <div className={styles.accDetails}>
                                                        <div className={styles.accIcon}>
                                                            <FaceBook />
                                                        </div>
                                                        <div className={styles.email}>bruce@gmail.com</div>
                                                    </div>
                                                    <div className={styles.linkOff}>
                                                        <LinkOff />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p>Manually registered with an email ID.</p>
                                            <div className={styles.emailRegistered}>bruce@wayne.com</div>
                                        </>
                                    )}
                                </div>
                                {SocialSignIn ? (
                                    <div className={styles.buttons}>
                                        <button onClick={() => setPassword(true)}>SET A PASSWORD</button>
                                        <button>CONNECT ACCOUNT</button>
                                    </div>
                                ) : (
                                    <div className={styles.buttons}>
                                        <button onClick={handleClick}>Link Social Account</button>
                                        <button>Update Email ID</button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
            <div>{!SocialSignIn ? <ChangePassword /> : null}</div>
        </div>
    );
};

export default SignInInfo;
