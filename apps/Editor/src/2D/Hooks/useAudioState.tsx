import { useEffect, useState } from "react";
import { AudioStateType } from "../../3D/EditorLogic/AudioSystem";
import { editor } from "../../3D/EditorLogic/editor";

const defaultAudioState = {
    audioUrl: null,
    audioName: null,
    volume: 0.5,
    playing: null,
    loop: null,
    distance: 5,
};

export const useAudioState = (id: string) => {
    const audioInstance = editor.audioSystem.getAudioById(id);
    const [backgroundState, setBackgroundState] = useState<AudioStateType>(() => {
        const initState = audioInstance ? { ...defaultAudioState, ...audioInstance.state } : defaultAudioState;
        return initState;
    });

    useEffect(() => {
        const onStateChanged = (id: string, state: AudioStateType) => {
            if (editor.selector.selected?.id !== id) return;
            setBackgroundState(state);
        };

        editor.UIeventEmitter.on("audioStateChanged", onStateChanged);

        return () => {
            editor.UIeventEmitter.off("audioStateChanged", onStateChanged);
        };
    }, []);

    return backgroundState;
};
