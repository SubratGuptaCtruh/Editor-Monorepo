import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { UpdateScreenAspectRatio, UpdateScreenBillboardMode, UpdateScreenTextureCommand } from "../../../../../3D/EditorLogic/commands";
import { editor } from "../../../../../3D/EditorLogic/editor";
import { FileItem, ScreenUploadModalAtom, sameFileAtom, sameFileItemAtom, sameFileModalAtom, uploadAndApplyMediaAtom, userDetails } from "../../../../../store/store";
import { getSpecificFilesByUserId, handleUploadFile } from "../../../../APIs/actions";
import SliderWithInput from "../../../../Components/SlidersWithInput/SliderWithInput";
import Toggle from "../../../../Components/Toggle/Toggle";
import { useScreenState } from "../../../../Hooks/useScreenState";
import { useSelectedState } from "../../../../Hooks/useSelected";
import { AudioPauseIcon, UploadSvgIcon } from "../../../../TopPart/components/Icons/Icons";
import { FILE_TYPE } from "../../../../Utils/FileUpload.utils";
import styles from "../../3DObject/3DObject.module.css";
import { FileFolderSvg, LoopSvg, PlaySvg, SkipSvg } from "../../Icon/Icon";

const options = ["16:9", "4:3", "2:1", "1:1"];
const optionsPotrait = ["9:16", "3:4", "1:2", "1:1"];

