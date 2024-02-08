/* eslint-disable react-hooks/exhaustive-deps */
import { useAtom } from "jotai";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserObject, handleCustomPalettePreviewModal, palletClickedInfo, palletSelectedInfo, userDetails } from "../../../../../../../../store/store";
import { addToFavorites, getCustomPaletteFiles, removeFromFavorites } from "../../../../../../../APIs/actions";
import { FavouriteIconOff, FavouriteIconOn } from "../../../../../../../Components/SceneCard/Icons";
import SearchInput from "../../../../../AssetLibrary/Components/SearchInput/SearchInput";
import { Shimmer } from "../../../../../AssetLibrary/Components/Shimmer/Shimmer";
import { ArrowDoodleIcon, PolaroidIcon } from "../../../../../Icons/Icons";
import { PaletteItem } from "../PresetsPalette/PresetsPalette";
import styles from "./CustomPalette.module.css";
import CustomPalettePreview from "./CustomPalettePreview/CustomPalettePreview";

interface CustomPaletteProps {
    selectedFile: File | undefined;
}

const CustomPalette: React.FC<CustomPaletteProps> = ({ selectedFile }) => {
    const [paletteData, setPaletteData] = useState<PaletteItem[]>([]);
    const [pallInfoSelected] = useAtom(palletSelectedInfo);
    const [, setPalletClickedInfo] = useAtom(palletClickedInfo);
    const [filterSearchTimeout, setFilterSearchTimeout] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [searchValue, setSearchValue] = useState<string>("");
    const [userInfo, setUserInfo] = useAtom(userDetails);
    const userId: string = userInfo.User.id;
    const [favourites, setFavourites] = useState<string[]>(userInfo?.User?.favorites);
    const [selectedPalette, setSelectedPalette] = useAtom(handleCustomPalettePreviewModal);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [searchChange, setSearchChange] = useState<boolean>(false);

    const handlePaletteCardClick = () => {
        setSearchChange(false);
        setSelectedPalette(true);
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchChange(true);
        setSearchValue(e.target.value);
    };

    const handleFavIconClick = (data: PaletteItem) =>
        favourites?.includes(data.id)
            ? toast.promise(handleRemoveFavourites(data.id, userInfo?.User, favourites), {
                  loading: "Removing...",
                  success: "Removed from favourites",
                  error: "Could not be removed",
              })
            : toast.promise(handleFavourites(data.id, userInfo?.User, favourites), {
                  loading: "Adding...",
                  success: "Added to favourites",
                  error: "Could not be added",
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

    const getPaletteFiles = useCallback(async () => {
        setIsLoading(true);
        const { data, status } = await getCustomPaletteFiles(userId);
        if (status === 200) {
            setPaletteData(data);
            setIsError(false);
            setIsLoading(false);
        } else if (status === 404) {
            setPaletteData([]);
            setIsError(false);
            setIsLoading(false);
        } else {
            setIsError(true);
            setIsLoading(false);
        }
    }, [userId]);

    const filteredPaletteData = paletteData.filter(({ title }) => title.toLowerCase().includes(searchValue.toLowerCase()));

    useEffect(() => {
        if (searchChange) {
            clearTimeout(filterSearchTimeout);
            setFilterSearchTimeout(
                setTimeout(() => {
                    getPaletteFiles();
                }, 500)
            );
        }
    }, [getPaletteFiles, searchChange, searchValue]);

    useEffect(() => {
        getPaletteFiles();
    }, [getPaletteFiles]);

    return (
        <>
            {selectedPalette ? (
                <div className={styles.mainContainer} style={{ padding: selectedPalette && "1rem" }}>
                    <CustomPalettePreview setSelectedPalette={setSelectedPalette} selectedFile={selectedFile} getPaletteFiles={getPaletteFiles} />
                </div>
            ) : (
                <>
                    {paletteData.length ? (
                        <>
                            <SearchInput value={searchValue} handleChange={handleSearchChange} placeholder="Eg. playful, chill, etc." autoFocus={true} />
                            <div className={styles.mainContainer}>
                                {/* palette cards */}
                                {isLoading ? (
                                    <Shimmer colorsModal />
                                ) : isError ? (
                                    <div className={styles.noPalettesTemplatesDiv}>Error...</div>
                                ) : filteredPaletteData.length ? (
                                    <div className={styles.paletteContainer} style={{ marginTop: 0, height: "320px" }}>
                                        {filteredPaletteData.map((data, index) => (
                                            <div
                                                className={pallInfoSelected.id === data.id ? styles.paletteSelected : styles.palette}
                                                key={index}
                                                onClick={() => {
                                                    setPalletClickedInfo(data);
                                                    handlePaletteCardClick();
                                                }}
                                            >
                                                <div
                                                    className={`${styles.colorcontainer} ${
                                                        data.hexCodes.length >= 10
                                                            ? styles.colorcontainer4x3
                                                            : data.hexCodes.length >= 7
                                                            ? styles.colorcontainer3x3
                                                            : styles.colorcontainer3x2
                                                    }`}
                                                >
                                                    {data.hexCodes.map((color: string, index: number) => (
                                                        <div key={index} className={styles.colorbox} style={{ backgroundColor: `#${color}` }}>
                                                            <p>#{color}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className={styles.paletteInfo}>
                                                    <p>{data.title.substring(0, 20)}</p>
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFavIconClick(data);
                                                        }}
                                                    >
                                                        {favourites?.includes(data.id) ? (
                                                            <FavouriteIconOn className={styles.favIcon} />
                                                        ) : (
                                                            <FavouriteIconOff className={styles.favIcon} />
                                                        )}
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
                    ) : (
                        <EmptyCustomPallete />
                    )}
                </>
            )}
        </>
    );
};

const EmptyCustomPallete = () => {
    return (
        <div className={styles.emptyMainContainer}>
            <div className={styles.polaroid}>
                <PolaroidIcon />
            </div>
            <p>Scan an image to generate a custom color palette</p>
            <div className={styles.emptyArrow}>
                <ArrowDoodleIcon />
            </div>
        </div>
    );
};

export default CustomPalette;
