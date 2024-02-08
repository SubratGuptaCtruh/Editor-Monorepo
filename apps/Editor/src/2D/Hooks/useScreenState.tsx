import { useEffect, useState } from "react";
import { MeshTypeMap, editor } from "../../3D/EditorLogic/editor";

export const useScreenState = () => {
    const defaultState = editor.selector.selected?.metadata.data || {};

    const [screenState, setScreenState] = useState<MeshTypeMap["Screen"]>({
        screenName: "",
        videoSources: null,
        imageSources: null,
        isBillboard: null,
        aspectRatio: "16/9",
        isPlaying: null,
        isLooping: false,
        volume: 0,
        fileName: null,
        ...defaultState,
    });

    useEffect(() => {
        const callBack = (id: string, newState: MeshTypeMap["Screen"]) => {
            if (editor.selector.selected?.id !== id) return;
            setScreenState(() => ({ ...newState }));
        };
        editor.UIeventEmitter.on("screenStateChanged", callBack);

        return () => {
            editor.UIeventEmitter.off("screenStateChanged", callBack);
        };
    }, []);

    return screenState;
};
