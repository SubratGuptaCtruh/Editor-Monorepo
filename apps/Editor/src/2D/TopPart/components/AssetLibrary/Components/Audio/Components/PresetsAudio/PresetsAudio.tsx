/* eslint-disable react-hooks/exhaustive-deps */
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { AddSpatialAudio } from "../../../../../../../../3D/EditorLogic/commands/AddSpatialAudio/AddSpatialAudio";
import { ChangeBackgroundAudioCommand } from "../../../../../../../../3D/EditorLogic/commands/BackgroundCommands/BackgroundCommands";
import { editor } from "../../../../../../../../3D/EditorLogic/editor";
import { assetLibraryModalAtom, audioSelectedInfoAtom, backgroundAudioModalAtom, backgroundAudioSelectedInfoAtom, userDetails } from "../../../../../../../../store/store";
import { getAllAudioFiles, getAllAudioFilesByPagination, updateUserDetails } from "../../../../../../../APIs/actions";
import Button from "../../../../../../../Components/Button/Button";
import { useSelectedState } from "../../../../../../../Hooks/useSelected";
import { AudioProps } from "../../../../AssetLibrary";
import SearchInput from "../../../SearchInput/SearchInput";
import { AudioData } from "../../Audio";
import { AudioShimmer } from "../AudioShimmer/AudioShimmer";
import styles from "./PresetsAudio.module.css";

interface PresetsAudioProps {
    inputPlaceholder: string;
    soundLibraryModal?: boolean;
    actionButtonType: string;
    assetModalClose?: () => void;
}

