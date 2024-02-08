import { useEffect, useState } from "react";
import ExpandableCard from "./Components/ExpandableCard/ExpandableCard";
import styles from "./LinkedServices.module.css";
const LinkedServices = () => {
    const CLIENT_ID = import.meta.env.VITE_SKETCHFAB_CLIENT_ID;
    const [token, setToken] = useState<string>("");
    const [isSketchfabIntegration, setIsSketchfabIntegration] = useState<boolean>(false);
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
            }
            if (updatedToken && updatedToken !== token) {
                setToken(updatedToken);
                // Perform actions with the updated token, such as making API calls
            }
        }, 1000); // Adjust the interval as per your needs

        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [token]);
    const SketchFab = {
        title: "SketchFab",
        logo: "/sketchfab-logo.png",
        website: "https://sketchfab.com/feed",
        status: isSketchfabIntegration ? "Connected" : "Not Connected",
        handleClick: isSketchfabIntegration ? () => localStorage.removeItem("sb_t") : () => window.open(AUTHENTICATION_URL, "_blank"),
        subheading: "Permissions",
        Description: ["Account validation", "Access to user assets", "Publishing to user account"],
    };
    return (
        <div className={styles.container}>
            <div className={styles.activeService}>
                <h4>Active services</h4>
                <div className={styles.cardContainer}>
                    <div className={styles.sketchFab}>
                        <ExpandableCard content={SketchFab} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinkedServices;
