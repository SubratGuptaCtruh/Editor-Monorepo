/* eslint-disable react-hooks/exhaustive-deps */
import { useAtom, useAtomValue } from "jotai";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { ChangeBackgroundAudioCommand } from "../../../../../../../../3D/EditorLogic/commands/BackgroundCommands/BackgroundCommands";
import { editor } from "../../../../../../../../3D/EditorLogic/editor";
import { audioSelectedInfoAtom, backgroundAudioModalAtom, backgroundAudioSelectedInfoAtom, userDetails } from "../../../../../../../../store/store";
import { getAllCustomAudioFiles, updateUserDetails } from "../../../../../../../APIs/actions";
import { useSelectedState } from "../../../../../../../Hooks/useSelected";
import { AudioProps } from "../../../../AssetLibrary";
import SearchInput from "../../../SearchInput/SearchInput";
import { AudioData } from "../../Audio";
import { AudioShimmer } from "../AudioShimmer/AudioShimmer";
import styles from "./UploadedAudio.module.css";

interface UploadedAudioProps {
    inputPlaceholder: string;
    soundLibraryModal?: boolean;
    actionButtonType: string;
    assetModalClose?: () => void;
}

const UploadedAudio: React.FC<UploadedAudioProps> = ({ inputPlaceholder, soundLibraryModal, actionButtonType, assetModalClose }) => {
    const [searchText, setSearchText] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [paginationCustomAudioData, setPaginationCustomAudioData] = useState<AudioProps[]>([]);
    const [userInfo, setUserInfo] = useAtom(userDetails);
    const [favourites, setFavourites] = useState<string[]>(userInfo?.User?.favorites);
    const [filterSearchTimeout, setFilterSearchTimeout] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
    const backgroundAudioModal = useAtomValue(backgroundAudioModalAtom);
    const [audioSelectedInfo, setAudioSelectedInfo] = useAtom(audioSelectedInfoAtom);
    const [backgroundAudioSelectedInfo, setBackgroundAudioSelectedInfo] = useAtom(backgroundAudioSelectedInfoAtom);
    const [audioPageNumber, setAudioPageNumber] = useState<number>(1);
    const [isDataCompleted, setIsDataCompleted] = useState(false);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const [positionTop, setPositionTop] = useState<number>(0);
    const selectedObj = useSelectedState(editor);
    const audioPageLimit: number = 8;

    const handleSearchText = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleAudioDataClick = async (audioData: AudioProps) => {
        if (backgroundAudioModal) {
            const updatedUser = { backgroundAudioId: audioData.id };
            const { data, status } = await updateUserDetails(updatedUser, userInfo.User.id);
            if (status === 200) {
                setUserInfo({ ...userInfo, User: data });
                setBackgroundAudioSelectedInfo(audioData);
                editor.backGroundSystem?.setAudio(audioData.url, audioData.title);
                editor.executer(new ChangeBackgroundAudioCommand(editor, { url: audioData.url, name: audioData.title }));
            }
            setBackgroundAudioSelectedInfo(audioData);
            // editor.backGroundSystem?.setAudio(audioData.url, audioData.title);
        } else {
            setAudioSelectedInfo(audioData);
        }
    };

    const getPaginatedCustomAudioFiles = useCallback(async () => {
        setIsLoading(true);
        const { data, status } = await getAllCustomAudioFiles(audioPageLimit, audioPageNumber, searchText, userInfo.User.id);
        if (status === 200) {
            if (data.length === 0) {
                setIsDataCompleted(true);
            } else {
                setIsDataCompleted(false);
            }
            if (audioPageNumber === 1) {
                setPaginationCustomAudioData(data);
            } else {
                setPaginationCustomAudioData((prev) => [...prev, ...data]);
            }
            setIsError(false);
            setIsLoading(false);
        } else {
            setIsError(true);
            setIsLoading(false);
        }
    }, [audioPageNumber, searchText, userInfo.User.id]);

    useEffect(() => {
        clearTimeout(filterSearchTimeout);
        setFilterSearchTimeout(
            setTimeout(() => {
                setAudioPageNumber(1);
                getPaginatedCustomAudioFiles();
            }, 500)
        );
    }, [searchText]);

    useEffect(() => {
        getPaginatedCustomAudioFiles();
    }, []);

    useEffect(() => {
        getPaginatedCustomAudioFiles();
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
                setAudioPageNumber((prev) => prev + 1);
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
    }, [isLoading]);

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
            {isLoading ? (
                <AudioShimmer soundLibraryModal={soundLibraryModal} />
            ) : (
                <div ref={scrollRef} className={styles.audioMainContainer}>
                    {paginationCustomAudioData.length ? (
                        <div className={styles.mappedMusicContainer}>
                            {paginationCustomAudioData.map((data) => (
                                <AudioData
                                    key={data.id}
                                    data={data}
                                    onAudioClick={handleAudioDataClick}
                                    isSelected={
                                        backgroundAudioModal
                                            ? backgroundAudioSelectedInfo?.id === data.id
                                            : audioSelectedInfo?.id === data.id || data.url === selectedObj?.metadata.data.audioSources
                                    }
                                    soundLibraryModal={soundLibraryModal}
                                    actionButtonType={actionButtonType}
                                    customAudio={true}
                                    favourites={favourites}
                                    setFavourites={setFavourites}
                                    setPaginationCustomAudioData={setPaginationCustomAudioData}
                                    assetModalClose={assetModalClose}
                                />
                            ))}
                            <div ref={!isDataCompleted ? sentinelRef : undefined}></div>
                        </div>
                    ) : (
                        <div className={styles.noAudioTemplatesDiv}>No audio found!</div>
                    )}
                </div>
            )}
        </>
    );
};

export default UploadedAudio;
