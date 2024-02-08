import { useEffect, useState } from "react";
import { Editor } from "../../3D/EditorLogic/editor";

export const useSecneGraph = (editor: Editor) => {
    const [secenGraph, setSecenGraph] = useState(editor.get.SceneGraph());

    useEffect(() => {
        const handleSecenGraphChange = () => {
            console.log(secenGraph, "sceneGraphChange");
            setSecenGraph(editor.get.SceneGraph());
        };

        editor.UIeventEmitter.on("sceneGraphChange", handleSecenGraphChange);

        return () => {
            editor.UIeventEmitter.off("sceneGraphChange", handleSecenGraphChange);
        };
    }, [editor.UIeventEmitter, editor.get, secenGraph]);

    return secenGraph;
};
