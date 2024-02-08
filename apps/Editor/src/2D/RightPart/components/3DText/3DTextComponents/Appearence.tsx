import { AbstractMesh, Color3 } from "@babylonjs/core";
import { useRef } from "react";
import { AllAvalibelFonts, ThreeDText } from "../../../../../3D/EditorLogic/3Dtext";
import { ChangeFontCommand, SetMaterialAlphaCommand, SetMaterialCommnand } from "../../../../../3D/EditorLogic/commands";
import { editor } from "../../../../../3D/EditorLogic/editor";
import SliderWithInput from "../../../../Components/SlidersWithInput/SliderWithInput";
import { DEFAULT_GRID_COLOR } from "../../../../Hooks/useBackgroundState";
import { useTextColorChange } from "../../../../Hooks/useMatChange";
import { useTextFontChange } from "../../../../Hooks/useTextChange";
import styles from "../../3DObject/3DObject.module.css";
import { BoldIcon, ItalicIcon, RestartSvg } from "../../Icon/Icon";

type Props = {
    selected: AbstractMesh;
    handleOpenColorPicker: () => void;
    selectedTextColor: string;
    setSelectedTextColor: (color: string) => void;
};

const Appearence = ({ selected, handleOpenColorPicker, selectedTextColor, setSelectedTextColor }: Props) => {
    const { name, Italic, bold } = useTextFontChange(editor, selected);
    const textcolor = useTextColorChange(editor, selected);
    const fonts: AllAvalibelFonts[] = ["Poppins", "Oswald", "Nunito", "PressStart", "Merriweather", "Lobster", "BrunoAce"];
    const oldAlpha = useRef(0);
    const oldColor = useRef(Color3.Blue());
    const initialAlpha = (() => {
        let alpha = oldAlpha.current;
        try {
            alpha = editor.get.alpha(ThreeDText.getTextMesh(selected));
        } catch (error) {
            console.log(error);
        }
        return alpha;
    })();
    const initialColor = (() => {
        let alpha = oldColor.current;
        try {
            alpha = editor.get.color(ThreeDText.getTextMesh(selected));
        } catch (error) {
            console.log(error);
        }
        return alpha;
    })();
    oldAlpha.current = initialAlpha;
    oldColor.current = initialColor;

    const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newfont = ThreeDText.allAvalibelFonts.parse(event.target.value);
        const { enableBold, enableItalic } = ThreeDText.getAvalibelFormate(newfont);
        editor.executer(
            new ChangeFontCommand(editor, selected, {
                name: newfont,
                Italic: enableItalic ? Italic : false,
                bold: enableBold ? bold : false,
            })
        );
        // setSelectedOption(ThreeDText.allAvalibelFonts.parse(event.target.value));
    };

    const { enableBold, enableItalic } = ThreeDText.getAvalibelFormate(name);
    console.log(oldColor.current, "Appearence");
    return (
        <div className={styles.subSection}>
            <div className={styles.contentContainer}>
                <span className={styles.text}>APPEARENCE</span>
                <div className={styles.horizontalLineappearence}></div>
            </div>
            <div className={styles.subSectionApeearence}>
                <p className={styles.subHeading}>FONT FAMILY</p>
                <select value={name} onChange={handleFontChange} className={styles.colorDropdown}>
                    {fonts.map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
            <div className={styles.subSectionApeearence}>
                <p className={styles.subHeading}>FORMATTING</p>
                <div className={styles.IconContainer}>
                    <div
                        className={!enableBold ? styles.disableButton : !bold ? styles.IconBox : styles.IconBoxClicked}
                        onClick={() => {
                            editor.executer(
                                new ChangeFontCommand(editor, selected, {
                                    name: name,
                                    Italic: Italic,
                                    bold: !bold,
                                })
                            );
                        }}
                    >
                        <BoldIcon />
                    </div>
                    <div
                        className={!enableItalic ? styles.disableButton : !Italic ? styles.IconBox : styles.IconBoxClicked}
                        onClick={() => {
                            editor.executer(
                                new ChangeFontCommand(editor, selected, {
                                    name: name,
                                    Italic: !Italic,
                                    bold: bold,
                                })
                            );
                        }}
                    >
                        <ItalicIcon />
                    </div>
                </div>
            </div>
            <div className={styles.subSectionApeearence}>
                <p className={styles.subHeading}>COLOUR</p>
                <div className={styles.surfaceContent}>
                    <div className={styles.colorPickerContainer}>
                        <div
                            style={{ backgroundColor: textcolor.toHexString() ? textcolor.toHexString() : DEFAULT_GRID_COLOR }}
                            onClick={handleOpenColorPicker}
                            className={styles.materialImage}
                        ></div>
                        <p>#</p>
                        <input
                            type="text"
                            value={selectedTextColor[0] === "#" ? selectedTextColor.substring(1).toUpperCase() : selectedTextColor.toUpperCase()}
                            className={styles.colorInputField}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === "Enter") {
                                    if (selectedTextColor.length === 0) {
                                        const prevColor = textcolor.toHexString();
                                        if (prevColor) {
                                            editor.update.color(ThreeDText.getTextMesh(selected), Color3.FromHexString("#" + (e.target as HTMLInputElement).value));
                                            editor.UIeventEmitter.emit("textColorChange");
                                            editor.executer(
                                                new SetMaterialCommnand(editor, selected, Color3.FromHexString("#" + (e.target as HTMLInputElement).value), null, oldColor.current)
                                            );
                                            setSelectedTextColor((e.target as HTMLInputElement).value);
                                        } else {
                                            editor.update.color(ThreeDText.getTextMesh(selected), Color3.FromHexString("#" + (e.target as HTMLInputElement).value));
                                            editor.UIeventEmitter.emit("textColorChange");
                                            editor.executer(
                                                new SetMaterialCommnand(editor, selected, Color3.FromHexString("#" + (e.target as HTMLInputElement).value), null, oldColor.current)
                                            );
                                            setSelectedTextColor((e.target as HTMLInputElement).value);
                                        }
                                    } else {
                                        editor.update.color(ThreeDText.getTextMesh(selected), Color3.FromHexString("#" + (e.target as HTMLInputElement).value));
                                        editor.UIeventEmitter.emit("textColorChange");
                                        editor.executer(
                                            new SetMaterialCommnand(editor, selected, Color3.FromHexString("#" + (e.target as HTMLInputElement).value), null, oldColor.current)
                                        );
                                        setSelectedTextColor("#" + (e.target as HTMLInputElement).value);
                                    }
                                }
                            }}
                            onChange={(e) => {
                                const inputValue = e.target.value.slice(0, 6).toUpperCase();
                                setSelectedTextColor(inputValue);
                            }}
                        />
                    </div>
                    <div
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            editor.update.color(ThreeDText.getTextMesh(selected), Color3.FromHexString("#FFFFFF"));
                            editor.UIeventEmitter.emit("textColorChange");
                            editor.executer(new SetMaterialCommnand(editor, selected, Color3.FromHexString("#FFFFFF"), null, oldColor.current));
                        }}
                    >
                        <RestartSvg />
                    </div>
                </div>
            </div>
            <div className={styles.subSectionApeearence}>
                <p className={styles.subHeading}>OPACITY</p>
                <SliderWithInput
                    onChange={(e) => {
                        editor.update.alpha(ThreeDText.getTextMesh(selected), e);
                    }}
                    onComplete={(e) => {
                        editor.executer(new SetMaterialAlphaCommand(editor, ThreeDText.getTextMesh(selected), e, oldAlpha.current));
                    }}
                    onStart={(e) => {
                        oldAlpha.current = e;
                    }}
                    initialValue={initialAlpha}
                    min={0}
                    max={1}
                    steps={0.01}
                />
            </div>
        </div>
    );
};
export default Appearence;
