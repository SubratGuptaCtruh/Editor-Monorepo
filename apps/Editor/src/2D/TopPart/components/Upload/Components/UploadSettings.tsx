import { useAtom, useSetAtom } from "jotai";
import { useState } from "react";
import { UploadSettingOptions, uploadSettingModalAtom, userDetails } from "../../../../../store/store";
import { updateUserDetails } from "../../../../APIs/actions";
import Button from "../../../../Components/Button/Button";
import { ViewInAR } from "../../Icons/Icons";
import styles from "./UploadSettings.module.css";

const UploadSettings = () => {
    const [userInfo, setUserInfo] = useAtom(userDetails);
    // fetching smartScale value from user info
    const uploadSetting = userInfo.User.smartScaling;
    const [upload, setUpload] = useState<UploadSettingOptions>(uploadSetting ?? "as-is");
    const setUploadSettingModal = useSetAtom(uploadSettingModalAtom);

    const handleInputChange = (value: UploadSettingOptions) => setUpload(value);

    const formSubmitHandler = async () => {
        if (upload !== uploadSetting) {
            // updating user smartScaling value with api call
            const updatedUser = { smartScaling: upload };
            const { data, status } = await updateUserDetails(updatedUser, userInfo.User.id);
            if (status === 200) {
                setUserInfo({ ...userInfo, User: data });
            }
        }
        setUploadSettingModal(false);
    };

    return (
        <>
            <div className={styles.uploadModalMainContainer}>
                <div className={styles.modalInnerHeader}>
                    <div className={styles.modalInnerHeaderTitle}>
                        <ViewInAR />
                        <h1>Scaling For 3D Models</h1>
                    </div>
                </div>
                <div className={styles.modelMainContainer}>
                    <div>
                        <p>You can set a default behaviour for scaling 3D models that are imported from external sources.</p>
                    </div>
                    <form className={styles.form}>
                        <div className={styles.formInput} onClick={() => handleInputChange("as-is")}>
                            <input type="radio" name="import-model-setting" value="as-in" checked={upload === "as-is"} onChange={() => handleInputChange("as-is")} />
                            <p>Place model as-is</p>
                        </div>
                        <div className={styles.formInput} onClick={() => handleInputChange("bounding-box")}>
                            <input
                                type="radio"
                                name="import-model-setting"
                                value="bounding-box"
                                checked={upload === "bounding-box"}
                                onChange={() => handleInputChange("bounding-box")}
                            />
                            <p>Draw bounding box manually</p>
                        </div>
                    </form>
                    <div className={styles.formSubmit}>
                        {/* button text to show save on first object/scene upload irrespective of value */}
                        <Button content={upload === uploadSetting || !uploadSetting ? "Save" : "Update"} type="primary" onClick={formSubmitHandler} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default UploadSettings;
