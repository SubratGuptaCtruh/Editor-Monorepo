import { useAtom, useSetAtom } from "jotai";
import { ChangeEvent } from "react";
import toast from "react-hot-toast";
import {
    ChangeBackgroundAudioCommand,
    ChangeBackgroundColorCommand,
    ChangeGridColorCommand,
    ChangeHDRCommand,
} from "../../../../../3D/EditorLogic/commands/BackgroundCommands/BackgroundCommands";
import { editor } from "../../../../../3D/EditorLogic/editor";
import {
    FileItem,
    audioModalAtom,
    audioSelectedInfoAtom,
    backgroundAudioModalAtom,
    backgroundAudioSelectedInfoAtom,
    sameFileAtom,
    sameFileItemAtom,
    sameFileModalAtom,
    uploadAndApplyMediaAtom,
    uploadModalAtom,
    userDetails,
} from "../../../../../store/store";
import { addCustomAudio, getSpecificFilesByUserId, updateUserBackgroundAudio, updateUserDetails } from "../../../../APIs/actions";
import SliderWithInput from "../../../../Components/SlidersWithInput/SliderWithInput";
import Toggle from "../../../../Components/Toggle/Toggle";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_GRID_COLOR, useBackgroundState } from "../../../../Hooks/useBackgroundState";
import HDRICanvas from "../../../../TopPart/components/AssetLibrary/Components/Uploads/HDRICanvas/HDRICanvas";
import { AudioPauseIcon, CloseIcon, UploadSvgIcon } from "../../../../TopPart/components/Icons/Icons";
import { FILE_TYPE, getFileTypeForFile, isFileValid } from "../../../../Utils/FileUpload.utils";
import { formatDuration } from "../../../../Utils/FormatDuration.utils";
import styles from "../../3DObject/3DObject.module.css";
import { FileFolderSvg, LoopSvg, PlaySvg, RestartSvg, SkipSvg } from "../../Icon/Icon";

