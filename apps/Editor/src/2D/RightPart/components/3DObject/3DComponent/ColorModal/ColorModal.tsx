import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { ChangeHDRCommand } from "../../../../../../3D/EditorLogic/commands/BackgroundCommands/BackgroundCommands";
import { editor } from "../../../../../../3D/EditorLogic/editor";
import { FileItem, openStyle, palletSelectedInfo, sameFileAtom, sameFileItemAtom, sameFileModalAtom, uploadAndApplyMediaAtom, userDetails } from "../../../../../../store/store";
import { getSpecificFilesByUserId, handleUploadFile, handleUploadImageToBlob } from "../../../../../APIs/actions";
import ColorPicker from "../../../../../Components/ColorPicker/ColorPicker";
import { useOutsideClick } from "../../../../../Hooks/useOutsideClick";
import HDRICanvas from "../../../../../TopPart/components/AssetLibrary/Components/Uploads/HDRICanvas/HDRICanvas";
import { FILE_TYPE, getFileTypeForFile, isFileValid } from "../../../../../Utils/FileUpload.utils";
import HDRItoImage from "../../../../../Utils/HDRItoImage";
import { ColorTabSvg, ImagesModeSvg, OpenInBrowserSvg } from "../../../Icon/Icon";
import styles from "./ColorModal.module.css";

export type ImageStateType = { url: string; name: string };

interface ChildProps {
    closeModal: () => void;
    onComplete: (color: string) => void;
    onChange: (color: string) => void;
    onStart: (color: string) => void;
    selectedTab: number;
    setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
    selectedImage?: ImageStateType;
    setSelectedImage?: ({ url, name }: ImageStateType) => ImageStateType;
    context?: string;
    value?: string;
}

const ColorModal: React.FC<ChildProps> = ({ closeModal, onChange, onComplete, onStart, selectedTab, setSelectedTab, selectedImage, setSelectedImage, context, value }) => {
    const [hexColorClicked, setHexColorClicked] = useState<string>(value ? value : "");
    const [colorPalleteHex] = useAtom(palletSelectedInfo);
    const [, setOpenPalleteLibrary] = useAtom(openStyle);
    const userInfo = useAtomValue(userDetails);
    const setSameFileModal = useSetAtom(sameFileModalAtom);
    const setSameFile = useSetAtom(sameFileAtom);
    const setSameFileItem = useSetAtom(sameFileItemAtom);
    const setUploadAndApplyMedia = useSetAtom(uploadAndApplyMediaAtom);

    const ref = useOutsideClick(() => {
        closeModal();
    });
    // to toggle between tabs
    const action = (index: number) => {
        setSelectedTab(index);
    };

    const fileInputRef = useRef<HTMLInputElement>(null); // Define the type of ref as HTMLInputElement

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // Handle file upload logic here
        const file: File | null = e.target.files?.[0] || null;

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
            const acceptedFileTypes = [".hdr"];
            const isValidFile = isFileValid(fileName, acceptedFileTypes);
            if (isValidFile) {
                const fileType = getFileTypeForFile(file.name);
                const sameFile = await checkForSameNameObject(file.name);
                if (sameFile) {
                    // open same file upload modal
                    setSameFileModal(true);
                    setSameFile(file);
                    setSameFileItem(sameFile);
                    setUploadAndApplyMedia("hdr");
                } else {
                    // close same file upload modal
                    setSameFileModal(false);
                    setSameFile(null);
                    setSameFileItem(null);

                    if (fileType === FILE_TYPE.HDR) {
                        const uploadedData = await handleUploadFile(file, userInfo.User.id, fileType, undefined);
                        console.log("hdr uploaded", uploadedData);
                        console.log(uploadedData, "dsds");
                        toast.success("Your file has been securely uploaded.", {
                            duration: 3000,
                        });
                        const imageFile = await HDRItoImage(uploadedData?.data?.blobUrl);
                        await handleUploadImageToBlob(imageFile as File, userInfo.User.id);
                        setSelectedImage && setSelectedImage({ url: uploadedData?.data?.bloburl, name: file.name });
                        // editor.backGroundSystem?.addHDREnvironment(file.name, uploadedData.data.bloburl);
                        editor.executer(new ChangeHDRCommand(editor, { name: fileName, url: uploadedData.data.bloburl }));
                    }
                }
            } else {
                toast.error("Oops! That's not a supported file type.", {
                    duration: 3000,
                });
            }
        }
    };

    return (
        <div ref={ref} className={styles.mainContainer}>
            <div className={styles.tabContainer}>
                {context === "ScenePreference" && (
                    <div className={styles.tabs}>
                        <div onClick={() => action(1)} className={selectedTab === 1 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                            <ColorTabSvg />
                            <p className={styles.tabHeading}>COLOUR</p>
                        </div>
                        <div className={`${styles.tab} ${styles.verticalLine}`}></div>
                        <div onClick={() => action(2)} className={selectedTab === 2 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                            <ImagesModeSvg />
                            <p className={styles.tabHeading}>IMAGE</p>
                        </div>
                    </div>
                )}
                <div className={styles.contents}>
                    <div className={selectedTab === 1 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <div className={styles.TabOneContainer}>
                            <ColorPicker
                                onComplete={(e) => {
                                    onComplete(e);
                                }}
                                onChange={(e) => {
                                    onChange(e);
                                }}
                                onStart={(e) => {
                                    onStart(e);
                                }}
                                value={hexColorClicked}
                            />
                            <div className={styles.contentContainer}>
                                <span className={styles.text}>PALETTE</span>
                                <div className={styles.horizontalLineappearence}></div>
                                <div onClick={() => setOpenPalleteLibrary(true)}>
                                    <OpenInBrowserSvg />
                                </div>
                            </div>
                            <div className={styles.gridContainer}>
                                {colorPalleteHex.hexCodes.map((data, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setHexColorClicked(`#${data}`)}
                                        className={`${styles.hexColor} ${hexColorClicked === `#${data}` && styles.hexColorSelected}`}
                                        style={{ background: `#${data}` }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={selectedTab === 2 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <div className={styles.imageContainer}>
                            <input className={styles.secondContent} type="file" ref={fileInputRef} accept=".hdr" style={{ display: "none" }} onChange={handleFileChange} />

                            {selectedImage?.name ? (
                                <HDRICanvas url={selectedImage.url} className={styles.secondContent} />
                            ) : (
                                <img className={styles.secondContent} alt="/rightPartSVG/imagePreview.jpg" src={"./rightPartSVG/image placeholder.png"} />
                            )}
                            <button className={styles.centeredButton} onClick={handleButtonClick}>
                                {selectedImage?.name ? "REPLACE" : "UPLOAD"}
                            </button>
                        </div>
                        <div className={styles.inputNumberField} style={{ color: selectedImage?.name === "" ? "rgba(50, 50, 50, 0.67)" : "#323232" }}>
                            {selectedImage?.name ? `${selectedImage.name.substring(0, 18)}${selectedImage.name.length >= 19 ? "..." : ""}` : "Upload a 360° Image"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ColorModal;
