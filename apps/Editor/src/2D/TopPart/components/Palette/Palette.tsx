import React, { useEffect, useState } from "react";

const ColorPaletteGenerator: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [palette, setPalette] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log({ palette });
    }, [palette]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);

        try {
            const file = event.target.files?.[0];
            if (!file) {
                setError("Please select an image.");
                return;
            }

            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);

            const pixelData = await processImage(file);
            const uniqueColors = extractUniqueColors(pixelData, 12); // Get the top 10 unique colors
            setPalette(uniqueColors);
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

    const colorDistance = (color1: number[], color2: number[]): number => {
        return Math.sqrt(Math.pow(color1[0] - color2[0], 2) + Math.pow(color1[1] - color2[1], 2) + Math.pow(color1[2] - color2[2], 2));
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
    function rgbToHex(color: string) {
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
    }

    return (
        <div>
            <h1>Color Palette Generator</h1>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {error && <p style={{ color: "red" }}>{error}</p>}
            {image && <img src={image} alt="Uploaded" style={{ width: "100px", height: "100px" }} />}
            <div>
                <h2>Color Palette</h2>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4,1fr)",
                        gap: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "10px",
                        width: "235px",
                        height: "188px",
                    }}
                >
                    {palette.map((color, index) => (
                        <div
                            onClick={() => {
                                const hexCode = rgbToHex(color);
                                console.log({ hexCode });
                            }}
                            key={index}
                            style={{
                                backgroundColor: color,
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                            }}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ColorPaletteGenerator;
