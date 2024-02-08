import { useAtomValue, useSetAtom } from "jotai";
import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";
import { ChangeAudioCommand } from "../../../../../3D/EditorLogic/commands/AudioCommands/AudioCommands";
import { editor } from "../../../../../3D/EditorLogic/editor";
import {
    FileItem,
    audioModalAtom,
    backgroundAudioModalAtom,
    sameFileAtom,
    sameFileItemAtom,
    sameFileModalAtom,
    uploadAndApplyMediaAtom,
    uploadModalAtom,
    userDetails,
} from "../../../../../store/store";
import { addCustomAudio, getSpecificFilesByUserId, handleUploadFile } from "../../../../APIs/actions";
import Modal from "../../../../Components/Modal/Modal";
import SliderWithInput from "../../../../Components/SlidersWithInput/SliderWithInput";
import { useAudioState } from "../../../../Hooks/useAudioState";
import { useSelectedState } from "../../../../Hooks/useSelected";
import { AudioPauseIcon, CloseIcon, UploadSvgIcon } from "../../../../TopPart/components/Icons/Icons";
import { FILE_TYPE, getFileTypeForFile, isFileValid } from "../../../../Utils/FileUpload.utils";
import { formatDuration } from "../../../../Utils/FormatDuration.utils";
import styles from "../../3DObject/3DObject.module.css";
import { FileFolderSvg, LoopSvg, PlaySvg, SkipSvg } from "../../Icon/Icon";
import SoundLibrary from "./SoundLibrary/SoundLibrary";

