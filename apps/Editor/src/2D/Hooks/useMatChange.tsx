import { AbstractMesh, Color3 } from "@babylonjs/core";
import { useEffect, useRef, useState } from "react";
import { ThreeDText } from "../../3D/EditorLogic/3Dtext";
import { Editor } from "../../3D/EditorLogic/editor";
/**
 *
 * @param editor
 * @param selected this should allways be a text node
 * @returns font data of the given selected mesh
 */
export const useTextColorChange = (editor: Editor, selectedText: AbstractMesh) => {
    const oldColor = useRef(Color3.Black());
    const initialColor = (() => {
        let alpha = oldColor.current;
        try {
            alpha = editor.get.color(ThreeDText.getTextMesh(selectedText));
        } catch (error) {
            console.log(error);
        }
        return alpha;
    })();
    oldColor.current = initialColor;
    const [textColor, setTextColor] = useState(initialColor);

    useEffect(() => {
        const handleTextColorChange = () => {
            setTextColor(editor.get.color(ThreeDText.getTextMesh(selectedText)));
        };

        editor.UIeventEmitter.on("textColorChange", handleTextColorChange);

        return () => {
            editor.UIeventEmitter.off("textColorChange", handleTextColorChange);
        };
    }, [editor.UIeventEmitter, editor.get, selectedText]);

    return textColor;
};
