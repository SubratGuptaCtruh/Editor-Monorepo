import { useState } from "react";
import styles from "../../../AssetLibrary.module.css";
import AssetLibrarySidebarItem from "../../AssetLibrarySidebarItem/AssetLibrarySidebarItem";
import MarketPlace from "./components/MarketPlace";
import MySketchFabModels from "./components/MySketchFabModels";
import SketchFabPurchasedModels from "./components/SketchFabPurchasedModels";
import UsedSketchFabModels from "./components/UsedSketchFabModels";

const SketchFab = () => {
    const [sketchfabSidebarOptions, setSketchfabSidebarOptions] = useState<string>("sf_models");

    // Sidebar data for sketchfab
    const sideBarMappingData = [
        {
            handleClick: () => setSketchfabSidebarOptions("sf_models"),
            content: "Marketplace",
            tab: "sf_models",
        },
        {
            handleClick: () => setSketchfabSidebarOptions("my_models"),
            content: "My Models",
            tab: "my_models",
        },
        {
            handleClick: () => setSketchfabSidebarOptions("my_purchased_models"),
            content: "Purchased Models",
            tab: "my_purchased_models",
        },
        {
            handleClick: () => setSketchfabSidebarOptions("used_models"),
            content: "Used Models",
            tab: "used_models",
        },
    ];
    return (
        <div className={styles.modalBody}>
            {/* sidebar */}
            <div className={styles.modalSideBar}>
                {sideBarMappingData?.map((elem, index) => {
                    return <AssetLibrarySidebarItem key={index} {...elem} sideBarOptionSelected={sketchfabSidebarOptions} />;
                })}
            </div>
            {/* Components rendering on conditions */}
            <div className={styles.modalMiddlePart}>
                {sketchfabSidebarOptions === "sf_models" && <MarketPlace />}
                {sketchfabSidebarOptions === "my_models" && <MySketchFabModels />}
                {sketchfabSidebarOptions === "my_purchased_models" && <SketchFabPurchasedModels />}
                {sketchfabSidebarOptions === "used_models" && <UsedSketchFabModels />}
            </div>
        </div>
    );
};

export default SketchFab;
