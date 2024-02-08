import "external-svg-loader";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { BoxCreator } from "../../../../../../3D/EditorLogic/BoxCreator";

import { Vector3 } from "@babylonjs/core";
import { AddScreenCommand, AddSpatialAudio } from "../../../../../../3D/EditorLogic/commands";
import { ChangeHDRCommand } from "../../../../../../3D/EditorLogic/commands/BackgroundCommands/BackgroundCommands";
import { UpdateScreenTextureCommand } from "../../../../../../3D/EditorLogic/commands/ScreenCommand/UpdateScreenCommand";
import { editor } from "../../../../../../3D/EditorLogic/editor";
import { addNamesWithIncrement } from "../../../../../../3D/EditorLogic/utils";
import {
    PreviewItemAtom,
    ScreenUploadModalAtom,
    assetLibraryModalAtom,
    boxCreatorAtom,
    previewScreenAtom,
    uploadSettingModalAtom,
    userDetails,
} from "../../../../../../store/store";
import Button from "../../../../../Components/Button/Button";
import { useAddModel } from "../../../../../Hooks/useAddModel";
import { useSelectedState } from "../../../../../Hooks/useSelected";
import { FILE_TYPE, getFileTypeForFile } from "../../../../../Utils/FileUpload.utils";
import { BackArrowIcons } from "../../../Icons/Icons";
import AudioCard from "../Uploads/AudioCard/AudioCard";
import HDRICanvas from "../Uploads/HDRICanvas/HDRICanvas";
import styles from "./Preview.module.css";

function Preview() {
    const data = useAtomValue(PreviewItemAtom);
    const setPreviewScreen = useSetAtom(previewScreenAtom);
    const setAssetLibraryModal = useSetAtom(assetLibraryModalAtom);
    const userInfo = useAtomValue(userDetails);
    const setBoxCreator = useSetAtom(boxCreatorAtom);
    const setUploadSettingModal = useSetAtom(uploadSettingModalAtom);
    const [screenUploadModal, setScreenUploadModal] = useAtom(ScreenUploadModalAtom);
    // fetching smartScale value from user info
    const uploadSetting = userInfo.User.smartScaling;
    const selectedObj = useSelectedState(editor);

    const addModelInScene = useAddModel();

    // for closing the scenePreview Modal
    const closePreviewScreen = () => {
        setPreviewScreen(false);
    };

    //for loading scene into canvas
    const handleLoadScene = () => {
        if (!data.bloburl) return;
        const fileType = getFileTypeForFile(data.filename);
        if (fileType === FILE_TYPE.AUDIO) {
            editor.executer(new AddSpatialAudio(editor, data.bloburl, data.filename));
        } else if (fileType === FILE_TYPE.HDR) {
            // editor.backGroundSystem?.addHDREnvironment(data.filename, data.bloburl);
            editor.executer(new ChangeHDRCommand(editor, { url: data.bloburl, name: data.filename }));
        } else if (fileType === FILE_TYPE.MODEL || fileType === "") {
            const nameWithIncrement = addNamesWithIncrement(editor, data.filename);
            addModelInScene(data.bloburl, nameWithIncrement);
            // upload setting modal to open on first object/scene upload
            if (!uploadSetting) {
                setUploadSettingModal(true);
            }
        } else if (fileType === FILE_TYPE.IMAGE || fileType === FILE_TYPE.VIDEO) {
            editor.executer(new AddScreenCommand(editor, "16:9", "Screen", data.bloburl, data.filename, new Vector3(0, 0, 0)));
        }
        setPreviewScreen(false);
        setAssetLibraryModal(false);
    };
    // for loading Screen into Screen Added
    const handleAddScreen = () => {
        // const loader = new ScreenLoader(editor);
        if (selectedObj && data?.bloburl) {
            data.filename;
            editor.executer(new UpdateScreenTextureCommand(editor, data.bloburl, data.filename, selectedObj));
        }
        setScreenUploadModal(false);
    };

    useEffect(() => {
        if (uploadSetting === "bounding-box") {
            setBoxCreator(new BoxCreator(editor.canvas, editor.scene));
        } else {
            setBoxCreator(null);
        }
    }, [uploadSetting, setBoxCreator]);

    return (
        <div className={styles.mainContainer} style={{ height: screenUploadModal ? "80%" : "100%" }}>
            <div className={styles.topHeading} style={{ paddingTop: screenUploadModal ? "8px" : "0" }}>
                <div onClick={closePreviewScreen}>
                    <BackArrowIcons />
                </div>
                {data.filename}
            </div>
            <div className={styles.objectImage} style={{ paddingTop: screenUploadModal ? "10px" : "0" }}>
                {data.type === "vector" ? (
                    <svg data-src={data.bloburl} />
                ) : data.type === "video" ? (
                    <video src={data.bloburl?.toString()} controls></video>
                ) : data.type === "hdr" ? (
                    <HDRICanvas url={`${data.bloburl}`} className={styles.canvasPreview} />
                ) : data.type === "audio" ? (
                    <AudioCard url={`${data.bloburl}`} />
                ) : (
                    <img
                        src={data.type === "model" || data.type === "glb" ? data.corr2DImageUrl || "./3dPlaceholder.avif" : data.type === "image" ? `${data.bloburl}` : ""}
                        alt={data.filename}
                    />
                )}
            </div>
            <div className={styles.bottomRightButton}>
                {/* button text according to data subcategory */}

                {screenUploadModal ? (
                    <Button onClick={handleAddScreen} content={"Add Screen"} size="small" />
                ) : (
                    <Button onClick={handleLoadScene} content={`Load ${data.subcategory === "object" ? "Object" : "Scene"}`} size="small" />
                )}
            </div>
        </div>
    );
}
export default Preview;
