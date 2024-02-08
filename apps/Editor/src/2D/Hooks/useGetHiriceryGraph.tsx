import { useEffect, useState } from "react";
import { Editor } from "../../3D/EditorLogic/editor";
import { DataTypes } from "../LeftPart/Components/LeftPartEdit/data";

export const useSecneHiriecryGraph = (editor: Editor) => {
    const [secenGraph, setSecenGraph] = useState(editor.get.SecenGraphNew());

    useEffect(() => {
        const handleSecenGraphChange = () => {
            console.log(secenGraph, "sceneGraphChange");
            setSecenGraph(editor.get.SecenGraphNew());
        };

        editor.UIeventEmitter.on("sceneGraphChange", handleSecenGraphChange);

        return () => {
            editor.UIeventEmitter.off("sceneGraphChange", handleSecenGraphChange);
        };
    }, [editor.UIeventEmitter, editor.get, secenGraph]);

    return secenGraph as unknown as DataTypes;
};
