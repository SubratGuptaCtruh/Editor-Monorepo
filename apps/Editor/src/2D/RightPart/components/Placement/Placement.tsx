import { Vector3 } from "@babylonjs/core";
import { useRef, useState } from "react";
import { SetPositionCommand, SetRotationCommand, SetScalingCommand } from "../../../../3D/EditorLogic/commands";
import { MeshType, editor } from "../../../../3D/EditorLogic/editor";
import SliderWithInput from "../../../Components/SlidersWithInput/SliderWithInput";
import Toggle from "../../../Components/Toggle/Toggle";
import { useSelectedState } from "../../../Hooks/useSelected";
import { useTransformChange } from "../../../Hooks/useTransformChanged";
import styles from "../3DObject/3DObject.module.css";

function Placement({ children }: { children?: JSX.Element }) {
    const selected = useSelectedState(editor);
    useTransformChange(editor);
    const oldPosition = useRef(selected?.position);
    const oldRotation = useRef(selected?.rotation);
    const oldScaling = useRef(selected?.scaling);
    const [uniformScaling, setUniformScaling] = useState(false);
    const validTypesScaling = ["Mesh", "Text", "TransformNode"]; // valid types for scaling
    const invalidTypesRotation = ["PointLight", "SpatialAudio", "DirectionLight"]; // invalid types for rotation
    const objectScaleRef = useRef(editor.selector.selected?.scaling.clone());

    const handleUniformScaling = () => {
        setUniformScaling(!uniformScaling);
    };
    if (!selected) return;
    return (
        <div className={styles.BodyContainer}>
            <div className={styles.contentContainer}>
                <span className={styles.text}>POSITION</span>
                <div className={styles.horizontalLineappearence}></div>
            </div>
            <div className={styles.positionContainer}>
                <div>
                    <span className={styles.coordinate}>X</span>
                    <div className={styles.SliderDoubleContainer}>
                        <SliderWithInput
                            min={-50}
                            max={50}
                            steps={0.01}
                            initialValue={selected ? parseFloat(selected.position.x.toFixed(2)) : 0}
                            onChange={(value) => {
                                if (!selected) return;
                                editor.update.transform(selected, {
                                    transform: "Position",
                                    value: new Vector3(value, selected.position.y, selected.position.z),
                                });
                            }}
                            onComplete={(value) => {
                                if (!selected) return;
                                editor.executer(new SetPositionCommand(editor, selected, new Vector3(value, selected.position.y, selected.position.z), oldPosition.current));
                            }}
                            onStart={() => {
                                if (!selected) return;
                                oldPosition.current = selected.position.clone();
                            }}
                            context="spring"
                        />
                    </div>
                    {/* <input type="number" min={-90} max={90} placeholder="0" className={styles.inputNumberField} /> */}
                </div>
                <div>
                    <span className={styles.coordinate}>Y</span>
                    <div className={styles.SliderDoubleContainer}>
                        {" "}
                        <SliderWithInput
                            min={-50}
                            max={50}
                            steps={0.01}
                            initialValue={selected ? parseFloat(selected.position.y.toFixed(2)) : 0}
                            onChange={(value) => {
                                if (!selected) return;
                                editor.update.transform(selected, {
                                    transform: "Position",
                                    value: new Vector3(selected.position.x, value, selected.position.z),
                                });
                            }}
                            onComplete={(value) => {
                                if (!selected) return;
                                editor.executer(new SetPositionCommand(editor, selected, new Vector3(selected.position.x, value, selected.position.z), oldPosition.current));
                            }}
                            onStart={() => {
                                if (!selected) return;
                                oldPosition.current = selected.position.clone();
                            }}
                            context="spring"
                        />
                    </div>
                    {/* <input type="number" min={-90} max={90} placeholder="0" className={styles.inputNumberField} /> */}
                </div>
                <div>
                    <span className={styles.coordinate}>Z</span>
                    <div className={styles.SliderDoubleContainer}>
                        <SliderWithInput
                            min={-50}
                            max={50}
                            steps={0.01}
                            initialValue={selected ? parseFloat(selected.position.z.toFixed(2)) : 0}
                            onChange={(value) => {
                                if (!selected) return;
                                editor.update.transform(selected, {
                                    transform: "Position",
                                    value: new Vector3(selected.position.x, selected.position.y, value),
                                });
                            }}
                            onComplete={(value) => {
                                if (!selected) return;
                                editor.executer(new SetPositionCommand(editor, selected, new Vector3(selected.position.x, selected.position.y, value), oldPosition.current));
                            }}
                            onStart={() => {
                                if (!selected) return;
                                oldPosition.current = selected.position.clone();
                            }}
                            context="spring"
                        />
                    </div>
                    {/* <input type="number" min={-90} max={90} placeholder="0" className={styles.inputNumberField} /> */}
                </div>
            </div>
            {!invalidTypesRotation.includes(selected.metadata.type) ? (
                <div>
                    <div className={styles.contentContainer}>
                        <span className={styles.text}>ROTATION</span>
                        <div className={styles.horizontalLineappearence}></div>
                    </div>
                    <div className={styles.positionContainer}>
                        <div>
                            <span className={styles.coordinate}>X</span>
                            <div className={styles.SliderDoubleContainer}>
                                <SliderWithInput
                                    min={-180}
                                    max={180}
                                    steps={2}
                                    initialValue={selected ? parseFloat((((selected.rotationQuaternion?.toEulerAngles().x as number) * 180) / Math.PI).toFixed(2)) : 0}
                                    onChange={(value) => {
                                        if (!selected) return;
                                        // console.log("Value", value);
                                        const rotation = selected.rotationQuaternion ? selected.rotationQuaternion.toEulerAngles() : selected.rotation;
                                        editor.update.transform(selected, {
                                            transform: "Rotation",
                                            value: new Vector3((value * Math.PI) / 180, rotation.y, rotation.z),
                                        });
                                    }}
                                    onComplete={(value) => {
                                        if (!selected) return;
                                        const rotation = selected.rotationQuaternion ? selected.rotationQuaternion.toEulerAngles() : selected.rotation;
                                        editor.executer(
                                            new SetRotationCommand(editor, selected, new Vector3((value * Math.PI) / 180, rotation.y, rotation.z), oldRotation.current)
                                        );
                                    }}
                                    onStart={() => {
                                        if (!selected) return;
                                        const rotation = selected.rotationQuaternion ? selected.rotationQuaternion.toEulerAngles() : selected.rotation;
                                        oldRotation.current = rotation.clone();
                                    }}
                                    context="rotation"
                                />
                            </div>
                            {/* <input type="number" min={-90} max={90} placeholder="0°" className={styles.inputNumberField} /> */}
                        </div>
                        <div>
                            <span className={styles.coordinate}>Y</span>
                            <div className={styles.SliderDoubleContainer}>
                                <SliderWithInput
                                    min={-180}
                                    max={180}
                                    steps={2}
                                    initialValue={selected ? parseFloat((((selected.rotationQuaternion?.toEulerAngles().y as number) * 180) / Math.PI).toFixed(2)) : 0}
                                    onChange={(value) => {
                                        if (!selected) return;
                                        const rotation = selected.rotationQuaternion ? selected.rotationQuaternion.toEulerAngles() : selected.rotation;
                                        editor.update.transform(selected, {
                                            transform: "Rotation",
                                            value: new Vector3(rotation.x, (value * Math.PI) / 180, rotation.z),
                                        });
                                    }}
                                    onComplete={(value) => {
                                        if (!selected) return;

                                        const rotation = selected.rotationQuaternion ? selected.rotationQuaternion.toEulerAngles() : selected.rotation;

                                        editor.executer(
                                            new SetRotationCommand(editor, selected, new Vector3(rotation.x, (value * Math.PI) / 180, rotation.z), oldRotation.current)
                                        );
                                    }}
                                    onStart={() => {
                                        if (!selected) return;
                                        const rotation = selected.rotationQuaternion ? selected.rotationQuaternion.toEulerAngles() : selected.rotation;
                                        oldRotation.current = rotation.clone();
                                    }}
                                    context="rotation"
                                />
                            </div>
                            {/* <input type="number" min={-90} max={90} placeholder="0°" className={styles.inputNumberField} /> */}
                        </div>
                        <div>
                            <span className={styles.coordinate}>Z</span>
                            <div className={styles.SliderDoubleContainer}>
                                <SliderWithInput
                                    min={-180}
                                    max={180}
                                    steps={2}
                                    initialValue={selected ? parseFloat((((selected.rotationQuaternion?.toEulerAngles().z as number) * 180) / Math.PI).toFixed(2)) : 0}
                                    onChange={(value) => {
                                        if (!selected) return;
                                        const rotation = selected.rotationQuaternion ? selected.rotationQuaternion.toEulerAngles() : selected.rotation;
                                        editor.update.transform(selected, {
                                            transform: "Rotation",
                                            value: new Vector3(rotation.x, rotation.y, (value * Math.PI) / 180),
                                        });
                                    }}
                                    onComplete={(value) => {
                                        if (!selected) return;
                                        const rotation = selected.rotationQuaternion ? selected.rotationQuaternion.toEulerAngles() : selected.rotation;
                                        editor.executer(
                                            new SetRotationCommand(editor, selected, new Vector3(rotation.x, rotation.y, (value * Math.PI) / 180), oldRotation.current)
                                        );
                                    }}
                                    onStart={() => {
                                        if (!selected) return;
                                        const rotation = selected.rotationQuaternion ? selected.rotationQuaternion.toEulerAngles() : selected.rotation;
                                        oldRotation.current = rotation.clone();
                                    }}
                                    context="rotation"
                                />
                            </div>
                            {/* <input type="number" min={-90} max={90} placeholder="0°" className={styles.inputNumberField} /> */}
                        </div>
                    </div>
                </div>
            ) : (
                <></>
            )}
            {validTypesScaling.includes(selected.metadata.type) || (selected.metadata.type as MeshType) === "MultiSelectGroup" ? (
                <>
                    <div className={styles.contentContainer}>
                        <span className={styles.text}>SCALE</span>
                        <div className={styles.horizontalLineappearence}></div>
                    </div>
                    <div className={styles.positionContainer}>
                        <div>
                            <div className={styles.toggleTextContent}>Scale evenly</div>
                            <Toggle onChange={handleUniformScaling} />
                        </div>
                    </div>
                    <div className={styles.positionContainer}>
                        {uniformScaling && (
                            <div>
                                {/* <span className={styles.coordinate}>X</span> */}
                                <div className={styles.SliderDoubleContainer}>
                                    <SliderWithInput
                                        min={-50}
                                        max={50}
                                        initialValue={1}
                                        onChange={(value) => {
                                            if (!selected || !objectScaleRef.current) return;
                                            const newScale = objectScaleRef.current.scale(value);
                                            editor.update.transform(selected, {
                                                transform: "Scaling",
                                                value: new Vector3(newScale.x, newScale.y, newScale.z),
                                            });
                                        }}
                                        steps={0.01}
                                        onComplete={(value) => {
                                            if (!selected || !objectScaleRef.current) return;
                                            const finalScale = objectScaleRef.current.scale(value);
                                            editor.executer(new SetScalingCommand(editor, selected, new Vector3(finalScale.x, finalScale.y, finalScale.z), oldScaling.current));
                                        }}
                                        onStart={() => {
                                            oldScaling.current = selected.scaling.clone();
                                            objectScaleRef.current = oldScaling.current;
                                        }}
                                        context="scale"
                                    />
                                </div>
                            </div>
                        )}
                        {!uniformScaling && (
                            <div>
                                <span className={styles.coordinate}>X</span>
                                <div className={styles.SliderDoubleContainer}>
                                    <SliderWithInput
                                        min={-50}
                                        max={50}
                                        initialValue={parseFloat(selected.scaling.x.toFixed(2))}
                                        onChange={(value) => {
                                            editor.update.transform(selected, {
                                                transform: "Scaling",
                                                value: new Vector3(value, selected.scaling.y, selected.scaling.z),
                                            });
                                        }}
                                        steps={0.01}
                                        onComplete={(value) => {
                                            editor.executer(
                                                new SetScalingCommand(editor, selected, new Vector3(value, selected.scaling.y, selected.scaling.z), oldScaling.current)
                                            );
                                        }}
                                        onStart={() => {
                                            oldScaling.current = selected.scaling.clone();
                                        }}
                                        context="scale"
                                    />
                                </div>
                            </div>
                        )}
                        {!uniformScaling && (
                            <div>
                                <span className={styles.coordinate}>Y</span>
                                <div className={styles.SliderDoubleContainer}>
                                    <SliderWithInput
                                        min={-50}
                                        max={50}
                                        initialValue={parseFloat(selected.scaling.y.toFixed(2))}
                                        onChange={(value) => {
                                            editor.update.transform(selected, {
                                                transform: "Scaling",
                                                value: new Vector3(selected.scaling.x, value, selected.scaling.z),
                                            });
                                        }}
                                        steps={0.01}
                                        onComplete={(value) => {
                                            editor.executer(
                                                new SetScalingCommand(editor, selected, new Vector3(selected.scaling.x, value, selected.scaling.z), oldScaling.current)
                                            );
                                        }}
                                        onStart={() => {
                                            oldScaling.current = selected.scaling.clone();
                                        }}
                                        context="scale"
                                    />
                                </div>
                            </div>
                        )}
                        {!uniformScaling && (
                            <div>
                                <span className={styles.coordinate}>Z</span>
                                <div className={styles.SliderDoubleContainer}>
                                    <SliderWithInput
                                        min={-50}
                                        max={50}
                                        initialValue={parseFloat(selected.scaling.z.toFixed(2))}
                                        onChange={(value) => {
                                            editor.update.transform(selected, {
                                                transform: "Scaling",
                                                value: new Vector3(selected.scaling.x, selected.scaling.y, value),
                                            });
                                        }}
                                        steps={0.01}
                                        onComplete={(value) => {
                                            editor.executer(
                                                new SetScalingCommand(editor, selected, new Vector3(selected.scaling.x, selected.scaling.y, value), oldScaling.current)
                                            );
                                        }}
                                        onStart={() => {
                                            oldScaling.current = selected.scaling.clone();
                                        }}
                                        context="scale"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <></>
            )}
            {children ? children : <></>}
        </div>
    );
}
export default Placement;
