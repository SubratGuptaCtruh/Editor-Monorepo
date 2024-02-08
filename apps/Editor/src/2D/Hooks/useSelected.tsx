import { useEffect, useState } from "react";
import { Editor } from "../../3D/EditorLogic/editor";

export const useSelectedState = (editor: Editor) => {
    const [selected, setSelected] = useState(editor.selector.selected);
    useEffect(() => {
        const handleSelectedChange = () => {
            console.log(selected, "selected change");
            setSelected(editor.selector.selected);
        };

        editor.UIeventEmitter.on("selectedChange", handleSelectedChange);

        return () => {
            editor.UIeventEmitter.off("selectedChange", handleSelectedChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    /**
     * this is added due to a react bug
     */
    return selected && selected.metadata ? selected : null;
};
