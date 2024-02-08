import { useEffect } from "react";
import styles from "./Integrations.module.css";
const Integrations = () => {
    useEffect(() => {
        const checkToken = () => {
            // Check if there's a new token from the URL
            const url = new URL(window.location.href);
            // Extract the token and save it
            const hashParams = url.hash.substring(1).split("&");
            for (const param of hashParams) {
                if (param.indexOf("expires_in") !== -1) {
                    const expires_in = param.replace("expires_in=", "");
                    console.log("expires: ", expires_in);
                    localStorage.setItem("e_t", expires_in);
                }
            }
            for (const param of hashParams) {
                if (param.indexOf("access_token") !== -1) {
                    const token = param.replace("access_token=", "");
                    console.log("Detected Sketchfab token: ", token);
                    localStorage.setItem("sb_t", token);
                    window.location.replace(url.origin + url.pathname);
                }
            }
        };
        checkToken();
    }, []);

    return (
        <div className={styles.integrationContainer}>
            <h1>Your sketchfab account is connected successfully please close this tab</h1>
        </div>
    );
};

export default Integrations;
