import { Vector3 } from "@babylonjs/core";
import { useAtomValue, useSetAtom } from "jotai";
import React, { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BoxCreator } from "../../../../3D/EditorLogic/BoxCreator";
import { AddGlbModelCommand, AddScreenCommand, AddSpatialAudio } from "../../../../3D/EditorLogic/commands";
import { ChangeHDRCommand } from "../../../../3D/EditorLogic/commands/BackgroundCommands/BackgroundCommands";
import { editor } from "../../../../3D/EditorLogic/editor";
import {
    FileItem,
    audioSelectedInfoAtom,
    boxCreatorAtom,
    sameFileAtom,
    sameFileItemAtom,
    sameFileModalAtom,
    uploadAndApplyMediaAtom,
    uploadModalAtom,
    uploadSettingModalAtom,
    userDetails,
} from "../../../../store/store";
import { addCustomAudio, getSpecificFilesByUserId, handleUploadFile, handleUploadImageToBlob } from "../../../APIs/actions";
import { useAddModel } from "../../../Hooks/useAddModel";
import { FILE_TYPE, getFileTypeForFile, isFileValid } from "../../../Utils/FileUpload.utils";
import { formatDuration } from "../../../Utils/FormatDuration.utils";
import GlbToImage from "../../../Utils/GlbToImage";
import HDRItoImage from "../../../Utils/HDRItoImage";
import { UploadIcons } from "../Icons/Icons";
import styles from "./Upload.module.css";
import { inputCards } from "./UploadData";

