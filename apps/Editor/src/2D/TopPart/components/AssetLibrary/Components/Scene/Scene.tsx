import { useAtom, useSetAtom } from "jotai";
import { ChangeEvent, useState } from "react";
import { toast } from "react-hot-toast";
import { FileItem, PreviewItemAtom, UserObject, previewScreenAtom, userDetails } from "../../../../../../store/store";
import { addToFavorites, removeFromFavorites } from "../../../../../APIs/actions";
import SceneCard from "../../../../../Components/SceneCard/SceneCard";
import Preview from "../Preview/Preview";
import SearchInput from "../SearchInput/SearchInput";
import { Shimmer } from "../Shimmer/Shimmer";
import styles from "./Scene.module.css";

// Props type
interface ChildProps {
    data: FileItem[];
    isError: boolean;
    isLoading: boolean;
}

const Scene: React.FC<ChildProps> = ({ data, isError, isLoading }) => {
    const [userInfo, setUserInfo] = useAtom(userDetails);
    const [favourites, setFavourites] = useState<string[]>(userInfo?.User?.favorites);
    const [searchValue, setSearchValue] = useState<string>("");
    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    const [previewScreen, setPreviewScreen] = useAtom(previewScreenAtom);
    const setPreviwItemData = useSetAtom(PreviewItemAtom);
    const [categoriesSelected, setCategoriesSelected] = useState<string[]>([]);
    const [stopScroll, setStopScroll] = useState(false);
    const handleCardClick = () => {
        setPreviewScreen(true);
    };

    const handleCardData = (data: FileItem) => {
        setPreviwItemData(data);
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

    // Function to set search value
    const handleSearchFilter = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const filters = [
        { emoji: "❤️", name: "Favourite" },
        { emoji: "🛏️", name: "Bedroom Scene" },
        { emoji: "🎨", name: "Interior Design" },
        { emoji: "🏠", name: "Living Room Scene" },
        { emoji: "🛋️", name: "Modern Scene" },
        { emoji: "🛸", name: "Other" },
    ];
    const handleButtonClick = (content: string) => {
        // Toggle the selection state for the button at the given index
        if (categoriesSelected.includes(content)) {
            setCategoriesSelected(categoriesSelected.filter((item) => item !== content));
        } else {
            setCategoriesSelected([...categoriesSelected, content]);
        }
    };

    const filteredData = data
        ?.filter((filterValue) => {
            if (searchValue === "") {
                return filterValue;
            } else if (filterValue?.filename.toLowerCase().includes(searchValue.toLowerCase())) return filterValue;
        })
        ?.filter((categoryData) => {
            if (categoriesSelected.length === 0 || (categoriesSelected.length === 1 && categoriesSelected[0] === "Favourite")) {
                return categoryData;
            } else if (categoriesSelected.includes(categoryData?.category as string)) {
                return categoryData;
            }
        })
        ?.filter((item) => (categoriesSelected.includes("Favourite") ? favourites.includes(item.id) : true));

    return previewScreen ? (
        <div className={styles.sceneMainContainer}>
            <Preview />
        </div>
    ) : (
        <>
            <SearchInput value={searchValue} handleChange={handleSearchFilter} placeholder="Search for a scene..." />
            {/* buttons */}
            <div
                className={styles.categoryButtons}
                onWheel={(event) => (event.currentTarget.scrollLeft += event.deltaY)}
                onMouseOver={() => setStopScroll(true)}
                onMouseOut={() => setStopScroll(false)}
            >
                {filters.map(({ emoji, name }, index) => (
                    <>
                        <button
                            key={name}
                            value={name}
                            className={categoriesSelected.includes(name) ? `${styles.categoryButtonActive} ${styles.categoryButton}` : styles.categoryButton}
                            onClick={() => handleButtonClick(name)}
                        >
                            {emoji} {name}
                        </button>
                        {index === 0 && <div></div>}
                    </>
                ))}
            </div>
            <div className={stopScroll ? styles.containerStopScroll : styles.sceneMainContainer}>
                {isLoading ? (
                    <Shimmer />
                ) : isError ? (
                    <div className={styles.noSceneTemplatesDiv}>Oops! Could not load scene templates.</div>
                ) : filteredData.length === 0 ? (
                    <div className={styles.noSceneTemplatesDiv}>Oops! No scenes found.</div>
                ) : (
                    <div className={styles.sceneContainer}>
                        {filteredData?.map((template) => (
                            <SceneCard
                                onClick={() => handleCardData(template)}
                                handleSetPreview={handleCardClick}
                                favourites={favourites}
                                key={template.id}
                                item={template}
                                handleFavourites={() =>
                                    toast.promise(handleFavourites(template.id, userInfo?.User, favourites), {
                                        loading: "Adding...",
                                        success: "Added to favourites.",
                                        error: "Could not be added.",
                                    })
                                }
                                handleRemoveFavourites={() =>
                                    toast.promise(handleRemoveFavourites(template.id, userInfo?.User, favourites), {
                                        loading: "Removing...",
                                        success: "Removed from favourites.",
                                        error: "Could not removed.",
                                    })
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Scene;