function Attribute() {
    const selectedObj = useSelectedState(editor);

    const setScreenUploadModal = useSetAtom(ScreenUploadModalAtom);

    const setSameFileModal = useSetAtom(sameFileModalAtom);
    const setSameFile = useSetAtom(sameFileAtom);
    const setSameFileItem = useSetAtom(sameFileItemAtom);
    const setUploadAndApplyMedia = useSetAtom(uploadAndApplyMediaAtom);

    const screenInfo = selectedObj?.metadata.data || {};

    const defaultSelectedOption = screenInfo.aspectRatio || "16:9";
    const defaultTab = !screenInfo.aspectRatio || (screenInfo.aspectRatio && options.includes(defaultSelectedOption)) ? 0 : 1;

    const screenState = useScreenState();

    const [selectedTab, setSelectedTab] = useState<number>(defaultTab);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const userInfo = useAtomValue(userDetails);

    const handleUpload = () => {
        if (selectedFile) {
            console.log("Uploading file:", selectedFile);
        } else {
            console.log("No file selected");
        }
    };
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file: File | null = event.target.files?.[0] || null;

        if (file) {
            const fileType = file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg" ? FILE_TYPE.IMAGE : FILE_TYPE.VIDEO;

            // checking for same file name while uploading model objects
            const checkForSameNameObject = async (fileName: string) => {
                const userId = userInfo?.User?.id;
                const { data, status } = await getSpecificFilesByUserId(userId, fileType);
                if (status === 200) {
                    const sameFileNameObject = data.find((file: FileItem) => file.filename === fileName);
                    return sameFileNameObject;
                }
            };

            const sameFile = await checkForSameNameObject(file.name);
            if (sameFile) {
                // open same file upload modal
                setSameFileModal(true);
                setSameFile(file);
                setSameFileItem(sameFile);
                setUploadAndApplyMedia("screen");
            } else {
                // close same file upload modal
                setSameFileModal(false);
                setSameFile(null);
                setSameFileItem(null);

                const uploadedData = await handleUploadFile(file, userInfo.User.id, fileType, undefined);
                setSelectedFile(file);
                if (editor.selector.selected) {
                    editor.executer(new UpdateScreenTextureCommand(editor, uploadedData.data.bloburl, file.name, editor.selector.selected));
                }
            }
        }
    };

    const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        editor.selector.selected && editor.executer(new UpdateScreenAspectRatio(editor, value, editor.selector.selected));
    };

    const handleBillBoard = (mode: boolean) => {
        if (!editor.selector.selected || editor.selector.selected.metadata.type !== "Screen") return;
        const value = mode ? 2 : 0;
        editor.executer(new UpdateScreenBillboardMode(editor, value, editor.selector.selected));
    };

    const reset = () => {
        editor.selector.selected && editor.screenLoader.restart(editor.selector.selected);
    };

    useEffect(() => {
        if (editor.selector.selected) {
            const initState = editor.selector.selected.metadata.data;
            if (options.includes(initState.aspectRatio)) {
                setSelectedTab(0);
            } else {
                setSelectedTab(1);
            }
        }
    }, []);

    const playPause = () => {
        if (!screenState.isPlaying) {
            editor.selector.selected && editor.screenLoader.play(editor.selector.selected);
        } else {
            editor.selector.selected && editor.screenLoader.pause(editor.selector.selected);
        }
    };

    const loop = () => {
        editor.selector.selected && editor.screenLoader.setLoop(editor.selector.selected, !screenState.isLooping);
    };

    return (
        <div>
            <div className={styles.materialContainer}>
                <div className={styles.contentContainer}>
                    <span className={styles.text}>MEDIA CONTENT</span>
                    <div className={styles.horizontalLineappearence}></div>
                </div>
                <div className={styles.musicInput}>
                    <div className={styles.inputContainer}>
                        {screenState.fileName ? `${screenState.fileName.substring(0, 12)}${screenState.fileName.length >= 13 ? "..." : ""}` : "Please add media"}
                    </div>
                    <input id="fileInput" onChange={handleFileChange} style={{ display: "none" }} type="file" accept="image/png, image/jpeg, video/mp4" />
                    <div style={{ pointerEvents: "all" }} className={styles.FileIcons}>
                        <div onClick={() => setScreenUploadModal(true)} style={{ cursor: "pointer" }}>
                            <FileFolderSvg />
                        </div>
                        <label onClick={() => handleUpload()} htmlFor="fileInput" style={{ cursor: "pointer" }}>
                            <UploadSvgIcon />
                        </label>
                    </div>
                </div>
                {screenState.videoSources || selectedFile?.type === "video/mp4" ? (
                    <div className={styles.playPauseContainer}>
                        <button className={screenState.isPlaying ? styles.audioPressed : ""} onClick={playPause}>
                            {!screenState.isPlaying ? <PlaySvg /> : <AudioPauseIcon />}
                        </button>
                        <button onClick={reset}>
                            <SkipSvg />
                        </button>
                        <button className={screenState.isLooping ? styles.loopActive : ""} onClick={loop}>
                            <LoopSvg />
                        </button>
                    </div>
                ) : null}
                {screenState.videoSources || selectedFile?.type === "video/mp4" ? (
                    <div className={styles.positionContainer}>
                        <span className={styles.materialText}>Volume</span>
                        <div>
                            <div className={styles.SliderProperty}>
                                <SliderWithInput
                                    min={0}
                                    max={10}
                                    initialValue={screenState.volume}
                                    steps={1}
                                    onChange={(value) => {
                                        if (!selectedObj) return;
                                        editor.screenLoader.setVideoVolume(value, selectedObj);
                                    }}
                                    context="initialValueZero"
                                />
                            </div>
                        </div>
                    </div>
                ) : null}
                <div className={styles.contentContainer}>
                    <span className={styles.text}>APPEARENCE</span>
                    <div className={styles.horizontalLineappearence}></div>
                </div>
                <p className={styles.subHeading}>ORIENTATION</p>
                <div className={styles.tabContainerProjection}>
                    <div className={styles.tabs}>
                        <div
                            className={selectedTab === 0 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}
                            onClick={() => {
                                setSelectedTab((prevState) => {
                                    if (prevState === 1) {
                                        editor.selector.selected && editor.executer(new UpdateScreenAspectRatio(editor, options[0], editor.selector.selected));
                                    }
                                    return 0;
                                });
                            }}
                        >
                            <p className={styles.tabHeading}>Landscape</p>{" "}
                        </div>
                        <div
                            className={selectedTab === 1 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}
                            onClick={() => {
                                setSelectedTab((prevState) => {
                                    if (prevState === 0) {
                                        editor.selector.selected && editor.executer(new UpdateScreenAspectRatio(editor, optionsPotrait[0], editor.selector.selected));
                                    }
                                    return 1;
                                });
                            }}
                        >
                            <p className={styles.tabHeading}>Portrait</p>
                        </div>
                    </div>
                </div>
                <div className={styles.subSectionApeearence}>
                    <p className={styles.subHeading}>ASPECT RATIO</p>
                    <select
                        className={styles.colorDropdown}
                        value={screenState.aspectRatio}
                        onChange={(e) => {
                            handleDropdownChange(e);
                        }}
                    >
                        {selectedTab === 0
                            ? options.map((option) => (
                                  <option key={option} value={option}>
                                      {option}
                                  </option>
                              ))
                            : optionsPotrait.map((option) => (
                                  <option key={option} value={option}>
                                      {option}
                                  </option>
                              ))}
                    </select>
                </div>
                <div className={styles.positionContainer}>
                    <div>
                        <div className={styles.toggleTextContent}>Always Face the Viewer</div>
                        <Toggle
                            initialValue={screenState.isBillboard ? true : false}
                            onChange={(mode) => {
                                handleBillBoard(mode);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Attribute;
