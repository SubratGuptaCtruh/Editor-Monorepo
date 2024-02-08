import { useEffect, useState } from "react";
import { Editor } from "../../3D/EditorLogic/editor";

export const useTransformChange = (editor: Editor) => {
    const init = editor.get.Selected() ? editor.get.transform(editor.get.Selected()!) : null;
    const [transform, setTransform] = useState(init);

    useEffect(() => {
        const handleTransformChange = () => {
            const init = editor.get.Selected() ? editor.get.transform(editor.get.Selected()!) : null;
            setTransform(init);
        };

        editor.UIeventEmitter.on("transformChange", handleTransformChange);

        return () => {
            editor.UIeventEmitter.off("transformChange", handleTransformChange);
        };
    }, [editor.UIeventEmitter, editor.get]);

    return transform;
};
