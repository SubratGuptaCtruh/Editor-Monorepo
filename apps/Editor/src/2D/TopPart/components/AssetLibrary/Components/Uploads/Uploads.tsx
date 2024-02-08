import "external-svg-loader";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getCurrentQueryParams } from "../../../../../../3D/EditorLogic/utils";
import { FileItem, PreviewItemAtom, ScreenUploadModalAtom, UserObject, previewScreenAtom, userDetails } from "../../../../../../store/store";
import { addToFavorites, getUserAllDetailsById, handleDeleteBlobFile, removeFromFavorites } from "../../../../../APIs/actions";
import { FavouriteIconOff, FavouriteIconOn } from "../../../../../Components/SceneCard/Icons";
import { DeleteSvgIcon, ImagesModeSvg } from "../../../../../RightPart/components/Icon/Icon";
import { AssetIcons, HangoutVideoIcon, MusicIcons, ThreeDShapes, VRIcons, VectorIcons } from "../../../Icons/Icons";
import Preview from "../Preview/Preview";
import SearchInput from "../SearchInput/SearchInput";
import { Shimmer } from "../Shimmer/Shimmer";
import AudioCard from "./AudioCard/AudioCard";
import styles from "./Uploads.module.css";
// import HDRICanvas from "./HDRICanvas/HDRICanvas";
interface UploadedFile {
    blobId: string;
    bloburl: string;
    category: string | null;
    corr2DImageUrl: string | null;
    fileextension: string;
    filename: string;
    id: string;
    isCompressed: boolean;
    subcategory: string | null;
    subtype: string | null;
    type: string;
    uploadCategory: string;
    userid: string;
}

