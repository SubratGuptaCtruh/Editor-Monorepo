import { Vector3 } from "@babylonjs/core";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { BoxCreator } from "../../../../../../3D/EditorLogic/BoxCreator";
import { AddScreenCommand, AddSpatialAudio, UpdateScreenTextureCommand } from "../../../../../../3D/EditorLogic/commands";
import { ChangeAudioCommand } from "../../../../../../3D/EditorLogic/commands/AudioCommands/AudioCommands";
import { ChangeHDRCommand } from "../../../../../../3D/EditorLogic/commands/BackgroundCommands/BackgroundCommands";
import { editor } from "../../../../../../3D/EditorLogic/editor";
import {
    SameFileActionTypes,
    audioSelectedInfoAtom,
    backgroundAudioSelectedInfoAtom,
    boxCreatorAtom,
    sameFileAtom,
    sameFileItemAtom,
    sameFileModalAtom,
    uploadAndApplyMediaAtom,
    userDetails,
} from "../../../../../../store/store";
import { addCustomAudio, handleDeleteBlobFile, handleUploadFile, handleUploadImageToBlob, updateUserDetails } from "../../../../../APIs/actions";
import { useAddModel } from "../../../../../Hooks/useAddModel";
import { FILE_TYPE, getFileTypeForFile } from "../../../../../Utils/FileUpload.utils";
import { formatDuration } from "../../../../../Utils/FormatDuration.utils";
import GlbToImage from "../../../../../Utils/GlbToImage";
import HDRItoImage from "../../../../../Utils/HDRItoImage";
import { CopyIcon } from "../../../Icons/Icons";
import styles from "./FileSame.module.css";
import { updatedFileName } from "./updatedFileName";

