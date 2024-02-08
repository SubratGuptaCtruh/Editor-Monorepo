import { useAtomValue } from "jotai";
import React, { ReactElement } from "react";
import { uploadSettingModalAtom } from "../../../store/store";
import styles from "./Snackbar.module.css";

interface SnackbarProps {
    message: string;
    icon: ReactElement;
    actionBtn: ReactElement;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, icon, actionBtn }) => {
    const uploadSettingModal = useAtomValue(uploadSettingModalAtom);

    return (
        <div className={styles.mainContainer}>
            {icon}
            <p>{message}</p>
            <div className={`${styles.actionBtn} ${uploadSettingModal && styles.clickedActionBtn}`}>{actionBtn}</div>
        </div>
    );
};

export default Snackbar;
