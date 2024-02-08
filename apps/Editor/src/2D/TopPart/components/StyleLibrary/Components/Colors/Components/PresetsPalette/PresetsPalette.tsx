/* eslint-disable react-hooks/exhaustive-deps */
import { useAtom, useSetAtom } from "jotai";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserObject, openStyle, palletSelectedInfo, userDetails } from "../../../../../../../../store/store";
import { addToFavorites, getPaletteFiles, removeFromFavorites } from "../../../../../../../APIs/actions";
import { FavouriteIconOff, FavouriteIconOn } from "../../../../../../../Components/SceneCard/Icons";
import SearchInput from "../../../../../AssetLibrary/Components/SearchInput/SearchInput";
import { Shimmer } from "../../../../../AssetLibrary/Components/Shimmer/Shimmer";
import styles from "./PresetsPalette.module.css";

export interface PaletteItem {
    id: string;
    title: string;
    tags: string[];
    hexCodes: string[];
}

const PresetsPalette = () => {
    const [paletteData, setPaletteData] = useState<PaletteItem[]>([]);
    const [filteredPaletteData, setFilteredPaletteData] = useState<PaletteItem[]>([]);
    const [pallInfoSelected, setPalletSelectedInfo] = useAtom(palletSelectedInfo);
    const [filterSearchTimeout, setFilterSearchTimeout] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [searchValue, setSearchValue] = useState<string>("");
    const filters = [
        { emoji: "❤️", name: "Favourite" },
        { emoji: "🌳", name: "Nature" },
        { emoji: "🎉", name: "Vibrant" },
        { emoji: "⚪️", name: "Minimal" },
        { emoji: "👔", name: "Professional" },
        { emoji: "🪷", name: "Soothing" },
        { emoji: "💞", name: "Romantic" },
        { emoji: "🤡", name: "Quirky" },
        { emoji: "🤖", name: "Sci-Fi" },
        { emoji: "🦄", name: "Fantasy" },
    ];
    const [paletteFilters, setPaletteFilters] = useState<string[]>([]);
    const [userInfo, setUserInfo] = useAtom(userDetails);
    const [favourites, setFavourites] = useState<string[]>(userInfo?.User?.favorites);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [searchChange, setSearchChange] = useState<boolean>(false);
    const [stopScroll, setStopScroll] = useState(false);
    const setOpenStyleLibrary = useSetAtom(openStyle);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        setSearchChange(true);
    };

    const handlePaletteFilters = (filterName: string) => {
        if (paletteFilters.includes(filterName)) {
            setPaletteFilters(paletteFilters.filter((item) => item !== filterName));
        } else {
            setPaletteFilters([...paletteFilters, filterName]);
        }
        setSearchChange(false);
    };

    const handleFavIconClick = (data: PaletteItem) =>
        favourites?.includes(data.id)
            ? toast.promise(handleRemoveFavourites(data.id, userInfo?.User, favourites), {
                  loading: "Removing...",
                  success: "Removed from favourites.",
                  error: "Could not removed.",
              })
            : toast.promise(handleFavourites(data.id, userInfo?.User, favourites), {
                  loading: "Adding...",
                  success: "Added to favourites.",
                  error: "Could not be added.",
              });

    const handleFavourites = async (id: string, userDetails: UserObject["User"], favourites: string[]) => {
        if (!isExecuting) {
            setIsExecuting(true);
            const { data, status } = await addToFavorites(id, userDetails, favourites);
            if (status === 200) {
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

    const handleRemoveFavourites = async (id: string, userDetails: UserObject["User"], favourites: string[]) => {
        if (!isExecuting) {
            setIsExecuting(true);
            const updatedFavorites = favourites?.filter((elem) => elem !== id);
            userDetails.favorites = updatedFavorites;
            const { data, status } = await removeFromFavorites(id, updatedFavorites, userDetails);
            if (status === 200) {
                const User = data;
                const newData = { ...userInfo, User };
                setUserInfo(newData);
                localStorage.setItem("User", JSON.stringify(data));
                setFavourites(data?.favorites);
                setIsExecuting(false);
            } else {
                setIsExecuting(false);
                throw new Error("Could not be removed.");
            }
        }
    };

    const getAllPaletteFiles = useCallback(async () => {
        setIsLoading(true);
        const { data, status } = await getPaletteFiles(20, 1, "", "");
        if (status === 200) {
            setPaletteData(data);
            setFilteredPaletteData(data);
            setIsError(false);
            setIsLoading(false);
        } else {
            setIsError(true);
            setIsLoading(false);
        }
    }, []);

    const getFilteredPaletteFiles = useCallback(async () => {
        setIsLoading(true);
        const { data, status } = await getPaletteFiles(20, 1, searchValue, paletteFilters.filter((item) => item !== "Favourite").toString());
        if (status === 200) {
            setFilteredPaletteData(data.filter(({ tags }: { tags: string[] }) => tags));
            setIsError(false);
            setIsLoading(false);
        } else {
            setIsError(true);
            setIsLoading(false);
        }
    }, [searchValue, paletteFilters]);

    const displayPalettes = paletteFilters.includes("Favourite")
        ? paletteFilters.length === 1
            ? paletteData.filter((item) => favourites?.includes(item.id) && item.title.toLowerCase().startsWith(searchValue.toLowerCase()))
            : filteredPaletteData.filter((item) => favourites?.includes(item.id))
        : filteredPaletteData;

    useEffect(() => {
        if (!searchChange) getFilteredPaletteFiles();
        else {
            clearTimeout(filterSearchTimeout);
            setFilterSearchTimeout(
                setTimeout(() => {
                    getFilteredPaletteFiles();
                }, 500)
            );
        }
    }, [getFilteredPaletteFiles, searchChange]);

    useEffect(() => {
        getAllPaletteFiles();
    }, [getAllPaletteFiles]);

    return (
        <>
            <SearchInput value={searchValue} handleChange={handleSearchChange} placeholder="Eg. playful, chill, etc." autoFocus={true} />
            <div className={stopScroll ? styles.containerStopScroll : styles.mainContainer}>
                <div
                    className={styles.paletteButtons}
                    onWheel={(event) => (event.currentTarget.scrollLeft += event.deltaY)}
                    onMouseOver={() => setStopScroll(true)}
                    onMouseOut={() => setStopScroll(false)}
                >
                    {filters.map(({ emoji, name }, index) => (
                        <>
                            <button
                                key={name}
                                value={name}
                                className={paletteFilters.includes(name) ? `${styles.selectedPaletteButton} ${styles.paletteButton}` : styles.paletteButton}
                                onClick={() => handlePaletteFilters(name)}
                            >
                                {emoji} {name}
                            </button>
                            {index === 0 && <div></div>}
                        </>
                    ))}
                </div>
                {/* palette cards */}
                {isLoading ? (
                    <Shimmer colorsModal />
                ) : isError ? (
                    <div className={styles.noPalettesTemplatesDiv}>Error...</div>
                ) : displayPalettes.length ? (
                    <div className={styles.paletteContainer}>
                        {displayPalettes.map((data, index) => (
                            <div
                                className={pallInfoSelected.id === data.id ? styles.paletteSelected : styles.palette}
                                key={index}
                                onClick={() => {
                                    setPalletSelectedInfo(data);
                                    toast.success("Palette applied");
                                    setTimeout(() => {
                                        setOpenStyleLibrary(false);
                                    }, 500);
                                }}
                            >
                                <div
                                    className={`${styles.colorcontainer} ${
                                        data.hexCodes.length >= 10 ? styles.colorcontainer4x3 : data.hexCodes.length >= 7 ? styles.colorcontainer3x3 : styles.colorcontainer3x2
                                    }`}
                                >
                                    {data.hexCodes.map((color: string, index: number) => (
                                        <div key={index} className={styles.colorbox} style={{ backgroundColor: `#${color}` }}>
                                            <p>#{color}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.paletteInfo}>
                                    <p>{data.title}</p>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFavIconClick(data);
                                        }}
                                    >
                                        {favourites?.includes(data.id) ? <FavouriteIconOn className={styles.favIcon} /> : <FavouriteIconOff className={styles.favIcon} />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.noPalettesTemplatesDiv}>No palettes found!</div>
                )}
            </div>
        </>
    );
};

export default PresetsPalette;