const PresetsAudio: React.FC<PresetsAudioProps> = ({ inputPlaceholder, soundLibraryModal, actionButtonType, assetModalClose }) => {
    const [searchText, setSearchText] = useState<string>("");
    const [audioFilters, setAudioFilters] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [allData, setAllData] = useState<AudioProps[]>([]);
    const [userInfo, setUserInfo] = useAtom(userDetails);
    const [favourites, setFavourites] = useState<string[]>(userInfo?.User?.favorites);
    const [paginationData, setPaginationData] = useState<AudioProps[]>([]);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const [isDataCompleted, setIsDataCompleted] = useState(false);
    const [audioPageNumber, setAudioPageNumber] = useState<number>(1);
    const [filterSearchTimeout, setFilterSearchTimeout] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [positionTop, setPositionTop] = useState<number>(0);
    const setAssetModal = useSetAtom(assetLibraryModalAtom);
    const backgroundAudioModal = useAtomValue(backgroundAudioModalAtom);
    const [audioSelectedInfo, setAudioSelectedInfo] = useAtom(audioSelectedInfoAtom);
    const [backgroundAudioSelectedInfo, setBackgroundAudioSelectedInfo] = useAtom(backgroundAudioSelectedInfoAtom);
    const [, setStopScroll] = useState(false);
    const [newSpatialAudio, setNewSpatialAudio] = useState<AudioProps | null>(null); // for adding spatial audio from asset library
    const selectedObj = useSelectedState(editor);
    const audioPageLimit: number = 8;
    const filters = ["Favourite", "Ambient", "Children", "Electronic", "Funk", "Groove", "Hip-Hop", "Indie", "Jazz", "Pop", "R&B"];

    const handleSearchText = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleAudioFilters = (filterName: string) => {
        if (audioFilters.includes(filterName)) {
            setAudioFilters(audioFilters.filter((item) => item !== filterName));
        } else {
            setAudioFilters([...audioFilters, filterName]);
        }
    };

    const handleAudioDataClick = async (audioData: AudioProps) => {
        // check for asset library and sound library modal in preset audio
        if (soundLibraryModal) {
            // check for background audio and spatial audio in sound library
            if (backgroundAudioModal) {
                const updatedUser = { backgroundAudioId: audioData.id };
                const { data, status } = await updateUserDetails(updatedUser, userInfo.User.id);
                if (status === 200) {
                    setUserInfo({ ...userInfo, User: data });
                    setBackgroundAudioSelectedInfo(audioData);
                    // editor.backGroundSystem?.setAudio(audioData.url, audioData.title);
                    editor.executer(new ChangeBackgroundAudioCommand(editor, { url: audioData.url, name: audioData.title }));
                    return;
                }
                setBackgroundAudioSelectedInfo(audioData);
                editor.backGroundSystem?.setAudio(audioData.url, audioData.title);
                // editor.executer(new ChangeBackgroundAudioCommand(editor, {url: audioData.url, name: audioData.title}))
            } else {
                setAudioSelectedInfo(audioData);
            }
        } else {
            setNewSpatialAudio(audioData);
        }
    };

    const getAudioFiles = async () => {
        setIsLoading(true);
        const { data, status } = await getAllAudioFiles();
        if (status === 200) {
            setAllData(data);
            setPaginationData(data);
            setIsError(false);
            setIsLoading(false);
        } else {
            setIsError(true);
            setIsLoading(false);
        }
    };

    const getPaginatedAudioFiles = useCallback(async () => {
        setIsLoading(true);
        const { data, status } = await getAllAudioFilesByPagination(audioPageLimit, audioPageNumber, searchText, audioFilters.filter((item) => item !== "favourite").toString());
        if (status === 200) {
            if (data.length === 0) {
                setIsDataCompleted(true);
            } else {
                setIsDataCompleted(false);
            }
            if (audioPageNumber === 1) {
                setPaginationData(data);
            } else {
                setPaginationData((prev) => [...prev, ...data]);
            }
            setIsError(false);
            setIsLoading(false);
        } else {
            setIsError(true);
            setIsLoading(false);
        }
    }, [audioFilters, audioPageNumber, searchText]);

    const displayAudios = audioFilters.includes("favourite")
        ? audioFilters.length === 1
            ? allData.filter((item) => favourites.includes(item.id) && item.title.toLowerCase().startsWith(searchText.toLowerCase()))
            : paginationData.filter((item) => favourites.includes(item.id))
        : paginationData;

    useEffect(() => {
        setAudioPageNumber(1);
        getPaginatedAudioFiles();
    }, [audioFilters]);

    useEffect(() => {
        clearTimeout(filterSearchTimeout);
        setFilterSearchTimeout(
            setTimeout(() => {
                setAudioPageNumber(1);
                getPaginatedAudioFiles();
            }, 500)
        );
    }, [searchText]);

    useEffect(() => {
        getAudioFiles();
    }, []);

    useEffect(() => {
        if (audioPageNumber !== 1) {
            getPaginatedAudioFiles();
        }
    }, [audioPageNumber]);

    useEffect(() => {
        const sentinelRefCurrent = sentinelRef.current;
        const options = {
            root: null,
            rootMargin: "0px",
            threshold: 1.0,
        };

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !isLoading) {
                if ((audioFilters.length !== 1 || !audioFilters.includes("favourite")) && displayAudios.length >= audioPageLimit) {
                    setAudioPageNumber((prev) => prev + 1);
                }
            }
        }, options);

        if (sentinelRefCurrent) {
            observer.observe(sentinelRefCurrent);
        }

        return () => {
            if (sentinelRefCurrent) {
                observer.unobserve(sentinelRefCurrent);
            }
        };
    }, [isLoading, audioFilters]);

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: positionTop,
        });
    }, [isLoading, positionTop]);

    // Function for scroll position
    const handleScroll = () => {
        const el = scrollRef.current;
        if (el) {
            setPositionTop(el.scrollTop);
        }
    };

    useEffect(() => {
        const element = scrollRef.current;
        element?.addEventListener("scroll", handleScroll);

        return () => {
            element?.removeEventListener("scroll", handleScroll);
        };
    }, [isLoading]);

    if (isError) {
        return <div className={styles.noAudioTemplatesDiv}>Oops! Could not load audio files.</div>;
    }

    return (
        <>
            <SearchInput handleChange={handleSearchText} placeholder={inputPlaceholder} value={searchText} autoFocus={true} />
            <div
                className={styles.sceneButtons}
                style={{ maxWidth: soundLibraryModal ? "" : "630px" }}
                onWheel={(event) => (event.currentTarget.scrollLeft += event.deltaY)}
                onMouseOver={() => setStopScroll(true)}
                onMouseOut={() => setStopScroll(false)}
            >
                {filters.map((filter, index) => (
                    <>
                        <button
                            key={filter}
                            className={audioFilters.includes(filter.toLowerCase()) ? `${styles.selectedSceneButton} ${styles.sceneButton}` : styles.sceneButton}
                            onClick={() => handleAudioFilters(filter.toLowerCase())}
                        >
                            {filter === "Favourite" ? "❤️ Favourite" : filter}
                        </button>
                        {index === 0 && <div></div>}
                    </>
                ))}
            </div>
            {isLoading ? (
                <AudioShimmer soundLibraryModal={soundLibraryModal} />
            ) : (
                <div ref={scrollRef} className={styles.audioMainContainer}>
                    {displayAudios.length ? (
                        <div className={styles.mappedMusicContainer}>
                            {displayAudios.map((data) => (
                                <AudioData
                                    key={data.id}
                                    data={data}
                                    onAudioClick={handleAudioDataClick}
                                    isSelected={
                                        !soundLibraryModal
                                            ? newSpatialAudio?.id === data.id
                                            : backgroundAudioModal
                                            ? backgroundAudioSelectedInfo?.id === data.id
                                            : audioSelectedInfo?.id === data.id || data.url === selectedObj?.metadata.data.audioSources
                                    }
                                    soundLibraryModal={soundLibraryModal}
                                    actionButtonType={actionButtonType}
                                    customAudio={false}
                                    favourites={favourites}
                                    setFavourites={setFavourites}
                                    assetModalClose={assetModalClose}
                                />
                            ))}
                            <div ref={!isDataCompleted ? sentinelRef : undefined}></div>
                        </div>
                    ) : (
                        <div className={styles.noAudioTemplatesDiv}>No audio found!</div>
                    )}
                    {/* show button only in asset library and when newSpatialAudio is selected */}
                    {!soundLibraryModal && newSpatialAudio && (
                        <div className={styles.audioAction}>
                            <Button
                                content="CREATE AUDIO"
                                onClick={() => {
                                    // add spatial audio stored in newSpatialAudio
                                    if (newSpatialAudio) {
                                        editor.executer(new AddSpatialAudio(editor, newSpatialAudio.url, newSpatialAudio.title));
                                    }
                                    setAssetModal(false);
                                }}
                            />
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default PresetsAudio;