function Uploads() {
    const [customUploadsData, setCustomUploadsData] = useState<FileItem[]>([]);
    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>("");
    const [previewScreen, setPreviewScreen] = useAtom(previewScreenAtom);
    const screenUploadModal = useAtomValue(ScreenUploadModalAtom);
    const setPreviwItemData = useSetAtom(PreviewItemAtom);
    const [categoriesClicked, setCategoriesClicked] = useState<string[]>([]);
    const [stopScroll, setStopScroll] = useState(false);
    const [userInfo, setUserInfo] = useAtom(userDetails);
    const [favourites, setFavourites] = useState<string[]>(userInfo?.User?.favorites);

    const handleCardData = (data: FileItem) => {
        setPreviewScreen(true);
        setPreviwItemData(data);
    };

    // Filter Buttons
    const filterButtonsData = [
        {
            content: "Favourite",
            icon: "❤️",
            value: "favourite",
        },
        {
            content: "Model",
            icon: "🎱",
            value: "model",
        },
        {
            content: "Background",
            icon: "🌅",
            value: "hdr",
        },
        {
            content: "Audio",
            icon: "🎵",
            value: "audio",
        },
        {
            content: "Image",
            icon: "📷",
            value: "image",
        },
        {
            content: "Video",
            icon: "📹",
            value: "video",
        },
        {
            content: "Vector",
            icon: "📐",
            value: "vector",
        },
    ];

    useEffect(() => {
        const getUser = async () => {
            setIsLoading(true);
            const { UID, sceneID } = getCurrentQueryParams();
            if (!UID || !sceneID) throw Error("provide UID and sceneID");
            const { data, status } = await getUserAllDetailsById(UID);
            if (status === 200) {
                if (screenUploadModal) {
                    const filteredData = data?.Files.filter((item: UploadedFile) => item.type === "image" || item.type === "video");
                    console.log(filteredData);
                    setCustomUploadsData(filteredData.reverse());
                    setIsLoading(false);
                } else {
                    setCustomUploadsData(data?.Files.reverse());
                    console.log(data.Files);
                    setIsLoading(false);
                }
            }
            if (!data) {
                setIsError(false);
            }
        };
        getUser();
    }, [screenUploadModal]);

    // Function to get only image and video files when upload screen is clicked

    // Function to delete a file
    const deleteUploadedFile = async (id: string) => {
        if (!isExecuting) {
            setIsExecuting(true);
            const { data, status } = await handleDeleteBlobFile(id);
            if (status === 200) {
                console.log(data);
                const newData = customUploadsData.filter((item) => item.id !== id);
                setCustomUploadsData(newData);
                setIsExecuting(false);
            } else {
                setIsExecuting(false);
                throw new Error("Could not be deleted!");
            }
        }
    };
    // Function to set search value
    const handleSearchFilter = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const handleButtonClick = (content: string) => {
        // Toggle the selection state for the button at the given index
        if (categoriesClicked.includes(content)) {
            setCategoriesClicked(categoriesClicked.filter((item) => item !== content));
        } else {
            setCategoriesClicked([...categoriesClicked, content]);
        }
    };

    // Function to add to favourites
    const handleFavourites = async (id: string, userDetails: UserObject["User"], favourites: string[]) => {
        if (!isExecuting) {
            setIsExecuting(true);
            const { data, status } = await addToFavorites(id, userDetails, favourites);
            if (status === 200) {
                console.log(data);
                const User = data;
                const newData = { ...userInfo, User };
                setUserInfo(newData);
                setFavourites(data?.favorites);
                setIsExecuting(false);
            } else {
                setIsExecuting(false);
                throw new Error("Could not be removed.");
            }
        }
    };

    // Function to remove from favourites
    const handleRemoveFavourites = async (id: string, userDetails: UserObject["User"], favourites: string[]) => {
        if (!isExecuting) {
            setIsExecuting(true);
            const newFavourites = favourites?.filter((elem) => elem !== id);
            userDetails.favorites = newFavourites;
            const { data, status } = await removeFromFavorites(id, newFavourites, userDetails);
            if (status === 200) {
                const User = data;
                const newData = { ...userInfo, User };
                setUserInfo(newData);
                localStorage.setItem("user", JSON.stringify(data));
                setFavourites(data?.favorites);
                setIsExecuting(false);
            } else {
                setIsExecuting(false);
                throw new Error("Could not be removed.");
            }
        }
    };

    const filteredCustomUploadsData = customUploadsData
        ?.filter((filterValue) => {
            if (searchValue === "") {
                return filterValue;
            } else if (filterValue?.filename.toLowerCase().includes(searchValue.toLowerCase())) {
                return filterValue;
            }
        })
        ?.filter((item) => {
            if (categoriesClicked.length === 0 || (categoriesClicked.length === 1 && categoriesClicked[0] === "favourite")) {
                return item;
            } else if (categoriesClicked.includes(item.type)) {
                return item;
            }
        })
        ?.filter((item) => (categoriesClicked.includes("favourite") ? favourites.includes(item.id) : true));

    return previewScreen ? (
        <div className={styles.container}>
            <Preview />
        </div>
    ) : (
        <>
            {screenUploadModal && (
                <div className={styles.modalInnerHeader}>
                    <div className={styles.modalInnerHeaderTitle}>
                        <AssetIcons />
                        <h1>Screen Upload</h1>
                    </div>
                </div>
            )}
            <SearchInput value={searchValue} handleChange={handleSearchFilter} placeholder="Search for a file..." />
            {/* buttons */}
            <div
                className={styles.filterButtons}
                onWheel={(event) => (event.currentTarget.scrollLeft += event.deltaY)}
                onMouseOver={() => setStopScroll(true)}
                onMouseOut={() => setStopScroll(false)}
            >
                {filterButtonsData.map((item, index) => (
                    <>
                        <button
                            key={index}
                            onClick={() => handleButtonClick(item.value)}
                            style={{
                                background: categoriesClicked.includes(item.value) ? "#3D75F3" : "",
                                color: categoriesClicked.includes(item.value) ? "#fff" : "",
                            }}
                        >
                            {item.icon} <>{item.content}</>
                        </button>
                        {index === 0 && <div></div>}
                    </>
                ))}
            </div>
            <div className={stopScroll ? styles.containerStopScroll : styles.container}>
                {/* cards */}
                {isLoading ? (
                    <Shimmer uploadsModal />
                ) : isError ? (
                    <div className={styles.noUploadsDiv}>Oops! Could not load uploaded data.</div>
                ) : customUploadsData.length === 0 ? (
                    <div className={styles.noUploadsDiv}>Looks like it's empty here. Time to upload some content!</div>
                ) : filteredCustomUploadsData.length === 0 ? (
                    <div className={styles.noUploadsDiv}>Oops! No uploads found.</div>
                ) : (
                    <div className={styles.mapContainer}>
                        {filteredCustomUploadsData?.map((item) => (
                            <div key={item?.id} className={styles.uploadCard}>
                                <div className={styles.uploadCardTypes}>
                                    {item.type === "audio" ? (
                                        <MusicIcons />
                                    ) : item.type === "hdr" ? (
                                        <VRIcons />
                                    ) : item.type === "model" ? (
                                        <ThreeDShapes />
                                    ) : item.type === "video" ? (
                                        <HangoutVideoIcon />
                                    ) : item.type === "image" ? (
                                        <ImagesModeSvg />
                                    ) : item.type === "vector" ? (
                                        <VectorIcons />
                                    ) : (
                                        ""
                                    )}
                                    <button
                                        disabled={isExecuting}
                                        style={{
                                            cursor: isExecuting ? "not-allowed" : "pointer",
                                        }}
                                        onClick={() =>
                                            toast.promise(deleteUploadedFile(item?.id), {
                                                loading: "Deleting...",
                                                success: "File deleted!",
                                                error: "Could not be deleted.",
                                            })
                                        }
                                    >
                                        <DeleteSvgIcon />
                                    </button>
                                </div>
                                {item.type === "vector" ? (
                                    <svg data-src={item.bloburl} className={styles.uploadCardImage} onClick={() => handleCardData(item)} />
                                ) : item.type === "video" ? (
                                    <video
                                        src={item.bloburl?.toString()}
                                        className={styles.uploadCardImage}
                                        controls={previewScreen ? true : false}
                                        autoPlay
                                        loop
                                        muted={!previewScreen ? true : false}
                                        onClick={() => handleCardData(item)}
                                    ></video>
                                ) : item.type === "hdr" ? (
                                    <img src={item.corr2DImageUrl} alt="" className={styles.uploadCardImage} onClick={() => handleCardData(item)} />
                                ) : // <HDRIImage url={`${item.bloburl}`} className={styles.uploadCardImage} onClick={() => handleCardData(item)} />
                                item.type === "audio" ? (
                                    <AudioCard url={`${item.bloburl}`} className={styles.uploadCardImage} onClick={() => handleCardData(item)} />
                                ) : (
                                    <img
                                        onClick={() => handleCardData(item)}
                                        src={item.type === "model" ? item.corr2DImageUrl || "./3dPlaceholder.avif" : item.type === "image" ? `${item.bloburl}` : ""}
                                        alt={item.filename}
                                        className={styles.uploadCardImage}
                                    />
                                )}

                                <div className={styles.uploadCardInfo}>
                                    <h1>
                                        {item.filename.substring(0, 15)}
                                        {item.filename.length >= 16 ? "..." : ""}
                                    </h1>
                                    {favourites?.includes(item.id) ? (
                                        <div
                                            onClick={() =>
                                                toast.promise(handleRemoveFavourites(item.id, userInfo?.User, favourites), {
                                                    loading: "Removing...",
                                                    success: "Removed from favourites.",
                                                    error: "Could not removed.",
                                                })
                                            }
                                        >
                                            <FavouriteIconOn className={styles.fav} />
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() =>
                                                toast.promise(handleFavourites(item.id, userInfo?.User, favourites), {
                                                    loading: "Adding...",
                                                    success: "Added to favourites.",
                                                    error: "Could not be added.",
                                                })
                                            }
                                        >
                                            <FavouriteIconOff className={styles.fav} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default Uploads;