interface ChildProps {
    handleOpenColorPicker?: () => void;
    selectedColor?: string;
    selectedTab: number;
    setSelectedTab?: React.Dispatch<React.SetStateAction<number>>;
    selectedImage?: string;
    selectedImageFileName?: string;
    setSelectedImageFileName?: React.Dispatch<React.SetStateAction<string>>;
    setSelectedImage?: React.Dispatch<React.SetStateAction<string>>;
    setSelectedColor?: React.Dispatch<React.SetStateAction<string>>;
    selectedColorGrid: string;
    selectedColorBg: string;
    setSelectedColorBg: React.Dispatch<React.SetStateAction<string>>;
    setSelectedColorGrid: React.Dispatch<React.SetStateAction<string>>;
    handleGridModalOpen: () => void;
}
const Backdrop: React.FC<ChildProps> = ({
    handleOpenColorPicker,
    selectedTab,
    setSelectedTab,
    handleGridModalOpen,
    setSelectedColorGrid,
    selectedColorGrid,
    selectedColorBg,
    setSelectedColorBg,
}) => {
    const [, setBackgroundAudioSelectedInfo] = useAtom(backgroundAudioSelectedInfoAtom);
    const [userInfo, setUserInfo] = useAtom(userDetails);
    const setUploadModal = useSetAtom(uploadModalAtom);
    const setAudioModal = useSetAtom(audioModalAtom);
    const setBackgroundAudioModal = useSetAtom(backgroundAudioModalAtom);
    const setAudioSelectedInfo = useSetAtom(audioSelectedInfoAtom);
    const setSameFileModal = useSetAtom(sameFileModalAtom);
    const setSameFile = useSetAtom(sameFileAtom);
    const setSameFileItem = useSetAtom(sameFileItemAtom);
    const setUploadAndApplyMedia = useSetAtom(uploadAndApplyMediaAtom);
    const audioFileTypes = ".mp3,.wav,.ogg";

    const backgroundState = useBackgroundState();

    const handleDeleteUploadedFile = () => {
        if (backgroundState.backgroundColor !== DEFAULT_BACKGROUND_COLOR) {
            // editor.backGroundSystem?.setBackgroundColor(DEFAULT_BACKGROUND_COLOR);
            editor.executer(new ChangeBackgroundColorCommand(editor, DEFAULT_BACKGROUND_COLOR, backgroundState.backgroundColor || DEFAULT_BACKGROUND_COLOR));
        }
        if (backgroundState.backgroundImage?.url) {
            editor.executer(new ChangeHDRCommand(editor, { name: null, url: null }));
        }

        if (setSelectedTab) setSelectedTab(1);
    };
    const setGridVisibility = (isVisible: boolean = true) => {
        isVisible ? editor.backGroundSystem?.enableGrid() : editor.backGroundSystem?.disableGrid();
    };

    const handleAudioUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file: File | null = e.target.files?.[0] || null;

        const addCustomAudioAndUpdateBackgroundAudio = async (duration: number) => {
            if (file) {
                const { data, status } = await addCustomAudio(file, userInfo.User.id, formatDuration(duration));
                if (status === 200) {
                    setAudioSelectedInfo(data);
                    const updatedUser = { backgroundAudioId: data.id };
                    const updateBackgroundAudioResponse = await updateUserDetails(updatedUser, userInfo.User.id);
                    if (updateBackgroundAudioResponse.status === 200) {
                        setUserInfo({ ...userInfo, User: updateBackgroundAudioResponse.data });
                        setBackgroundAudioSelectedInfo(data);
                        // editor.backGroundSystem?.setAudio(data.url, data.title);
                        editor.executer(new ChangeBackgroundAudioCommand(editor, { url: data.url, name: data.title }));
                    }
                }
            }
        };

        const calculateAudioDurationAndAddAudio = async () => {
            if (file) {
                const audioElement = new Audio();
                audioElement.src = URL.createObjectURL(file);

                audioElement.onloadedmetadata = () => {
                    addCustomAudioAndUpdateBackgroundAudio(audioElement.duration);
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
                    setUploadAndApplyMedia("background-audio");
                } else {
                    // close same file upload modal
                    setSameFileModal(false);
                    setSameFile(null);
                    setSameFileItem(null);

                    if (fileType === FILE_TYPE.AUDIO) {
                        toast.promise(calculateAudioDurationAndAddAudio(), {
                            loading: "Adding custom background audio...",
                            success: "Added custom background audio.",
                            error: "Custom background audio could not be added.",
                        });
                    }
                }
                setUploadModal(false);
            } else {
                toast.error("Oops! That's not a supported file type.", {
                    duration: 3000,
                });
            }
        }
    };

    const handleRemoveBackgroundAudio = async () => {
        // editor.backGroundSystem?.removeAudio();
        editor.executer(new ChangeBackgroundAudioCommand(editor, { url: null, name: null }));
        const response = await updateUserBackgroundAudio(userInfo.User.id, null);
        if (response.status === 200) {
            setUserInfo({ ...userInfo, User: { ...userInfo.User, backgroundAudioId: null } });
            setBackgroundAudioSelectedInfo(null);
            toast.success("Removed background audio.");
        }
    };
    const handleResetGridColor = () => {
        setSelectedColorGrid((currentColor) => {
            if (currentColor === DEFAULT_GRID_COLOR) {
                return currentColor;
            } else {
                editor.executer(new ChangeGridColorCommand(editor, DEFAULT_GRID_COLOR, backgroundState.gridColor || DEFAULT_GRID_COLOR));
                return DEFAULT_GRID_COLOR;
            }
        });
    };

    const play = backgroundState.audioPlaying;
    const loop = backgroundState.audioLooping;
    return (
        <>
            <div className={styles.BodyContainer}>
                <div className={styles.contentContainer}>
                    <span className={styles.text}>BACKGROUND</span>
                    <div className={styles.horizontalLineappearence}></div>
                </div>
                <div className={styles.surfaceContent}>
                    {selectedTab === 1 ? (
                        <>
                            <div
                                style={{
                                    backgroundColor: backgroundState.backgroundColor || DEFAULT_BACKGROUND_COLOR,
                                }}
                                onClick={handleOpenColorPicker}
                                className={styles.materialImage}
                            ></div>
                            <p className={styles.hashMaterialImage}>#</p>
                            <input
                                type="text"
                                value={selectedColorBg[0] === "#" ? selectedColorBg.substring(1).toUpperCase() : selectedColorBg.toUpperCase()}
                                className={styles.colorInputField}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Enter") {
                                        if (selectedColorBg.length === 0) {
                                            const prevColor = backgroundState.backgroundColor;
                                            if (prevColor) {
                                                editor.backGroundSystem?.setBackgroundColor(prevColor);
                                                setSelectedColorBg(prevColor);
                                            } else {
                                                editor.backGroundSystem?.setBackgroundColor("#00FFFF");
                                                setSelectedColorBg("#00FFFF");
                                            }
                                        } else editor.backGroundSystem?.setBackgroundColor("#" + (e.target as HTMLInputElement).value);
                                    }
                                }}
                                onChange={(e) => {
                                    const inputValue = e.target.value.slice(0, 6).toUpperCase();
                                    setSelectedColorBg(inputValue);
                                }}
                            />
                        </>
                    ) : (
                        <>
                            {backgroundState.backgroundImage ? (
                                <HDRICanvas url={backgroundState.backgroundImage.url} className={styles.materialTypeImage} onClick={handleOpenColorPicker} />
                            ) : (
                                <img
                                    className={styles.materialTypeImage}
                                    alt="/rightPartSVG/imagePreview.jpg"
                                    src={"./rightPartSVG/image placeholder.png"}
                                    onClick={handleOpenColorPicker}
                                />
                            )}
                            <input type="text" placeholder="Image.hdr" value={backgroundState.backgroundImage?.name ?? ""} className={styles.colorInputField} readOnly={true} />
                        </>
                    )}
                    <div style={{ cursor: "pointer" }} onClick={handleDeleteUploadedFile}>
                        <RestartSvg />
                    </div>
                </div>

                <div className={styles.contentContainer}>
                    <span className={styles.text}>GRID</span>
                    <div className={styles.horizontalLineappearence}></div>
                    <Toggle initialValue={backgroundState.gridEnable} onChange={setGridVisibility} value={backgroundState.gridEnable} />
                </div>
                <div className={styles.surfaceContent}>
                    <div className={styles.colorPickerContainer}>
                        <div
                            style={{
                                backgroundColor: backgroundState.gridColor,
                            }}
                            onClick={handleGridModalOpen}
                            className={styles.materialImage}
                        ></div>
                        <p>#</p>
                        <input
                            type="text"
                            value={selectedColorGrid[0] === "#" ? selectedColorGrid.substring(1).toUpperCase() : selectedColorGrid.toUpperCase()}
                            className={styles.colorInputField}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === "Enter") {
                                    if (selectedColorGrid.length === 0) {
                                        const prevColor = backgroundState.gridColor;
                                        if (prevColor) {
                                            editor.backGroundSystem?.changeGridColor(prevColor);
                                            setSelectedColorGrid(prevColor);
                                        } else {
                                            editor.backGroundSystem?.changeGridColor("#00FFFF");
                                            setSelectedColorGrid("#00FFFF");
                                        }
                                    } else editor.backGroundSystem?.changeGridColor("#" + (e.target as HTMLInputElement).value);
                                }
                            }}
                            onChange={(e) => {
                                const inputValue = e.target.value.slice(0, 6).toUpperCase();
                                setSelectedColorGrid(inputValue);
                            }}
                        />
                    </div>
                    <div onClick={handleResetGridColor} className={styles.audioInput}>
                        <RestartSvg />
                    </div>
                </div>
                <div className={styles.contentContainer}>
                    <span className={styles.text}>AMBIENT LIGHT</span>
                    <div className={styles.horizontalLineappearence}></div>
                </div>
                <div className={styles.positionContainer}>
                    <div>
                        <div className={styles.SliderProperty}>
                            <SliderWithInput
                                min={1}
                                max={10}
                                initialValue={backgroundState.ambientLightIntensity ? backgroundState.ambientLightIntensity * 10 : 5}
                                steps={1}
                                onChange={(value) => {
                                    editor.backGroundSystem?.setLightIntensity(value / 10);
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.contentContainer}>
                    <span className={styles.text}>AUDIO</span>
                    <div className={styles.horizontalLineappearence}></div>
                </div>
                <div className={styles.musicInput}>
                    <div className={styles.inputContainer}>
                        {backgroundState.audio ? `${backgroundState.audio?.name.substring(0, 10)}${backgroundState.audio?.name.length >= 10 ? "..." : ""}` : "Select a sound file"}
                        <div onClick={handleRemoveBackgroundAudio} className={styles.removeIcon}>
                            {backgroundState.audio && <CloseIcon />}
                        </div>
                    </div>
                    <div
                        onClick={() => {
                            setAudioModal(true);
                            setBackgroundAudioModal(true);
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
                    <button
                        className={play ? styles.audioPressed : ""}
                        onClick={() => {
                            play ? editor.backGroundSystem?.pauseAudio() : editor.backGroundSystem?.playAudio();
                        }}
                    >
                        {play ? <AudioPauseIcon /> : <PlaySvg />}
                    </button>
                    <button
                        onClick={() => {
                            editor.backGroundSystem?.restartAudio();
                        }}
                    >
                        <SkipSvg />
                    </button>
                    <button
                        className={loop ? styles.loopActive : ""}
                        onClick={() => {
                            editor.backGroundSystem?.toggleLoop();
                        }}
                    >
                        <LoopSvg />
                    </button>
                </div>
                <div className={styles.positionContainer}>
                    <span className={styles.materialText}>Volume</span>
                    <div>
                        <div className={styles.SliderProperty}>
                            <SliderWithInput
                                min={0}
                                max={50}
                                steps={1}
                                initialValue={backgroundState.audioVolume ? backgroundState.audioVolume * 50 : 0.02 * 50}
                                onChange={(volume) => {
                                    editor.backGroundSystem?.setAudioVolume(volume / 50);
                                }}
                                context="initialValueZero"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default Backdrop;
