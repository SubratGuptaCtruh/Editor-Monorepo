import { useState } from "react";
import { Toaster } from "react-hot-toast";
import Button from "../Components/Button/Button";
import styles from "./AccountSettings.module.css";
import AccountSettingsSideBarItem from "./AccountSettingsComponents/AccountSettingsSideBarItem/AccountSettingsSideBarItem";
import LinkedServices from "./AccountSettingsComponents/LinkedServices/LinkedServices";
import YourProfile from "./AccountSettingsComponents/YourProfile/YourProfile";

interface CloseType {
    close: () => void;
}
const AccountSettings = ({ close }: CloseType) => {
    // const [searchTerm, setSearchTerm] = useState("");
    const [sideBarOptionSelected, setSideBarOptionSelected] = useState("Your Profile");

    const sideBarMappingData = [
        // {
        //     handleClick: () => setSideBarOptionSelected("Sign-In Info"),
        //     content: "Sign-In Info",
        //     tab: "Sign-In Info",
        // },
        {
            handleClick: () => setSideBarOptionSelected("Your Profile"),
            content: "Your Profile",
            tab: "Your Profile",
        },

        {
            handleClick: () => setSideBarOptionSelected("Linked Services"),
            content: "Linked Services",
            tab: "Linked Services",
        },
    ];
    return (
        <div className={styles.Container}>
            <Toaster containerClassName={styles.toasterWrapper} position="top-center" reverseOrder={false} />
            <div className={styles.TopNavBar}>
                <h2>Account Settings</h2>
                {/* <div className={styles.searchBar}>
                    <SearchIcons />
                    <input type="text" placeholder="Find a setting.." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div> */}
            </div>
            <div className={styles.body}>
                <div className={styles.SideNav}>
                    <div>
                        {sideBarMappingData?.map((elem, index) => {
                            return <AccountSettingsSideBarItem key={index} {...elem} sideBarOptionSelected={sideBarOptionSelected} />;
                        })}
                    </div>
                    <div className={styles.horizontalLine}></div>
                    <div className={styles.bottom}>
                        <Button style={{ width: "100%" }} content="Back to editor" type="primary" onClick={() => close()} />
                    </div>
                </div>
                <div className={styles.MiddlePart}>
                    {sideBarOptionSelected === "Your Profile" ? <YourProfile /> : sideBarOptionSelected === "Linked Services" ? <LinkedServices /> : ""}
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
