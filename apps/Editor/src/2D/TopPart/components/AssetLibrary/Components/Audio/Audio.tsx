import { useAtom } from "jotai";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { ChangeAudioCommand } from "../../../../../../3D/EditorLogic/commands/AudioCommands/AudioCommands";
import { editor } from "../../../../../../3D/EditorLogic/editor";
import { UserObject, currentAudioPlayingAtom, userDetails } from "../../../../../../store/store";
import { addToFavorites, deleteCustomAudio, removeFromFavorites } from "../../../../../APIs/actions";
import { FavouriteIconOff, FavouriteIconOn } from "../../../../../Components/SceneCard/Icons";
import { DeleteSvgIcon } from "../../../../../RightPart/components/Icon/Icon";
import { AudioPauseIcon, MusicIcons, PlayIcon, SelectedAudioIcon } from "../../../Icons/Icons";
import { AudioProps as AudioProp } from "../../AssetLibrary";
import styles from "./Audio.module.css";
import PresetsAudio from "./Components/PresetsAudio/PresetsAudio";
import UploadedAudio from "./Components/UploadedAudio/UploadedAudio";

interface AudioDataProps {
    data: AudioProp;
    onAudioClick: (data: AudioProp) => void;
    isSelected: boolean;
    soundLibraryModal?: boolean;
    actionButtonType: string;
    customAudio: boolean;
    favourites: string[];
    setFavourites: React.Dispatch<React.SetStateAction<string[]>>;
    setPaginationCustomAudioData?: React.Dispatch<React.SetStateAction<AudioProp[]>>;
    assetModalClose?: () => void;
}
interface AudioProps {
    headerSelected?: string;
    inputPlaceholder?: string;
    soundLibraryModal?: boolean;
    actionButtonType?: string;
    customAudio?: boolean;
    assetModalClose?: () => void;
}

export const AudioData: React.FC<AudioDataProps> = ({
    data,
    onAudioClick,
    isSelected,
    soundLibraryModal,
    actionButtonType,
    customAudio,
    favourites,
    setFavourites,
    setPaginationCustomAudioData,
    assetModalClose,
}) => {
    const [userInfo, setUserInfo] = useAtom(userDetails);
    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    const [currentAudioPlaying, setCurrentAudioPlaying] = useAtom(currentAudioPlayingAtom);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const updateAudioSourceAsync = (name: string, url: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            // editor.updateAudioSource(name, url);
            const selectedId = editor.selector.selected?.id;
            if (selectedId) {
                const audioInstance = editor.audioSystem.getAudioById(selectedId);
                // audioInstance.setAudio(url, name);
                editor.executer(new ChangeAudioCommand(editor, audioInstance, { url, name }));
                resolve();
            } else {
                reject("Audio is not selected");
            }
        });
    };

    const handleButtonClick = () => {
        onAudioClick(data);
        // update audio only from sound library not from asset library
        if (soundLibraryModal) {
            toast.promise(updateAudioSourceAsync(data.title, data.url), {
                loading: "Updating...",
                success: "Audio updated.",
                error: "Audio could not be updated.",
            });
            if (assetModalClose) {
                assetModalClose();
            }
        }
    };

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

    const handleDeleteCustomAudio = async () => {
        const { status } = await deleteCustomAudio(data.id);
        if (status === 200 && setPaginationCustomAudioData) {
            setPaginationCustomAudioData((prev) => prev.filter(({ id }) => id !== data.id));
        } else {
            throw new Error("Could not be deleted.");
        }
    };

    const handlePlayPause = (audioData: AudioProp) => {
        const clickedAudioId = audioData.id;
        // Check if clicked music ID is the same as currently playing music ID
        if (currentAudioPlaying && currentAudioPlaying === clickedAudioId) {
            if (audioRef.current) {
                audioRef.current.pause();
                setCurrentAudioPlaying("");
            }
        } else {
            // removed handleButtonClick function call as we do not want to update audio if user is checking some audio
            if (currentAudioPlaying === "" && audioRef.current) {
                audioRef.current.src = audioData.url;
                audioRef.current.load();
                audioRef.current.play();
                setCurrentAudioPlaying(clickedAudioId);
            } else {
                toast.error("You can only preview one audio at a time.");
            }
        }
    };

    return (
        <div className={`${isSelected ? styles.clickedButton : styles.MusicBox}`} onClick={handleButtonClick}>
            <div className={styles.leftSideCard}>
                {isSelected ? (
                    <div className={styles.musicImage}>
                        <SelectedAudioIcon />
                    </div>
                ) : customAudio ? (
                    <div className={styles.musicImage} style={{ background: "#AEA2DB" }}>
                        <MusicIcons />
                    </div>
                ) : (
                    <img className={styles.musicImage} src="./musicImage.jpg" />
                )}
                <div className={styles.leftSideText}>
                    <p>{data.title}</p>
                    {soundLibraryModal && <p className={styles.leftSideTextDuration}>{data.duration}</p>}
                </div>
            </div>
            <div className={styles.rightSideCard}>
                <button
                    className={styles.rightButton}
                    onClick={(e) => {
                        // do not want to update audio if user is checking some audio
                        e.stopPropagation();
                        handlePlayPause(data);
                    }}
                >
                    {currentAudioPlaying === data.id ? <AudioPauseIcon /> : <PlayIcon />}
                </button>
                {actionButtonType === "Favourite" ? (
                    favourites?.includes(data.id) ? (
                        <div
                            onClick={(e) => {
                                // do not want to update audio if user is clicking on favourites
                                e.stopPropagation();
                                toast.promise(handleRemoveFavourites(data.id, userInfo?.User, favourites), {
                                    loading: "Removing...",
                                    success: "Removed from favourites.",
                                    error: "Could not removed.",
                                });
                            }}
                        >
                            <FavouriteIconOn className={styles.fav} />
                        </div>
                    ) : (
                        <div
                            onClick={(e) => {
                                // do not want to update audio if user is clicking on favourites
                                e.stopPropagation();
                                toast.promise(handleFavourites(data.id, userInfo?.User, favourites), {
                                    loading: "Adding...",
                                    success: "Added to favourites.",
                                    error: "Could not be added.",
                                });
                            }}
                        >
                            <FavouriteIconOff className={styles.fav} />
                        </div>
                    )
                ) : (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            toast.promise(handleDeleteCustomAudio(), {
                                loading: "Deleting...",
                                success: "Deleted from custom audio.",
                                error: "Could not be deleted.",
                            });
                        }}
                    >
                        <DeleteSvgIcon />
                    </div>
                )}
            </div>
            <audio ref={audioRef} src={data.url} />
        </div>
    );
};

const Audio: React.FC<AudioProps> = ({
    headerSelected = "ctruh",
    inputPlaceholder = "Search for an audio...",
    soundLibraryModal,
    actionButtonType = "Favourite",
    assetModalClose,
}) => {
    return (
        <>
            {headerSelected === "ctruh" || headerSelected === "presets" ? (
                <PresetsAudio inputPlaceholder={inputPlaceholder} soundLibraryModal={soundLibraryModal} actionButtonType={actionButtonType} assetModalClose={assetModalClose} />
            ) : (
                <UploadedAudio inputPlaceholder={inputPlaceholder} soundLibraryModal={soundLibraryModal} actionButtonType={actionButtonType} assetModalClose={assetModalClose} />
            )}
        </>
    );
};

export default Audio;