const Attribute = () => {
    const [assetModal, setAssetModal] = useState(false);
    const selectedObj = useSelectedState(editor);
    const userInfo = useAtomValue(userDetails);
    const setUploadModal = useSetAtom(uploadModalAtom);
    const setAudioModal = useSetAtom(audioModalAtom);
    const setBackgroundAudioModal = useSetAtom(backgroundAudioModalAtom);
    const setSameFileModal = useSetAtom(sameFileModalAtom);
    const setSameFile = useSetAtom(sameFileAtom);
    const setSameFileItem = useSetAtom(sameFileItemAtom);
    const setUploadAndApplyMedia = useSetAtom(uploadAndApplyMediaAtom);
    const audioFileTypes = ".mp3,.wav,.ogg";
    if (!selectedObj?.id) throw Error("Selected object doesn't have an id");
    const audioState = useAudioState(selectedObj?.id);

    const assetModalClose = () => {
        setAssetModal(false);
    };

    const handleAudioUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file: File | null = e.target.files?.[0] || null;

        const addCustomAudioFile = async (duration: number) => {
            if (file) {
                const { data, status } = await addCustomAudio(file, userInfo.User.id, formatDuration(duration));
                if (status === 200) {
                    const audioInstance = editor.audioSystem.getAudioById(selectedObj.id);
                    // audioInstance.setAudio(data.url, data.title);
                    editor.executer(new ChangeAudioCommand(editor, audioInstance, { url: data.url, name: data.title }));
                }
            }
        };

        const calculateAudioDurationAndAddAudio = async () => {
            if (file) {
                const audioElement = new Audio();
                audioElement.src = URL.createObjectURL(file);

                audioElement.onloadedmetadata = () => {
                    addCustomAudioFile(audioElement.duration);
                };
            } else {
                throw new Error("Could not be added.");
            }
        };

        // checking for same file name while uploading model objects
        const checkForSameNameObject = async (fileName: string) => {
            const userId = userInfo?.User?.id;
            const fileType = getFileTypeForFile(fileName);
            const { data, status } = await getSpecificFilesByUserId(userId, fileType);
            if (status === 200) {
                const sameFileNameObject = data.find((file: FileItem) => file.filename === fileName);
                return sameFileNameObject;
            }
        };

        if (file) {
            const fileName = file.name.toLowerCase();
            const acceptedFileTypes = audioFileTypes.split(",");
            const isValidFile = isFileValid(fileName, acceptedFileTypes);
            if (isValidFile) {
                const fileType = getFileTypeForFile(file.name);
                const sameFile = await checkForSameNameObject(file.name);
                if (sameFile) {
                    // open same file upload modal
                    setSameFileModal(true);
                    setSameFile(file);
                    setSameFileItem(sameFile);
                    setUploadAndApplyMedia("audio");
                } else {
                    // close same file upload modal
                    setSameFileModal(false);
                    setSameFile(null);
                    setSameFileItem(null);

                    if (fileType === FILE_TYPE.AUDIO) {
                        toast.promise(calculateAudioDurationAndAddAudio(), {
                            loading: "Adding...",
                            success: "Added the custom audio.",
                            error: "Could not be added.",
                        });
                    }
                    const uploadedData = await handleUploadFile(file, userInfo.User.id, fileType, undefined);
                    console.log(uploadedData, "uploaded Data");
                    toast.success("Your file has been securely uploaded.", {
                        duration: 3000,
                    });
                }
                setUploadModal(false);
            } else {
                toast.error("Oops! That's not a supported file type.", {
                    duration: 3000,
                });
            }
        }
    };

    // play pause functionality of spatial audio
    const handlePlayPauseClick = () => {
        const audioInstance = editor.audioSystem.getAudioById(selectedObj.id);
        if (audioInstance.state.playing) {
            audioInstance.pause();
        } else {
            const allAudios = editor.audioSystem.getAllAudios();
            Object.keys(allAudios).forEach((currentId) => {
                if (currentId !== selectedObj.id) {
                    const audioInstance = allAudios[currentId];
                    audioInstance.pause();
                }
            });
            audioInstance.play();
        }
    };

    // replay functionality of spatial audio
    const handleReplay = () => {
        const audioInstance = editor.audioSystem.getAudioById(selectedObj.id);
        audioInstance.reset();
    };

    // loop functionality of spatial audio
    const handleLoopToggle = () => {
        const audioInstance = editor.audioSystem.getAudioById(selectedObj.id);
        audioInstance.toggleLoop();
    };

    const play = audioState.playing;
    const loop = audioState.loop;

    const selectedAudioName = audioState.audioName;

    return (
        <>
            <div className={styles.BodyContainer}>
                <div className={styles.contentContainer}>
                    <span className={styles.text}>AUDIO</span>
                    <div className={styles.horizontalLineappearence}></div>
                </div>
                <div className={styles.musicInput}>
                    <div className={styles.inputContainer}>
                        {/* excluding the initial case of audio name 'Audio' while adding a spatial audio */}
                        {selectedAudioName && selectedAudioName !== "Audio"
                            ? `${selectedAudioName.substring(0, 10)}${selectedAudioName.length >= 11 ? "..." : ""}`
                            : "Select a sound file"}
                        <div
                            className={styles.audioInput}
                            onClick={() => {
                                const audioInstance = editor.audioSystem.getAudioById(selectedObj.id);
                                // audioInstance.removeAudio();
                                editor.executer(new ChangeAudioCommand(editor, audioInstance, { url: null, name: null }));
                            }}
                        >
                            {/* excluding the initial case of audio name 'Audio' while adding a spatial audio */}
                            {selectedAudioName && selectedAudioName !== "Audio" && <CloseIcon />}
                        </div>
                    </div>
                    <div
                        onClick={() => {
                            setAudioModal(true);
                            setBackgroundAudioModal(false);
                        }}
                        style={{ pointerEvents: "all", cursor: "pointer" }}
                    >
                        <FileFolderSvg />
                    </div>
                    <div>
                        <input id="audioInput" type="file" accept={audioFileTypes} onChange={handleAudioUpload} style={{ display: "none" }} />
                        <label htmlFor="audioInput" className={styles.audioInput}>
                            <UploadSvgIcon />
                        </label>
                    </div>
                </div>
                <div className={styles.playPauseContainer}>
                    <button className={play ? styles.audioPressed : ""} onClick={handlePlayPauseClick}>
                        {play ? <AudioPauseIcon /> : <PlaySvg />}
                    </button>
                    <button onClick={handleReplay}>
                        <SkipSvg />
                    </button>
                    <button className={loop ? styles.loopActive : ""} onClick={handleLoopToggle}>
                        <LoopSvg />
                    </button>
                </div>
                {selectedObj && (
                    <div className={styles.positionContainer}>
                        <span className={styles.materialText}>Volume</span>
                        <div>
                            <div className={styles.SliderProperty}>
                                <SliderWithInput
                                    min={0}
                                    max={10}
                                    steps={1}
                                    initialValue={(audioState.volume || 0.5) * 10}
                                    onChange={(value) => {
                                        const audioInstance = editor.audioSystem.getAudioById(selectedObj.id);
                                        audioInstance.setVolume(value / 10);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div className={styles.contentContainer}>
                    <span className={styles.text}>INTERACTION</span>
                    <div className={styles.horizontalLineappearence}></div>
                </div>
                {selectedObj && (
                    <div className={styles.positionContainer}>
                        <span className={styles.materialText}>Maximum Distance</span>
                        <div>
                            <div className={styles.SliderProperty}>
                                <SliderWithInput
                                    min={1}
                                    max={50}
                                    steps={1}
                                    initialValue={audioState.distance}
                                    onChange={(value) => {
                                        const audioInstance = editor.audioSystem.getAudioById(selectedObj.id);
                                        audioInstance.changeDistance(value);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Modal isOpen={assetModal} onClose={assetModalClose} style={{ height: "80%", width: "80%" }}>
                <SoundLibrary assetModalClose={assetModalClose} />
            </Modal>
        </>
    );
};
export default Attribute;
