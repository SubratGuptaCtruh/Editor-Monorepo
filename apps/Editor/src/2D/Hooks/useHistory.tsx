import { useEffect, useState } from "react";
import { Editor } from "../../3D/EditorLogic/editor";

export const useHistory = (editor: Editor) => {
    const [history, setHistory] = useState(editor.get.historyState());

    useEffect(() => {
        const handleHistoryChange = () => {
            console.log(history, "historyChange");
            setHistory(editor.get.historyState());
        };

        editor.UIeventEmitter.on("historyChange", handleHistoryChange);

        return () => {
            editor.UIeventEmitter.off("historyChange", handleHistoryChange);
        };
    }, [editor.UIeventEmitter, editor.get, history]);

    return history;
};
