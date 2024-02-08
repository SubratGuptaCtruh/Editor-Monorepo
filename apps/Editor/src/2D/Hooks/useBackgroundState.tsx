import { useEffect, useState } from "react";
import { backgroundStateType } from "../../3D/EditorLogic/BackgroundSystem";
import { editor } from "../../3D/EditorLogic/editor";

export const DEFAULT_GRID_COLOR = "#F7FAFC";
export const DEFAULT_BACKGROUND_COLOR = "#323232";

const defaultState = {
    gridEnable: true,
    gridColor: DEFAULT_GRID_COLOR,
    audio: null,
    audioVolume: 1,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
    backgroundImage: null,
    ambientLightIntensity: 5,
    audioPlaying: false,
    audioLooping: false,
};

export const useBackgroundState = () => {
    const backgroundSystem = editor.backGroundSystem;

    const [backgroundState, setBackgroundState] = useState<backgroundStateType>(() => {
        const initState = backgroundSystem ? { ...defaultState, ...backgroundSystem.state } : defaultState;
        return initState;
    });

    useEffect(() => {
        const onStateChanged = (state: backgroundStateType) => {
            setBackgroundState(state);
        };

        editor.UIeventEmitter.on("backgroundStateChanged", onStateChanged);

        return () => {
            editor.UIeventEmitter.off("backgroundStateChanged", onStateChanged);
        };
    }, []);

    return backgroundState;
};