const FileSameModal = () => {
    const setFileSameModal = useSetAtom(sameFileModalAtom);
    const sameFile = useAtomValue(sameFileAtom);
    const sameFileItem = useAtomValue(sameFileItemAtom);
    const [userInfo, setUserInfo] = useAtom(userDetails);
    const setBoxCreator = useSetAtom(boxCreatorAtom);
    const setAudioSelectedInfo = useSetAtom(audioSelectedInfoAtom);
    const uploadAndApplyMedia = useAtomValue(uploadAndApplyMediaAtom);
    const setBackgroundAudioSelectedInfo = useSetAtom(backgroundAudioSelectedInfoAtom);
    const uploadSetting = userInfo.User.smartScaling;

    const addModelInScene = useAddModel();

    const buttonHandler = async (action: SameFileActionTypes) => {
        // close same file modal
        setFileSameModal(false);
        // check if files uploaded in sameFile and sameFileItem
        if (sameFile && sameFileItem) {
            // new name of file to be uploaded according to option selected
            const newFileName = action === "keep-both" ? await updatedFileName(userInfo.User.id, sameFile) : sameFile.name;
            const fileType = getFileTypeForFile(sameFile.name);

            // upload model file with new name if "keep-both" option selected
            const uploadModelFile = async () => {
                const processedModel = await GlbToImage(sameFile);
                const imageBlob = processedModel.image;
                const modelBlob = processedModel.model;
                if (imageBlob && modelBlob) {
                    const imageFile = new File([imageBlob], `${newFileName.split(".")[0]}.png`, { type: "image/png" });
                    const modelFile = new File([modelBlob], `${newFileName.split(".")[0]}.gltf`, { type: "application/json" });
                    console.log(modelFile, "modelFile");

                    const uploadedData = await handleUploadFile(modelFile as File, userInfo.User.id, fileType, imageFile, `${newFileName.split(".")[0]}.gltf`);
                    toast.success("Your file has been securely uploaded.", {
                        duration: 3000,
                    });
                    console.log(uploadedData, "uploadedData");
                    console.log("FILESAMEMODAL", "IMPORTING MODEL");
                    // addModelInScene(uploadedData.data.blobUrl, newFileName);
                }
            };

            const addCustomAudioFile = async (duration: number) => {
                const { data, status } = await addCustomAudio(sameFile, userInfo.User.id, formatDuration(duration), newFileName);
                if (status === 200) {
                    setAudioSelectedInfo(data);
                    if (uploadAndApplyMedia === "audio") {
                        // editor.updateAudioSource(data.title, data.url);
                        if (editor.selector.selected?.id) {
                            const audioInstance = editor.audioSystem.getAudioById(editor.selector.selected?.id);
                            // audioInstance.setAudio(data.url, data.title);
                            editor.executer(new ChangeAudioCommand(editor, audioInstance, { url: data.url, name: data.title }));
                        }
                    } else if (uploadAndApplyMedia === "background-audio") {
                        const updatedUser = { backgroundAudioId: data.id };
                        const updateBackgroundAudioResponse = await updateUserDetails(updatedUser, userInfo.User.id);
                        if (updateBackgroundAudioResponse.status === 200) {
                            setUserInfo({ ...userInfo, User: updateBackgroundAudioResponse.data });
                            setBackgroundAudioSelectedInfo(data);
                        }
                    } else {
                        editor.executer(new AddSpatialAudio(editor, data.url, newFileName));
                    }
                }
            };

            const calculateAudioDurationAndAddAudio = async () => {
                const audioElement = new Audio();
                audioElement.src = URL.createObjectURL(sameFile);

                audioElement.onloadedmetadata = () => {
                    addCustomAudioFile(audioElement.duration);
                };
            };

            // delete file if "replace" option selected
            if (action === "replace") {
                await handleDeleteBlobFile(sameFileItem.id);
            }

            if (fileType !== "" && userInfo.User.id !== undefined) {
                if (fileType === FILE_TYPE.MODEL) {
                    const blobUrl = URL.createObjectURL(sameFile);
                    console.log("FILESAMEMODAL", "IMPORTING MODEL");
                    addModelInScene(blobUrl, newFileName);
                    toast.success("Your file has been securely uploaded.", {
                        duration: 3000,
                    });
                    uploadModelFile();
                } else if (fileType === FILE_TYPE.AUDIO) {
                    toast.promise(calculateAudioDurationAndAddAudio(), {
                        loading: "Adding...",
                        success: "Added the custom audio.",
                        error: "Could not be added.",
                    });

                    await handleUploadFile(sameFile, userInfo.User.id, fileType, undefined, newFileName);
                } else if (fileType === FILE_TYPE.HDR) {
                    const uploadedData = await handleUploadFile(sameFile, userInfo.User.id, fileType, undefined, newFileName);
                    console.log("hdr uploaded", uploadedData);
                    toast.success("Your file has been securely uploaded.", {
                        duration: 3000,
                    });
                    const imageFile = await HDRItoImage(uploadedData.data.bloburl);
                    await handleUploadImageToBlob(imageFile as File, userInfo.User.id);
                    editor.executer(new ChangeHDRCommand(editor, { url: uploadedData.data.bloburl, name: newFileName }));
                } else if (fileType === FILE_TYPE.IMAGE || fileType === FILE_TYPE.VIDEO) {
                    const uploadedData = await handleUploadFile(sameFile, userInfo.User.id, fileType, undefined, newFileName);
                    if (uploadAndApplyMedia === "screen") {
                        if (editor.selector.selected) {
                            editor.executer(new UpdateScreenTextureCommand(editor, uploadedData.data.bloburl, newFileName, editor.selector.selected));
                        }
                    } else {
                        const url = uploadedData.data.bloburl;
                        editor.executer(new AddScreenCommand(editor, "16:9", "screen", url, newFileName || "", new Vector3(0, 0, 0)));
                    }
                }
            }
        }
    };

    useEffect(() => {
        if (uploadSetting === "bounding-box") {
            setBoxCreator(new BoxCreator(editor.canvas, editor.scene));
        } else {
            setBoxCreator(null);
        }
    }, [uploadSetting, setBoxCreator]);

    return (
        <div className={styles.modalInnerContainer}>
            <div className={styles.modalInnerHeader}>
                <div className={styles.modalInnerHeaderTitle}>
                    <CopyIcon />
                    <h1>Duplicate Asset Uploaded</h1>
                </div>
            </div>
            <div className={styles.uploadInner}>
                <p>There is already a file named "{sameFile?.name}" in your uploads. What would you like to do?</p>
            </div>
            <div className={styles.buttonContainer}>
                <button className={styles.KeepButton} onClick={() => buttonHandler("keep-both")}>
                    Keep Both
                </button>
                <button className={styles.ReplaceButton} onClick={() => buttonHandler("replace")}>
                    Replace
                </button>
            </div>
        </div>
    );
};

export default FileSameModal;
