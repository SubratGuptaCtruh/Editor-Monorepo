import { useAtom } from "jotai";
import { ChangeEvent, useEffect, useState } from "react";
import { handleCustomPalettePreviewModal, openStyle, palletClickedInfo, userDetails } from "../../../../store/store";
import { addCustomPalette, handleUploadImageToBlob } from "../../../APIs/actions";
import Button from "../../../Components/Button/Button";
import { PaletteSvgIcon } from "../Icons/Icons";
import Ambience from "./Components/Ambience/Ambience";
import Colors from "./Components/Colors/Colors";
import Materials from "./Components/Materials/Materials";
import StyleLibrarySidebarItem from "./Components/StyleLibrarySidebarItem/StyleLibrarySidebarItem";
import styles from "./StyleLibrary.module.css";

interface SideBarData {
    handleClick: () => void;
    content: string;
    tab: string;
}

interface CustomProps {
    sideBarMappingData: SideBarData[];
    sideBarOptionSelected: string;
    headerSelected: string;
    selectedFile: File | undefined;
    setSelectedFile: React.Dispatch<React.SetStateAction<File | undefined>>;
}

function StyleLibrary() {
    const [headerSelected, setHeaderSelected] = useState<string>("preset");
    const [openColorSectionFromMaterial] = useAtom(openStyle);
    const [sideBarOptionSelected, setSideBarOptionSelected] = useState<string>("ambiences");
    const [selectedFile, setSelectedFile] = useState<File>();

    const sideBarMappingData = [
        {
            handleClick: (): void => (setSideBarOptionSelected("ambiences"), setHeaderSelected("preset")),
            content: "Ambiences",
            tab: "ambiences",
        },
        {
            handleClick: (): void => (setSideBarOptionSelected("textures"), setHeaderSelected("preset")),
            content: "Textures",
            tab: "textures",
        },

        {
            handleClick: () => setSideBarOptionSelected("colours"),
            content: "Palettes",
            tab: "colours",
        },
    ];

    // this effect is for opening colors section when user come from material section
    useEffect(() => {
        setSideBarOptionSelected("colours");
    }, [openColorSectionFromMaterial]);

    return (
        <div className={styles.modalInnerContainer}>
            <div className={styles.modalInnerHeader}>
                <div className={styles.modalInnerHeaderTitle}>
                    <PaletteSvgIcon />
                    <h1>Style Library</h1>
                </div>

                {sideBarOptionSelected === "colours" && (
                    <div className={styles.headerToggleContainer}>
                        <div className={styles.headerToggle}>
                            <div
                                className={headerSelected === "preset" ? `${styles.headerItem} ${styles.headerActive}` : styles.headerItem}
                                onClick={() => setHeaderSelected("preset")}
                            >
                                Presets
                            </div>
                            <div
                                className={headerSelected === "custom" ? `${styles.headerItem} ${styles.headerActive}` : styles.headerItem}
                                onClick={() => setHeaderSelected("custom")}
                            >
                                Custom
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {headerSelected === "custom" ? (
                <Custom
                    sideBarMappingData={sideBarMappingData}
                    sideBarOptionSelected={sideBarOptionSelected}
                    headerSelected={headerSelected}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                />
            ) : (
                <div className={styles.modalBody}>
                    {/* modal sidebar */}
                    <div className={styles.modalSideBar}>
                        <div>
                            {sideBarMappingData?.map((elem, index) => {
                                return <StyleLibrarySidebarItem key={index} {...elem} sideBarOptionSelected={sideBarOptionSelected} />;
                            })}
                        </div>
                        {/* <Button content="Save Current" type="secondary"></Button> */}
                    </div>
                    {/* modal Right part */}
                    <div className={styles.modalMiddlePart}>
                        {sideBarOptionSelected === "ambiences" ? (
                            <Ambience />
                        ) : sideBarOptionSelected === "textures" ? (
                            <Materials />
                        ) : sideBarOptionSelected === "colours" ? (
                            <Colors headerSelected={headerSelected} selectedFile={selectedFile} />
                        ) : (
                            ""
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const Custom: React.FC<CustomProps> = ({ sideBarMappingData, sideBarOptionSelected, headerSelected, selectedFile, setSelectedFile }) => {
    const [colors, setColors] = useState<string[]>([]);
    const [, setSelectedPalette] = useAtom(handleCustomPalettePreviewModal);
    const [, setPalletClickedInfo] = useAtom(palletClickedInfo);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [userInfo] = useAtom(userDetails);
    const userId: string = userInfo.User.id;

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        setError(null);
        try {
            const file = e.target.files?.[0];
            if (!file) {
                setError("Please select an image.");
                return;
            }
            setSelectedFile(file);
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            const pixelData = await processImage(file);
            const uniqueColors = extractUniqueColors(pixelData, 12); // Get the top 10 unique colors
            setColors(uniqueColors);
        } catch (err) {
            setError("An error occurred while processing the image.");
            console.error(err);
        }
    };

    const processImage = (file: File): Promise<Uint8ClampedArray> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (e) => {
                const imgElement = document.createElement("img");
                imgElement.src = e.target?.result as string;
                imgElement.crossOrigin = "Anonymous";

                imgElement.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    if (!ctx) {
                        reject("Could not create canvas context.");
                        return;
                    }

                    canvas.width = imgElement.width;
                    canvas.height = imgElement.height;
                    ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

                    const pixelData = ctx.getImageData(0, 0, imgElement.width, imgElement.height).data;
                    resolve(pixelData);
                };
            };

            reader.onerror = () => {
                reject("An error occurred while reading the image.");
            };
        });
    };

    const extractUniqueColors = (pixelData: Uint8ClampedArray, maxColors: number): string[] => {
        const seenColors = new Set<string>();
        const uniqueColors: string[] = [];

        for (let i = 0; i < pixelData.length; i += 4) {
            const r = pixelData[i];
            const g = pixelData[i + 1];
            const b = pixelData[i + 2];
            const color = [r, g, b];

            let isUnique = true;

            for (const seenColor of seenColors) {
                const seenColorArray = seenColor.split(",").map(Number);

                if (colorDistance(color, seenColorArray) < 50) {
                    isUnique = false;
                    break;
                }
            }

            if (isUnique) {
                seenColors.add(`${r},${g},${b}`);
                uniqueColors.push(`rgb(${r},${g},${b})`);
            }

            if (uniqueColors.length >= maxColors) {
                break;
            }
        }
        return uniqueColors;
    };

    const colorDistance = (color1: number[], color2: number[]): number => {
        return Math.sqrt(Math.pow(color1[0] - color2[0], 2) + Math.pow(color1[1] - color2[1], 2) + Math.pow(color1[2] - color2[2], 2));
    };

    const rgbToHex = (color: string) => {
        const cleanedString = color.replace(/[rgb()]/g, "");
        const colorArray = cleanedString.split(",").map(Number);
        // Ensure the input values are within the valid range (0-255)
        const red = Math.min(255, Math.max(0, colorArray[0]));
        const green = Math.min(255, Math.max(0, colorArray[1]));
        const blue = Math.min(255, Math.max(0, colorArray[2]));

        // Convert the decimal values to hexadecimal strings
        const redHex = red.toString(16).padStart(2, "0");
        const greenHex = green.toString(16).padStart(2, "0");
        const blueHex = blue.toString(16).padStart(2, "0");

        // Combine the hexadecimal values to form the color code
        const hexColor = `#${redHex}${greenHex}${blueHex}`;

        return hexColor.toUpperCase(); // You can optionally return the hex color in uppercase
    };

    useEffect(() => {
        if (selectedFile) {
            const addCustomPaletteFile = async () => {
                const response = await handleUploadImageToBlob(selectedFile, userId);
                const imgUrl = response?.data;
                const { data, status } = await addCustomPalette(
                    userId,
                    selectedFile.name.split(".")[0].split(" ")[0],
                    imgUrl,
                    colors.map((i) => rgbToHex(i).split("#")[1])
                );
                if (status === 200) {
                    setSelectedPalette(true);
                    setPalletClickedInfo({
                        id: data.id,
                        title: data.title,
                        url: data.url,
                        tags: null,
                        hexCodes: data.hexCodes,
                    });
                }
            };
            if (!error && colors.length) {
                addCustomPaletteFile();
            }
        }
    }, [userId, colors, setPalletClickedInfo, selectedFile, error, setSelectedPalette]);

    return (
        <div className={styles.modalBody}>
            {/* modal sidebar */}
            <div className={styles.modalSideBar}>
                <div>
                    {sideBarMappingData?.map((elem, index) => {
                        return <StyleLibrarySidebarItem key={index} {...elem} sideBarOptionSelected={sideBarOptionSelected} />;
                    })}
                </div>
                <div className={styles.buttonContainer}>
                    <input onChange={handleUpload} className={styles.fileInput} type="file" accept="image/jpg, image/png, image/gif, image/jpeg" />
                    <Button content="SCAN IMAGE" style={{ width: "100%" }} />
                </div>
                <img src={selectedImage} style={{ display: "none" }} />
            </div>
            {/* modal Right part */}
            <div className={styles.modalMiddlePart}>
                {sideBarOptionSelected === "ambiences" ? (
                    <Ambience />
                ) : sideBarOptionSelected === "textures" ? (
                    <Materials />
                ) : sideBarOptionSelected === "colours" ? (
                    <Colors headerSelected={headerSelected} selectedFile={selectedFile} />
                ) : (
                    ""
                )}
            </div>
        </div>
    );
};

export default StyleLibrary;
