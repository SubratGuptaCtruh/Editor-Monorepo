import { useState } from "react";
import { ImageIcon, ThreeModalIcons, WebIcon, XRIcon } from "../Icons/Icons";
import ThreeDModal from "./Components/3dModal/ThreeDModal";
import Image from "./Components/Image/Image";
import ShareSidebarItem from "./Components/ShareSidebarItem/ShareSidebarItem";
import Web from "./Components/Web/Web";
import XRExperience from "./Components/XRExperience/XRExperience";
import styles from "./Share.module.css";

function Share() {
    const [sideBarOptionSelected, setSideBarOptionSelected] = useState("web");

    const sideBarMappingData = [
        {
            handleClick: () => setSideBarOptionSelected("web"),
            content: "WEB URL",
            desc: "Viewable on any desktop or mobile web browser",
            tab: "web",
            icons: <WebIcon />,
        },
        {
            handleClick: () => setSideBarOptionSelected("xr"),
            content: "XR Experience",
            desc: "Go beyond screens with an immersive experience",
            tab: "xr",
            icons: <XRIcon />,
        },

        {
            handleClick: () => setSideBarOptionSelected("image"),
            content: "IMAGE",
            desc: "Rendered 2D image for quickly sharing to social media",
            tab: "image",
            icons: <ImageIcon />,
        },
        {
            handleClick: () => setSideBarOptionSelected("3d"),
            content: "3D Model",
            desc: "Asset editable with most popular 3D softwares",
            tab: "3d",
            icons: <ThreeModalIcons />,
        },
    ];

    return (
        <div className={styles.modalInnerContainer}>
            <div className={styles.modalInnerHeader}>
                <div className={styles.modalInnerHeaderTitle}>
                    <img src="./media.svg" alt="" />
                    <h1>Share Your Creation</h1>
                </div>
            </div>
            <div className={styles.modalBody}>
                {/* modal sidebar */}
                <div className={styles.modalSideBar}>
                    {sideBarMappingData?.map((elem, index) => {
                        return <ShareSidebarItem key={index} {...elem} sideBarOptionSelected={sideBarOptionSelected} />;
                    })}
                </div>
                {/* modal Right part */}
                <div className={styles.modalMiddlePart}>
                    {sideBarOptionSelected === "web" ? (
                        <Web />
                    ) : sideBarOptionSelected === "xr" ? (
                        <XRExperience />
                    ) : sideBarOptionSelected === "image" ? (
                        <Image />
                    ) : sideBarOptionSelected === "3d" ? (
                        <ThreeDModal />
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default Share;
