import { AbstractMesh } from "@babylonjs/core";
import { debounce } from "lodash";
import { ChangeTextContentCommand } from "../../../../../3D/EditorLogic/commands";
import { MeshMetadata, editor } from "../../../../../3D/EditorLogic/editor";
import styles from "../../3DObject/3DObject.module.css";
import Appearence from "./Appearence";

type Props = {
    handleOpenColorPicker: () => void;
    selected: AbstractMesh;
    selectedTextColor: string;
    setSelectedTextColor: (color: string) => void;
};

const debouncedHandleTextChange = debounce((text: string, selected: AbstractMesh) => {
    if (text.trim().length === 0) return;
    editor.executer(new ChangeTextContentCommand(editor, selected, text.trim()));
}, 500);

const Attribute = ({ handleOpenColorPicker, selected, selectedTextColor, setSelectedTextColor }: Props) => {
    const onChangeTextValue = (textValue: string) => {
        debouncedHandleTextChange(textValue, selected);
    };

    return (
        <div className={styles.bodyContainer}>
            <div>
                <div className={styles.contentContainer}>
                    <span className={styles.text}>TEXT CONTENT</span>
                    <div className={styles.horizontalLineappearence}></div>
                </div>
                <textarea
                    name="TextContent"
                    defaultValue={(selected!.metadata as MeshMetadata<"Text">).data.textContent || ""}
                    onChange={(e) => {
                        onChangeTextValue(e.target.value);
                    }}
                    cols={25}
                    rows={10}
                    className={styles.textArea}
                ></textarea>
            </div>
            <Appearence
                key={selected.id}
                selected={selected}
                handleOpenColorPicker={handleOpenColorPicker}
                setSelectedTextColor={setSelectedTextColor}
                selectedTextColor={selectedTextColor}
            />
        </div>
    );
};
export default Attribute;
