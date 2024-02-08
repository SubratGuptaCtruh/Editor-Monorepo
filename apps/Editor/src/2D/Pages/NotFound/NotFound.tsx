import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { editor } from "../../../3D/EditorLogic/editor";
import { userDetails } from "../../../store/store";
import styles from "./NotFound.module.css";
const NotFound = () => {
    const useInfo = useAtomValue(userDetails);

    useEffect(() => {
        editor.hideLoadingUI();
    }, []);

    return (
        <div className={styles.container}>
            <div>
                <div className={styles.leftPart}>
                    <h1>Oops! That Didn’t Go As Expected.</h1>
                    <p>This page doesn’t exist, or was removed. </p>
                    <Link to={useInfo?.User ? import.meta.env.VITE_DASHBOARD_URL : import.meta.env.VITE_HOME_PAGE_URL}>{useInfo?.User ? "Go to dashboard" : "Go to homepage"}</Link>
                </div>
                <div className={styles.rightPart}>
                    <img className={styles.image404} src="./image404.png" alt="404 page" />
                </div>
            </div>
        </div>
    );
};

export default NotFound;
