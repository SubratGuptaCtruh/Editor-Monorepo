import { useEffect, useState } from "react";
import SketchFab from "./SketchFab/SketchFab";
import styles from "./ThirdPart.module.css";

function ThirdParty() {
    const CLIENT_ID = import.meta.env.VITE_SKETCHFAB_CLIENT_ID;
    const [token, setToken] = useState<string>("");
    const [isSketchfabIntegration, setIsSketchfabIntegration] = useState<boolean>(false);
    const [isRedirected, setIsRedirected] = useState<boolean>(false);
    const AUTHENTICATION_URL = `https://sketchfab.com/oauth2/authorize/?state=123456789&response_type=token&client_id=${CLIENT_ID}`;

    useEffect(() => {
        // Check token in storage on component mount
        const storedToken = localStorage.getItem("sb_t");
        const storedTokenTime = localStorage.getItem("e_t");
        if (storedToken && storedTokenTime) {
            setIsSketchfabIntegration(true);
            setToken(storedToken);
        }

        // Continuously monitor token in storage
        const intervalId = setInterval(() => {
            const updatedToken = localStorage.getItem("sb_t");
            const updatedTokenTime = localStorage.getItem("e_t");
            // checkTokenExpiration(updatedTokenTime);
            if (
                updatedToken === undefined ||
                updatedToken === null ||
                updatedToken === "" ||
                updatedTokenTime === undefined ||
                updatedTokenTime === null ||
                updatedTokenTime === ""
            ) {
                setIsSketchfabIntegration(false);
                setIsRedirected(false);
            }
            if (updatedToken && updatedToken !== token) {
                setToken(updatedToken);
                // Perform actions with the updated token, such as making API calls
            }
        }, 1000); // Adjust the interval as per your needs

        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [token]);

    return isSketchfabIntegration ? (
        <SketchFab />
    ) : (
        <div className={styles.thirdPartyMainContainer}>
            <div className={styles.innerContainer}>
                <h1>You can sign-in to 3rd-party store to import any assets you own there, or browse free assets in their collection. </h1>
                <div className={styles.imgContainer}>
                    <div onClick={isRedirected ? () => window.location.reload() : () => window.open(AUTHENTICATION_URL, "_blank")} className={styles.images}>
                        <img src="./sketchfab-logo.png" alt="SketchFab Icon" />
                        <p>SketchFab</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ThirdParty;
