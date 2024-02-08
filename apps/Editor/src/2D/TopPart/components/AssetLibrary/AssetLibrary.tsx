import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { FileItem, previewScreenAtom } from "../../../../store/store";
import { getAllSystemFiles } from "../../../APIs/actions";
import { AssetIcons } from "../Icons/Icons";
import styles from "./AssetLibrary.module.css";
import AssetLibrarySidebarItem from "./Components/AssetLibrarySidebarItem/AssetLibrarySidebarItem";
import Audio from "./Components/Audio/Audio";
import Objects from "./Components/Objects/Objects";
import Scene from "./Components/Scene/Scene";
import ThirdParty from "./Components/ThirdParty/ThirdParty";
import Uploads from "./Components/Uploads/Uploads";

export interface AudioProps {
    id: string;
    title: string;
    url: string;
    duration: string;
    category: string;
    tags: string[];
}

function AssetLibrary() {
    const [headerSelected, setHeaderSelected] = useState<string>("ctruh");
    const [sideBarOptionSelected, setSideBarOptionSelected] = useState<string>("objects");
    const [templatesData, setTemplatesData] = useState<FileItem[]>([]);
    const [customObjectsData, setCustomObjectsData] = useState<FileItem[]>([]);
    const [isError, setIsError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const setPreviewScreen = useSetAtom(previewScreenAtom);

    // Sidebar Tabs
    const sideBarMappingData = [
        {
            handleClick: () => {
                setSideBarOptionSelected("objects");
                setPreviewScreen(false);
            },
            content: "Objects",
            tab: "objects",
        },
        {
            handleClick: () => {
                setSideBarOptionSelected("scene");
                setPreviewScreen(false);
            },
            content: "Scene",
            tab: "scene",
        },
        {
            handleClick: () => {
                setSideBarOptionSelected("audio");
                setPreviewScreen(false);
            },
            content: "Audio",
            tab: "audio",
        },
        {
            handleClick: () => {
                setSideBarOptionSelected("uploads");
                setPreviewScreen(false);
            },
            content: "Uploads",
            tab: "uploads",
        },
    ];

    // This will fetch all System Files on initial load
    useEffect(() => {
        getSystemFiles();
    }, []);

    // Function to get System Files Templates
    const getSystemFiles = async () => {
        setIsLoading(true);
        const { data, status } = await getAllSystemFiles();
        if (status === 200) {
            const objects = data.filter((elem: FileItem) => elem?.subcategory?.toLowerCase() === "object");
            const templates = data.filter((elem: FileItem) => elem?.subcategory?.toLowerCase() === "background");
            setCustomObjectsData(objects);
            setTemplatesData(templates);
            setIsError(false);
            setIsLoading(false);
        } else {
            setIsError(true);
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.modalInnerContainer}>
            <div className={styles.modalInnerHeader}>
                <div className={styles.modalInnerHeaderTitle}>
                    <AssetIcons />
                    <h1>Asset Library</h1>
                </div>
                <div className={styles.headerToggleContainer}>
                    <div className={styles.headerToggle}>
                        <div className={headerSelected === "ctruh" ? `${styles.headerItem} ${styles.headerActive}` : styles.headerItem} onClick={() => setHeaderSelected("ctruh")}>
                            Ctruh
                        </div>
                        <div
                            className={headerSelected === "Third_Party" ? `${styles.headerItem} ${styles.headerActive}` : styles.headerItem}
                            onClick={() => {
                                setHeaderSelected("Third_Party");
                                setPreviewScreen(false);
                            }}
                        >
                            Third Party
                        </div>
                    </div>
                </div>
            </div>
            {headerSelected === "Third_Party" ? (
                <ThirdParty />
            ) : (
                <div className={styles.modalBody}>
                    {/* sidebar */}
                    <div className={styles.modalSideBar}>
                        {sideBarMappingData?.map((elem, index) => {
                            return (
                                <div key={elem.tab}>
                                    <AssetLibrarySidebarItem {...elem} sideBarOptionSelected={sideBarOptionSelected} />
                                    {index === 2 && <div className={styles.horizontalLine}></div>}
                                </div>
                            );
                        })}
                    </div>
                    {/* Components rendering on conditions */}
                    <div className={styles.modalMiddlePart}>
                        {sideBarOptionSelected === "objects" ? (
                            <Objects isLoading={isLoading} isError={isError} data={customObjectsData} />
                        ) : sideBarOptionSelected === "scene" ? (
                            <Scene isLoading={isLoading} isError={isError} data={templatesData} />
                        ) : sideBarOptionSelected === "audio" ? (
                            <Audio headerSelected={headerSelected} inputPlaceholder="Search for an audio..." actionButtonType="Favourite" />
                        ) : sideBarOptionSelected === "uploads" ? (
                            <Uploads />
                        ) : (
                            ""
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
export default AssetLibrary;
