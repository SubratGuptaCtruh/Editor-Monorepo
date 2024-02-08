import { AbstractMesh, Color3, StandardMaterial } from "@babylonjs/core";
import { useRef } from "react";
import toast from "react-hot-toast";
import { SetMaterialAlphaCommand, SetMaterialCommnand } from "../../../../../3D/EditorLogic/commands";
import { editor } from "../../../../../3D/EditorLogic/editor";
import { Shadow } from "../../../../../3D/EditorLogic/lights";
import SliderWithInput from "../../../../Components/SlidersWithInput/SliderWithInput";
import { useSelectedState } from "../../../../Hooks/useSelected";
import { RestartSvg } from "../../Icon/Icon";
import styles from ".././3DObject.module.css";

interface ChildProps {
    handleOpenColorPicker?: () => void;
    handleOpenMaterialPicker?: () => void;
    selected: AbstractMesh;
    selectedObjColor: string;
    setSelectedObjColor: React.Dispatch<React.SetStateAction<string>>;
}
const Material: React.FC<ChildProps> = ({ handleOpenMaterialPicker, handleOpenColorPicker, selected, selectedObjColor, setSelectedObjColor }) => {
    const oldAlpha = useRef(editor.get.alpha(selected));
    const oldColor = useRef(editor.get.getMaterialOfMesh(selected));
    const selectedObj = useSelectedState(editor);
    // const ColorOrTexture = editor.get.getMaterialOfMesh(selected);

    return (
        <div className={styles.materialContainer}>
            <div className={styles.contentContainer}>
                <span className={styles.text}>MATERIAL</span>
                <div className={styles.horizontalLineappearence}></div>
                <div
                    onClick={() => {
                        if (selectedObj) {
                            // setting material texture to null
                            (selectedObj.material as StandardMaterial).diffuseTexture = null;
                            selectedObj.metadata.data.textureUrl = null;
                            // setting material color to #fff (default color)
                            editor.executer(new SetMaterialCommnand(editor, selected, Color3.FromHexString("#ffffff"), null, oldColor.current));
                        }
                    }}
                    className={styles.restartIcon}
                >
                    <RestartSvg />
                </div>
            </div>
            <div className={styles.surface}>
                <span className={styles.materialText}> COLOUR</span>
                <div className={styles.surfaceContent}>
                    <div className={styles.colorPickerContainer}>
                        {selected.metadata.data.colorHex === null ? (
                            <img src={"/alpha channel.jpg"} onClick={handleOpenColorPicker} className={styles.materialPreview} />
                        ) : (
                            <div style={{ backgroundColor: selected.metadata.data.colorHex }} onClick={handleOpenColorPicker} className={styles.materialPreview}></div>
                        )}
                        <p>#</p>
                        <input
                            type="text"
                            value={selectedObjColor && selectedObjColor[0] === "#" ? selectedObjColor.substring(1).toUpperCase() : selectedObjColor ? selectedObjColor.toUpperCase() : ""}
                            className={styles.textureInputField}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === "Enter") {
                                    if (selectedObjColor.length === 0) {
                                        const prevcolor = selected.metadata.data.colorHex;
                                        if (prevcolor) {
                                            editor.executer(new SetMaterialCommnand(editor, selected, Color3.FromHexString(prevcolor), null, oldColor.current));
                                            setSelectedObjColor(prevcolor);
                                        } else {
                                            editor.executer(
                                                new SetMaterialCommnand(editor, selected, Color3.FromHexString((e.target as HTMLInputElement).value), null, new Color3(1, 1, 1))
                                            );
                                            setSelectedObjColor("#00FFFF");
                                        }
                                    } else {
                                        editor.executer(
                                            new SetMaterialCommnand(editor, selected, Color3.FromHexString("#" + (e.target as HTMLInputElement).value), null, oldColor.current)
                                        );
                                        setSelectedObjColor((e.target as HTMLInputElement).value);
                                    }
                                }
                            }}
                            onChange={(e) => {
                                const inputValue = e.target.value.slice(0, 6).toUpperCase();

                                setSelectedObjColor(inputValue);
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.surface}>
                <span className={styles.materialText}>TEXTURE</span>
                <div className={styles.surfaceContent}>
                    <div className={styles.colorPickerContainer}>
                        {selected.metadata.data.textureUrl ? (
                            <img src={selected.metadata.data.textureUrl} onClick={handleOpenMaterialPicker} className={styles.materialPreview} />
                        ) : (
                            <img src={"/alpha channel.jpg"} onClick={handleOpenMaterialPicker} className={styles.materialPreview} />
                        )}
                        <input
                            type="text"
                            value={selected.metadata.data.textureUrl ? selected.metadata.data.textureUrl.split("mesh/")[1].split(".jpg")[0] : ""}
                            className={styles.textureInputField}
                            readOnly={true}
                        />
                    </div>
                </div>
            </div>
            {/* <div className={styles.positionContainer}>
                <span className={styles.materialText}>METALLIC</span>
                <div>
                    <div className={styles.SliderProperty}>
                        <SliderWithInput min={-50} max={50} steps={3} />
                    </div>
                </div>
            </div> */}
            {/* <div className={styles.positionContainer}>
                <span className={styles.materialText}>GLASS</span>
                <div>
                    <div className={styles.SliderProperty}>
                        <SliderWithInput min={-50} max={50} steps={3} />
                    </div>
                </div>
            </div> */}
            <div className={styles.positionContainer}>
                <span className={styles.materialText}>TRANSPARENCY</span>
                <div>
                    <div className={styles.SliderProperty}>
                        <SliderWithInput
                            onChange={(e) => {
                                editor.update.alpha(selected, e);
                            }}
                            onComplete={(e) => {
                                editor.executer(new SetMaterialAlphaCommand(editor, selected, e, oldAlpha.current));
                            }}
                            onStart={(e) => {
                                //get the shadow count value and throw error when opacity is altered
                                const shadowObj = new Shadow(editor);
                                if (shadowObj.getNoOfCurrentShadows() > 1) {
                                    toast.error("Only opaque objects can cast shadows");
                                }

                                oldAlpha.current = e;
                            }}
                            initialValue={editor.get.alpha(selected)}
                            min={0}
                            max={1}
                            steps={0.01}
                        />
                    </div>
                </div>
            </div>
            {/* <div className={styles.positionContainer}>
                <span className={styles.materialText}>ROUGHNESS</span>
                <div>
                    <div className={styles.SliderProperty}>
                        <SliderWithInput min={-50} max={50} steps={3} />
                    </div>
                </div>
            </div>
            <div className={styles.buttonContainer}>
                <button className={styles.btn}> SAVE MATERIAL</button>
            </div> */}
        </div>
    );
};
export default Material;