function Upload() {
    const [clickedFileType, setClickedFileType] = useState<string>("");
    const [, setDragOver] = useState(false);
    const setUploadModal = useSetAtom(uploadModalAtom);
    const setUploadSettingModal = useSetAtom(uploadSettingModalAtom);
    const userInfo = useAtomValue(userDetails);
    const setAudioSelectedInfo = useSetAtom(audioSelectedInfoAtom);
    const setBoxCreator = useSetAtom(boxCreatorAtom);
    const setSameFileModal = useSetAtom(sameFileModalAtom);
    const setSameFile = useSetAtom(sameFileAtom);
    const setSameFileItem = useSetAtom(sameFileItemAtom);
    const setUploadAndApplyMedia = useSetAtom(uploadAndApplyMediaAtom);
    const uploadSetting = userInfo.User.smartScaling;

    const addModelInScene = useAddModel();

    const handleOnClick = (type: string) => setClickedFileType(type);

    useEffect(() => {
        if (uploadSetting === "bounding-box") {
            setBoxCreator(new BoxCreator(editor.canvas, editor.scene));
        } else {
            setBoxCreator(null);
        }
    }, [uploadSetting, setBoxCreator]);

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file: File | null = e.target.files?.[0] || null;

        const addCustomAudioFile = async (duration: number) => {
            if (file) {
                const { data, status } = await addCustomAudio(file, userInfo.User.id, formatDuration(duration));
                if (status === 200) {
                    setAudioSelectedInfo(data);
                    editor.executer(new AddSpatialAudio(editor, data.url, data.title));
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

        const uploadModelFile = async (file: File, fileType: string) => {
            const processedModel = await GlbToImage(file);
            const imageBlob = processedModel.image;
            const modelBlob = processedModel.model;
            if (imageBlob && modelBlob) {
                const imageFile = new File([imageBlob], `${file.name.split(".")[0]}.png`, { type: "image/png" });
                const modelFile = new File([modelBlob], `${file.name.split(".")[0]}.gltf`, { type: "application/json" });
                console.log(modelFile, "modelFile");

                const uploadedData = await handleUploadFile(modelFile as File, userInfo.User.id, fileType, imageFile, `${file.name.split(".")[0]}.gltf`);
                console.log(uploadedData, "uploadedData");

                toast.success("Your file has been securely uploaded.", {
                    duration: 3000,
                });
                // addModelInScene(uploadedData.data.blobUrl, file.name.toLowerCase());
            }
        };

        if (file) {
            const fileName = file.name.toLowerCase();
            const acceptedFileTypes = clickedFileType.split(",");
            const isValidFile = isFileValid(fileName, acceptedFileTypes);
            if (isValidFile) {
                const fileType = getFileTypeForFile(file.name);
                const sameFile = await checkForSameNameObject(file.name);

                if (sameFile) {
                    // open same file upload modal
                    setSameFileModal(true);
                    setSameFile(file);
                    setSameFileItem(sameFile);
                    setUploadAndApplyMedia(null);
                } else {
                    // close same file upload modal
                    setSameFileModal(false);
                    setSameFile(null);
                    setSameFileItem(null);
                    if (fileType !== "" && userInfo.User.id !== undefined) {
                        if (fileType === FILE_TYPE.MODEL) {
                            if (!uploadSetting) {
                                // upload setting modal to open on first object/scene upload
                                setUploadSettingModal(true);
                            } else {
                                const blobUrl = URL.createObjectURL(file);

                                addModelInScene(blobUrl, fileName);

                                toast.success("Your file has been securely uploaded.", {
                                    duration: 3000,
                                });
                                // upload model file if same file does not exist. If it exists, that case is handled in FileSameModal.tsx file
                                uploadModelFile(file, fileType);
                            }
                        } else if (fileType === FILE_TYPE.AUDIO) {
                            toast.promise(calculateAudioDurationAndAddAudio(), {
                                loading: "Adding...",
                                success: "Added the custom audio.",
                                error: "Could not be added.",
                            });

                            await handleUploadFile(file, userInfo.User.id, fileType, undefined);
                        } else if (fileType === FILE_TYPE.HDR) {
                            // editor.backGroundSystem?.addHDREnvironment(file.name, blobUrl);

                            const imageFile = await HDRItoImage(URL.createObjectURL(file));
                            const imageData = await handleUploadImageToBlob(imageFile as File, userInfo.User.id);
                            const uploadedData = await handleUploadFile(file, userInfo.User.id, fileType, imageData?.data);
                            console.log("hdr uploaded", uploadedData);
                            toast.success("Your file has been securely uploaded.", {
                                duration: 3000,
                            });
                            editor.executer(new ChangeHDRCommand(editor, { url: uploadedData.data.blobUrl, name: file.name }));
                        } else if (fileType === FILE_TYPE.IMAGE || fileType === FILE_TYPE.VIDEO) {
                            const uploadedData = await handleUploadFile(file, userInfo.User.id, fileType, undefined);
                            const url = uploadedData.data.bloburl;
                            editor.executer(new AddScreenCommand(editor, "16:9", "screen", url, file.name || "", new Vector3(0, 0, 0)));
                        }
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
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            const fileName = file.name.toLowerCase();
            const acceptedFileTypes = [".glb", ".obj", ".hdr", ".mp3", ".wav", ".ogg", ".svg", ".jpg", ".png", ".mp4", ".mov"];
            const isValidFile = isFileValid(fileName, acceptedFileTypes);
            if (isValidFile) {
                const fileType = getFileTypeForFile(file.name);
                if (fileType === FILE_TYPE.MODEL) {
                    const blobUrl = URL.createObjectURL(file);

                    editor.executer(new AddGlbModelCommand(editor, fileName, { root: "", fileName: blobUrl }));
                    toast.success("Your file has been securely uploaded.", {
                        duration: 3000,
                    });
                }
            } else {
                toast.error("Oops! That's not a supported file type.", {
                    duration: 3000,
                });
            }
        }
    };

    return (
        <div onDragEnter={handleDragEnter} onDragOver={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop} className={styles.uploadModalMainContainer}>
            <div className={styles.modalInnerHeader}>
                <div className={styles.modalInnerHeaderTitle}>
                    <UploadIcons />
                    <h1>Upload</h1>
                </div>
            </div>
            <div className={styles.uploadInner}>
                <p>You can drag any supported files directly into the canvas, or upload selectively from this menu.</p>
                <div className={styles.uploadInnerButtonContainer}>
                    <input id="fileInput" onChange={handleUpload} className={styles.fileInput} type="file" accept={clickedFileType} />
                    {inputCards.map((data, index) => (
                        <label key={index} htmlFor="fileInput" onClick={() => handleOnClick(data.accepts)}>
                            {data.icons}
                            <div className={styles.buttonDesc}>
                                <h5>{data.heading}</h5>
                                <p>{data.subHeading}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Upload;
