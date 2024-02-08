import { useAtom, useSetAtom } from "jotai";
import { useState } from "react";
import toast from "react-hot-toast";
import { openStyle, palletClickedInfo, palletSelectedInfo } from "../../../../../../../../../store/store";
import { deleteCustomPalette, editCustomPalette } from "../../../../../../../../APIs/actions";
import Button from "../../../../../../../../Components/Button/Button";
import { Edit } from "../../../../../../../../LeftPart/icons/icons";
import { BackArrowIcons, CheckCircleIcon } from "../../../../../../Icons/Icons";
import paletteData from "../../../palette.json";
import styles from "./CustomPalettePreview.module.css";

interface CustomPalettePreviewProps {
    setSelectedPalette: React.Dispatch<React.SetStateAction<boolean>>;
    selectedFile: File | undefined;
    getPaletteFiles: () => void;
}

const CustomPalettePreview: React.FC<CustomPalettePreviewProps> = ({ setSelectedPalette, selectedFile, getPaletteFiles }) => {
    const [pallInfoSelected, setPalletSelectedInfo] = useAtom(palletSelectedInfo);
    const [pallInfoClicked] = useAtom(palletClickedInfo);
    const [title, setTitle] = useState<string>(pallInfoClicked.title);
    const [editTitle, setEditTitle] = useState<boolean>(false);
    const setOpenStyleLibrary = useSetAtom(openStyle);

    const getFileDisplayName = (name: string | undefined) => {
        if (!name) {
            return "";
        }
        const dotSeparated = name.split(".");
        if (name.split(" ").length > 1) {
            return `${name.split(" ")[0]}.${dotSeparated[dotSeparated.length - 1]}`;
        } else {
            return name;
        }
    };

    const handleEditBtnClick = () =>
        toast.promise(editPalette(), {
            loading: "Editing...",
            success: "Edited the custom pallete",
            error: "Could not be edited",
        });

    const editPalette = async () => await editCustomPalette(pallInfoClicked.id, title);

    const handleDeleteBtnClick = () =>
        toast.promise(deletePalette(), {
            loading: "Deleting...",
            success: "Deleted from custom palletes",
            error: "Could not be deleted",
        });

    const deletePalette = async () => {
        const { status } = await deleteCustomPalette(pallInfoClicked.id);
        if (status === 200) {
            if (pallInfoClicked.id === pallInfoSelected.id) {
                setPalletSelectedInfo(paletteData[0]);
            }
            getPaletteFiles();
            setSelectedPalette(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setEditTitle(false);
        }
    };

    return (
        <div className={styles.palettePreviewContainer} onClick={() => setEditTitle(false)}>
            <div className={styles.paletteHeading}>
                <div
                    onClick={() => {
                        if (pallInfoClicked.title !== title) {
                            handleEditBtnClick();
                        }
                        getPaletteFiles();
                        setSelectedPalette(false);
                    }}
                >
                    <BackArrowIcons />
                </div>
                <h5>{editTitle ? <input value={title} onChange={(e) => setTitle(e.target.value)} onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown} /> : title}</h5>
                {!editTitle && (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditTitle(true);
                        }}
                    >
                        <Edit />
                    </div>
                )}
            </div>
            <div className={styles.paletteMainContainer}>
                <div className={styles.imageContainer}>
                    <img src={pallInfoClicked.url ?? "./rightPartSVG/imagePreview.jpg"} />
                    <div className={styles.imageText}>{getFileDisplayName(selectedFile?.name ?? pallInfoClicked.title)}</div>
                </div>
                <div
                    className={`${styles.colorContainer} ${
                        pallInfoClicked.hexCodes.length >= 10
                            ? styles.colorContainer4x3
                            : pallInfoClicked.hexCodes.length >= 7
                            ? styles.colorContainer3x3
                            : styles.colorContainer3x2
                    }`}
                >
                    {pallInfoClicked.hexCodes.map((color: string, index: number) => (
                        <div key={index} className={styles.colorBox} style={{ backgroundColor: `#${color}` }}>
                            <p>#{color}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.actionContainer}>
                <div className={styles.selectedText} style={{ visibility: pallInfoClicked.id !== pallInfoSelected.id ? "hidden" : "visible" }}>
                    <div>
                        <CheckCircleIcon />
                    </div>
                    <h6>Applied</h6>
                </div>
                <div className={styles.actionBtns}>
                    {pallInfoClicked.id !== pallInfoSelected.id && (
                        <Button
                            content={"APPLY"}
                            onClick={() => {
                                setPalletSelectedInfo(pallInfoClicked);
                                toast.success("Palette applied");
                                setTimeout(() => {
                                    setOpenStyleLibrary(false);
                                }, 500);
                            }}
                        />
                    )}
                    <Button content="DELETE" type="secondary" onClick={handleDeleteBtnClick} />
                </div>
            </div>
        </div>
    );
};

export default CustomPalettePreview;
