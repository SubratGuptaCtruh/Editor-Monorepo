// import Dropdown from "../../../../Components/DropDown/DropDown";
import { AbstractMesh } from "@babylonjs/core";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { ChangeLightColorCommand } from "../../../../../3D/EditorLogic/commands";
import { editor } from "../../../../../3D/EditorLogic/editor";
import { LightSystem, Shadow } from "../../../../../3D/EditorLogic/lights";
import SliderWithInput from "../../../../Components/SlidersWithInput/SliderWithInput";
import Toggle from "../../../../Components/Toggle/Toggle";
import styles from "../../3DObject/3DObject.module.css";
import { RestartSvg } from "../../Icon/Icon";

interface ChildProps {
    handleOpenColorPicker: () => void;
    selected: AbstractMesh;
    selectedLightColorState: string;
    setSelectedLightColor: (color: string) => void;
}

const Attributes: React.FC<ChildProps> = ({ handleOpenColorPicker, selected, selectedLightColorState, setSelectedLightColor }) => {
    const [helperToggle, setHelperToggle] = useState(true);
    const selectedLightColor = LightSystem.getLightColor(selected);
    const selectedLightToggleState = () => {
        //returns the initial toggle state of the selected light
        // get the light
        if (!selected) return false;
        const light = LightSystem.getLightFromLightMesh(selected);
        if (!light) return false;

        //get the shadow value
        const shadowObj = new Shadow(editor);
        return shadowObj.getShadowToggleState(light);
    };
    const [shadowToggle, setShadowToggle] = useState(selectedLightToggleState);
    const oldColor = useRef<string>();

    return (
        <div className={styles.materialContainer}>
            <div className={styles.contentContainer}>
                <span className={styles.text}>APPEARANCE</span>
                <div className={styles.horizontalLineappearence}></div>
            </div>
            <div className={styles.surface}>
                <span className={styles.materialText}>COLOUR</span>
                <div className={styles.surfaceContent}>
                    <div className={styles.colorPickerContainer}>
                        <>
                            <div style={{ backgroundColor: selectedLightColor }} onClick={handleOpenColorPicker} className={styles.materialImage}>
                                {" "}
                            </div>
                            <p>#</p>
                            <input
                                type="text"
                                value={selectedLightColorState[0] === "#" ? selectedLightColorState.substring(1).toUpperCase() : selectedLightColorState.toUpperCase()}
                                className={styles.colorInputField}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Enter") {
                                        oldColor.current = "#" + (e.target as HTMLInputElement).value;
                                        if (selectedLightColorState.length === 0) {
                                            const prevColor = LightSystem.getLightColor(selected);
                                            console.log(prevColor, "prevcolor");
                                            if (prevColor) {
                                                editor.executer(new ChangeLightColorCommand(editor, selected, prevColor, oldColor.current));
                                                setSelectedLightColor(prevColor);
                                            } else {
                                                editor.executer(new ChangeLightColorCommand(editor, selected, "#" + (e.target as HTMLInputElement).value, oldColor.current));
                                                setSelectedLightColor("#00FFFF");
                                            }
                                        } else editor.executer(new ChangeLightColorCommand(editor, selected, "#" + (e.target as HTMLInputElement).value, oldColor.current));
                                    }
                                }}
                                onChange={(e) => {
                                    const inputValue = e.target.value.slice(0, 6).toUpperCase();
                                    setSelectedLightColor(inputValue);
                                }}
                            />
                        </>
                    </div>
                    <div
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            editor.executer(new ChangeLightColorCommand(editor, selected, "#FFFFFF"));
                        }}
                    >
                        <RestartSvg />
                    </div>
                </div>
            </div>
            <div className={styles.positionContainer}>
                <span className={styles.materialText}>Intensity</span>
                <div>
                    <div className={styles.SliderProperty}>
                        <SliderWithInput
                            min={0}
                            max={100}
                            steps={1}
                            initialValue={LightSystem.getLightFromLightMesh(selected).intensity * 20}
                            onChange={(intensity) => {
                                if (!selected) return;
                                LightSystem.setLightIntensity(selected, intensity / 20); //divided to minimize the intensity of light
                            }}
                        />
                    </div>
                </div>
            </div>
            {selected?.metadata.type === "SpotLight" ? (
                <div className={styles.positionContainer}>
                    <span className={styles.materialText}>Angle (Penumbra)</span>
                    <div>
                        <div className={styles.SliderProperty}>
                            <SliderWithInput
                                min={1}
                                max={90}
                                steps={1}
                                initialValue={45}
                                onChange={(value) => {
                                    editor.setSpotLightAngle(value);
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <></>
            )}

            <div className={styles.positionContainer}>
                <div>
                    <div className={styles.toggleTextContent}>Show Helper</div>
                    <Toggle
                        initialValue={selected ? selected.isVisible : false}
                        onChange={(isVisible) => {
                            if (!selected) return;
                            if (isVisible) {
                                editor.setLightHelperVisibility(selected, true);
                            } else {
                                editor.setLightHelperVisibility(selected, false);
                            }
                            setHelperToggle(!helperToggle);
                        }}
                    />
                </div>
            </div>

            <div className={styles.contentContainer}>
                <span className={styles.text}>SHADOWS</span>
                <div className={styles.horizontalLineappearence}></div>
                <Toggle
                    initialValue={selectedLightToggleState()}
                    onChange={() => {
                        //checks if the max no of shadow casters are reached and throws the error accordingly
                        if (editor.lightEmitter.shadows.isShadowLimitReached() && !shadowToggle) {
                            toast.error("Only 3 lights may simultaneously have shadows!", { duration: 5000 });
                            return;
                        } else {
                            //toggle the state of the toggle button
                            setShadowToggle(!shadowToggle);

                            //toggle the shadows off for the specific light
                            editor.lightEmitter.shadows.toggleShadow(!shadowToggle);
                        }
                    }}
                />
            </div>
            {shadowToggle && (
                <>
                    <div className={styles.positionContainer}>
                        <span className={styles.materialText}>Opacity</span>
                        <div>
                            <div className={styles.SliderProperty}>
                                <SliderWithInput
                                    min={0}
                                    max={100}
                                    steps={1}
                                    initialValue={editor.lightEmitter.shadows.getDarkness() ?? 80}
                                    onChange={(value) => {
                                        editor.lightEmitter.shadows.setDarkness(value);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.positionContainer}>
                        <span className={styles.materialText}>Blur</span>
                        <div>
                            <div className={styles.SliderProperty}>
                                <SliderWithInput
                                    min={0}
                                    max={100}
                                    steps={1}
                                    initialValue={editor.lightEmitter.shadows.getBlurScale() ?? 20}
                                    onChange={(value) => {
                                        editor.lightEmitter.shadows.setBlurScale(value);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
export default Attributes;
