import { atom, useAtom, useSetAtom } from "jotai";
import { ChangeEvent, useState } from "react";
import { toast } from "react-hot-toast";
import { FileItem, PreviewItemAtom, UserObject, previewScreenAtom, userDetails } from "../../../../../../store/store";
import { addToFavorites, removeFromFavorites } from "../../../../../APIs/actions";
import SceneCard from "../../../../../Components/SceneCard/SceneCard";
import Preview from "../Preview/Preview";
import SearchInput from "../SearchInput/SearchInput";
import { Shimmer } from "../Shimmer/Shimmer";
import styles from "./Objects.module.css";

// Props type
interface ChildProps {
    data: FileItem[];
    isError: boolean;
    isLoading: boolean;
}
export const ObjectPreviewAtom = atom<FileItem>({
    blobId: "",
    bloburl: "",
    category: "",
    corr2DImageUrl: "",
    fileextension: "",
    filename: "",
    id: "",
    isCompressed: false,
    subcategory: "",
    subtype: "",
    type: "",
    uploadCategory: "",
    userid: "",
});

const Objects: React.FC<ChildProps> = ({ data, isError, isLoading }) => {
    const [userInfo, setUserInfo] = useAtom(userDetails);
    const [favourites, setFavourites] = useState<string[]>(userInfo?.User?.favorites);
    const [searchValue, setSearchValue] = useState<string>("");
    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    const [previewScreen, setPreviewScreen] = useAtom(previewScreenAtom);
    const [categoriesSelected, setCategoriesSelected] = useState<string[]>([]);
    const [stopScroll, setStopScroll] = useState(false);

    const filters = [
        { emoji: "❤️", name: "Favourite" },
        { emoji: "🛏️", name: "Furniture and Home Decor" },
        { emoji: "🔌", name: "Lighting and Electrical" },
        { emoji: "🚌", name: "Transport and Vehicles" },
        { emoji: "🧑‍💻", name: "Technology and Entertainment" },
        { emoji: "🎨", name: "Art and Sculptures" },
        { emoji: "🚪", name: "Doors and Windows" },
        { emoji: "🔪", name: "Kitchen and Food Items" },
        { emoji: "🤖", name: "Miscellaneous" },
        { emoji: "🪞", name: "Mirrors and Glassware" },
        { emoji: "🏠", name: "Home Decor" },
        { emoji: "⌚", name: "Accessories" },
        { emoji: "📱", name: "Electronics" },
        { emoji: "🛋️", name: "Furniture" },
        { emoji: "📚", name: "Books" },
        { emoji: "🛸", name: "Other" },
        { emoji: "🍴", name: "Utensils" },
        { emoji: "🪴", name: "Plants" },
    ];

    const setPreviwItemData = useSetAtom(PreviewItemAtom);
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

    const handleButtonClick = (content: string) => {
        // Toggle the selection state for the button at the given index
        if (categoriesSelected.includes(content)) {
            setCategoriesSelected(categoriesSelected.filter((item) => item !== content));
        } else {
            setCategoriesSelected([...categoriesSelected, content]);
        }
    };

    // useEffect(() => {
    //     console.log(stopScroll, "sa");
    // }, [stopScroll]);

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
        <div className={styles.container}>
            <Preview />
        </div>
    ) : (
        <>
            <SearchInput value={searchValue} handleChange={handleSearchFilter} placeholder="Search for an custom object..." />
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
            <div className={stopScroll ? styles.containerStopScroll : styles.container}>
                {isLoading ? (
                    <Shimmer />
                ) : isError ? (
                    <div className={styles.noSceneTemplatesDiv}>Oops! Could not load custom objects.</div>
                ) : filteredData.length === 0 ? (
                    <div className={styles.noSceneTemplatesDiv}>Oops! No objects found.</div>
                ) : (
                    <div className={styles.cardContainer}>
                        {filteredData?.map((item) => (
                            <SceneCard
                                handleSetPreview={handleCardClick}
                                onClick={() => handleCardData(item)}
                                favourites={favourites}
                                handleFavourites={() =>
                                    toast.promise(handleFavourites(item.id, userInfo?.User, favourites), {
                                        loading: "Adding...",
                                        success: "Added to favourites.",
                                        error: "Could not be added.",
                                    })
                                }
                                handleRemoveFavourites={() =>
                                    toast.promise(handleRemoveFavourites(item.id, userInfo?.User, favourites), {
                                        loading: "Removing...",
                                        success: "Removed from favourites.",
                                        error: "Could not removed.",
                                    })
                                }
                                key={item.id}
                                item={item}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Objects;
