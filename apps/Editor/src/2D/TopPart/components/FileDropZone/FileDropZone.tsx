import { Vector3 } from "@babylonjs/core";
import { useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BoxCreator } from "../../../../3D/EditorLogic/BoxCreator";
import { AddScreenCommand, AddSpatialAudio } from "../../../../3D/EditorLogic/commands";
import { ChangeHDRCommand } from "../../../../3D/EditorLogic/commands/BackgroundCommands/BackgroundCommands";
import { editor } from "../../../../3D/EditorLogic/editor";
import {
    FileItem,
    audioSelectedInfoAtom,
    boxCreatorAtom,
    fullScreenAtom,
    sameFileAtom,
    sameFileItemAtom,
    sameFileModalAtom,
    uploadAndApplyMediaAtom,
    uploadSettingModalAtom,
} from "../../../../store/store";
import { addCustomAudio, getSpecificFilesByUserId, handleUploadFile, handleUploadImageToBlob } from "../../../APIs/actions";
import Button from "../../../Components/Button/Button";
import { useAddModel } from "../../../Hooks/useAddModel";
import { FILE_TYPE, getFileTypeForFile, isFileValid } from "../../../Utils/FileUpload.utils";
import { formatDuration } from "../../../Utils/FormatDuration.utils";
import GlbToImage from "../../../Utils/GlbToImage";
import HDRItoImage from "../../../Utils/HDRItoImage";
import { UploadSvgIcon } from "../Icons/Icons";
import { inputCards } from "../Upload/UploadData";
import styles from "./FileDropZone.module.css";
const FileDropzone: React.FC = () => {
    // const userInfo = useAtomValue(userDetails);
    const setFullScreen = useSetAtom(fullScreenAtom);
    const [isExecuting, setIsExecuting] = useState(false);
    const [selectedFile, setSelectedFile] = useState({
        filename: "",
        fileType: "",
    });
    const [process, setProcess] = useState({
        isDragging: false,
        isUnsupported: false,
        isOverSizeLimit: false,
        isUploading: false,
    });
    const setBoxCreator = useSetAtom(boxCreatorAtom);
    const setUploadSettingModal = useSetAtom(uploadSettingModalAtom);
    const setSameFileModal = useSetAtom(sameFileModalAtom);
    const setSameFile = useSetAtom(sameFileAtom);
    const setSameFileItem = useSetAtom(sameFileItemAtom);
    // const setSnackbarInfo = useSetAtom(snackbarInfo);
    // const [snackbarTimer, setSnackbarTimer] = useAtom(snackbarTimeoutID);
    const setAudioSelectedInfo = useSetAtom(audioSelectedInfoAtom);
    const setUploadAndApplyMedia = useSetAtom(uploadAndApplyMediaAtom);
    const userObjectString = localStorage.getItem("user");

    const addModelInScene = useAddModel();

    useEffect(() => {
        const handleDragEnter = (e: Event) => {
            e.preventDefault();
            if (!process.isDragging && !process.isOverSizeLimit && !process.isUnsupported && !process.isUploading) {
                setProcess((prev) => ({
                    ...prev,
                    isDragging: true,
                }));
                setFullScreen(true);
            }
        };

        const handleDragLeave = () => {
            setProcess((prev) => ({
                ...prev,
                isDragging: false,
            }));
            const getCanvas: HTMLElement | null = document.getElementById("renderCanvas");
            if (getCanvas) {
                getCanvas.style.border = "none";
            }
            setFullScreen(false);
        };

        const handleDropUpload = async (file: File, fileType: string) => {
            const fileName = file.name.toLowerCase();
            const fileLimit = fileType === FILE_TYPE.MODEL ? 50 : 15;

            // checking for same file name while uploading model objects
            const checkForSameNameObject = async (fileName: string) => {
                if (userObjectString) {
                    const userId = JSON.parse(userObjectString).id;
                    const { data, status } = await getSpecificFilesByUserId(userId, fileType);
                    if (status === 200) {
                        const sameFileNameObject = data.find((file: FileItem) => file.filename === fileName);
                        return sameFileNameObject;
                    }
                }
            };

            const uploadModelFile = async (file: File, fileType: string) => {
                if (userObjectString) {
                    const userId = JSON.parse(userObjectString).id;
                    const processedModel = await GlbToImage(file);
                    const imageBlob = processedModel.image;
                    const modelBlob = processedModel.model;
                    if (imageBlob && modelBlob) {
                        const imageFile = new File([imageBlob], `${file.name.split(".")[0]}.png`, { type: "image/png" });
                        const modelFile = new File([modelBlob], `${file.name.split(".")[0]}.gltf`, { type: "application/json" });
                        console.log(modelFile, "modelFile");

                        const uploadedData = await handleUploadFile(modelFile as File, userId, fileType, imageFile, `${file.name.split(".")[0]}.gltf`);
                        console.log(uploadedData, "uploadedData");
                        toast.success("Your file has been securely uploaded.", {
                            duration: 3000,
                        });
                        // addModelInScene(uploadedData.data.blobUrl, fileName);
                    }
                }
            };

            const addCustomAudioFile = async (file: File, duration: number) => {
                if (file && userObjectString) {
                    const { data, status } = await addCustomAudio(file, JSON.parse(userObjectString).id, formatDuration(duration));
                    if (status === 200) {
                        setAudioSelectedInfo(data);
                        editor.executer(new AddSpatialAudio(editor, data.url, data.title));
                    }
                }
            };

            const calculateAudioDurationAndAddAudio = async (file: File) => {
                if (file) {
                    const audioElement = new Audio();
                    audioElement.src = URL.createObjectURL(file);

                    audioElement.onloadedmetadata = () => {
                        addCustomAudioFile(file, audioElement.duration);
                    };
                } else {
                    throw new Error("Could not be added.");
                }
            };

            if (file.size / 1000 / 1000 > fileLimit) {
                setProcess((prev) => ({
                    ...prev,
                    isOverSizeLimit: true,
                }));
            } else {
                // Do file upload
                setProcess((prev) => ({
                    ...prev,
                    isDragging: false,
                    isUploading: true,
                }));
                setTimeout(() => {
                    setProcess((prev) => ({
                        ...prev,
                        isDragging: false,
                        isUploading: false,
                    }));
                    setFullScreen(false);
                    setIsExecuting(false);
                }, 2000);

                // check for duplicate file name in uploads
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

                    if (fileType === FILE_TYPE.MODEL) {
                        if (userObjectString) {
                            if (!JSON.parse(userObjectString).smartScaling) {
                                // upload setting modal to open on first object/scene upload
                                setUploadSettingModal(true);
                            } else {
                                const blobUrl = URL.createObjectURL(file);
                                if (userObjectString) {
                                    addModelInScene(blobUrl, fileName);
                                }
                                toast.success("Your file has been securely uploaded.", {
                                    duration: 3000,
                                });
                                uploadModelFile(file, fileType);
                            }
                        }
                    } else if (fileType === FILE_TYPE.HDR) {
                        if (userObjectString && JSON.parse(userObjectString).id !== undefined) {
                            const imageFile = await HDRItoImage(URL.createObjectURL(file));
                            const imageData = await handleUploadImageToBlob(imageFile as File, JSON.parse(userObjectString).id);
                            const uploadedData = await handleUploadFile(file, JSON.parse(userObjectString).id, fileType, imageData?.data);
                            console.log("hdr uploaded", uploadedData);
                            editor.executer(new ChangeHDRCommand(editor, { url: uploadedData.data.blobUrl, name: file.name }));
                            toast.success("Your file has been securely uploaded.", {
                                duration: 3000,
                            });
                        }
                    } else if (fileType === FILE_TYPE.AUDIO) {
                        toast.promise(calculateAudioDurationAndAddAudio(file), {
                            loading: "Adding...",
                            success: "Added the custom audio.",
                            error: "Could not be added.",
                        });
                        if (userObjectString && JSON.parse(userObjectString).id !== undefined) {
                            const uploadedData = await handleUploadFile(file, JSON.parse(userObjectString).id, fileType, undefined);
                            console.log(uploadedData, "uploaded Data");
                        }
                    } else if (fileType === FILE_TYPE.IMAGE || FILE_TYPE.VIDEO) {
                        if (userObjectString && JSON.parse(userObjectString).id !== undefined) {
                            const uploadedData = await handleUploadFile(file, JSON.parse(userObjectString).id, fileType, undefined);
                            console.log(uploadedData, "uploaded Data");
                            const url = uploadedData.data.bloburl;
                            editor.executer(new AddScreenCommand(editor, "16:9", "screen", url, file.name || "", new Vector3(0, 0, 0)));
                        }
                    }
                }
            }
        };

        const handleDrop = async (e: Event) => {
            e.preventDefault();

            if (!isExecuting) {
                setIsExecuting(true);
                console.log("Process is on");
                const dragEvent = e as DragEvent;
                const file = dragEvent.dataTransfer?.files[0];
                if (file) {
                    const getCanvas: HTMLElement | null = document.getElementById("renderCanvas");
                    if (getCanvas) {
                        getCanvas.style.border = "none";
                    }

                    console.log("Dragged FIle", file);
                    const fileName = file.name.toLowerCase();
                    const acceptedFileTypes = [".glb", ".gltf", ".obj", ".hdr", ".mp3", ".wav", ".ogg", ".svg", ".jpg", ".png", ".jpeg", ".mp4", ".mov"];
                    const isValidFile = isFileValid(fileName, acceptedFileTypes);
                    if (isValidFile) {
                        const fileType = getFileTypeForFile(file.name);
                        if (fileType !== "") {
                            setSelectedFile((prev) => ({
                                ...prev,
                                filename: file.name,
                                fileType: fileType,
                            }));
                            if (
                                fileType === FILE_TYPE.MODEL ||
                                fileType === FILE_TYPE.HDR ||
                                fileType === FILE_TYPE.AUDIO ||
                                fileType === FILE_TYPE.IMAGE ||
                                fileType === FILE_TYPE.VIDEO ||
                                fileType === FILE_TYPE.VECTOR
                            ) {
                                handleDropUpload(file, fileType);
                            } else {
                                setProcess((prev) => ({
                                    ...prev,
                                    isDragging: false,
                                    isUnsupported: true,
                                }));
                            }
                        }
                    } else {
                        setProcess((prev) => ({
                            ...prev,
                            isDragging: false,
                            isUnsupported: true,
                        }));
                    }
                }
            }
        };

        const getCanvas: HTMLElement | null = document.getElementById("renderCanvas");

        if (getCanvas) {
            getCanvas.addEventListener("dragenter", handleDragEnter);
            getCanvas.addEventListener("dragleave", handleDragLeave);
            getCanvas.addEventListener("dragover", handleDrop);
            getCanvas.addEventListener("drop", handleDrop);
        }

        return () => {
            if (getCanvas) {
                getCanvas.removeEventListener("dragenter", handleDragEnter);
                getCanvas.removeEventListener("dragleave", handleDragLeave);
                getCanvas.removeEventListener("dragover", handleDrop);
                getCanvas.removeEventListener("drop", handleDrop);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (userObjectString) {
            if (JSON.parse(userObjectString).smartScaling === "bounding-box") {
                setBoxCreator(new BoxCreator(editor.canvas, editor.scene));
            } else {
                setBoxCreator(null);
            }
        }
    }, [userObjectString, setBoxCreator]);

    return (
        <div
            className={styles.container}
            style={{
                display: process.isDragging || process.isUploading || process.isUnsupported || process.isOverSizeLimit ? "flex" : "none",
                pointerEvents: process.isUploading ? "all" : "none",
            }}
        >
            {!process.isUnsupported && !process.isOverSizeLimit && (
                <div className={styles.dropZone} style={process.isUploading ? { border: "none" } : {}}>
                    {!process.isUploading && <h1>Drop your file here to upload.</h1>}
                    {process.isUploading && (
                        <>
                            <h1>Uploading '{selectedFile.filename}' ...</h1>
                            <div className={styles.loader}>
                                <div></div>
                            </div>
                        </>
                    )}
                    {!process.isUploading && <UploadSvgIcon />}
                </div>
            )}
            {process.isUnsupported && (
                <div className={styles.unsupported}>
                    <h3>Unsupported File Format</h3>
                    <p>Please pick from one of the following supported file formats.</p>
                    <div className={styles.uploadInnerButtonContainer}>
                        {/* <input id="fileInput" className={styles.fileInput} type="file" accept={clickedFileType} /> */}
                        {inputCards.map((data, index) => (
                            <label key={index} htmlFor="fileInput">
                                {data.icons}
                                <div className={styles.buttonDesc}>
                                    <h5>{data.heading}</h5>
                                    <p>{data.subHeading}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                    <Button
                        style={{ marginTop: "32px", pointerEvents: process.isUnsupported ? "all" : "none" }}
                        type="secondary"
                        content="Go back"
                        size="small"
                        onClick={() => {
                            setProcess((prev) => ({
                                ...prev,
                                isDragging: false,
                                isUnsupported: false,
                            }));
                            setFullScreen(false);
                            setIsExecuting(false);
                        }}
                    />
                </div>
            )}
            {process.isOverSizeLimit && (
                <div className={styles.overSizeLimit}>
                    <h3>File Size Over Supported Limit</h3>
                    <img src="./file-error.webp" alt="Error file Image" />
                    <p>
                        Please upload files under {selectedFile.fileType === FILE_TYPE.MODEL ? "50" : "15"} MB for{" "}
                        {selectedFile.fileType === FILE_TYPE.MODEL ? "3D models" : "Media"} Files.
                    </p>
                    <div>
                        <Button
                            style={{ marginTop: "16px", pointerEvents: process.isOverSizeLimit ? "all" : "none" }}
                            content="Close"
                            onClick={() => {
                                setProcess((prev) => ({
                                    ...prev,
                                    isDragging: false,
                                    isOverSizeLimit: false,
                                }));
                                setFullScreen(false);
                                setIsExecuting(false);
                            }}
                            size="small"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileDropzone;
