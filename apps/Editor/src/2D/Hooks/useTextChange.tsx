import { AbstractMesh } from "@babylonjs/core";
import { useEffect, useState } from "react";
import { Editor, MeshMetadata } from "../../3D/EditorLogic/editor";
/**
 *
 * @param editor
 * @param selected this should allways be a text node
 * @returns font data of the given selected mesh
 */
export const useTextFontChange = (editor: Editor, selected: AbstractMesh) => {
    const [selectedFont, setSelectedFont] = useState((selected?.metadata as MeshMetadata<"Text">).data.font);

    useEffect(() => {
        const handleFontChange = () => {
            setSelectedFont((selected?.metadata as MeshMetadata<"Text">).data.font);
        };

        editor.UIeventEmitter.on("textChange", handleFontChange);

        return () => {
            editor.UIeventEmitter.off("textChange", handleFontChange);
        };
    }, [selected, editor.UIeventEmitter]);

    return selectedFont;
};
