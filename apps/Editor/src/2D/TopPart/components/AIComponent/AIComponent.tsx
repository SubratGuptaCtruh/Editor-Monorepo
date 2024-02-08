import "regenerator-runtime";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { BoxCreator } from "../../../../3D/EditorLogic/BoxCreator";
import { AddGlbModelCommand } from "../../../../3D/EditorLogic/commands/AddGlbModelCommand/AddGlbModelCommand";
import { editor } from "../../../../3D/EditorLogic/editor";
import { boxCreatorAtom, snackbarInfo, snackbarTimeoutID, uploadSettingModalAtom, userDetails } from "../../../../store/store";
import { AIModal } from "../../../APIs/actions";
import { ArchitectureIcon } from "../../../LeftPart/icons/icons";
import { SettingsSvg } from "../../../RightPart/components/Icon/Icon";
import { InfoIcon, MicIcon, PauseIcon, SendIcon } from "../Icons/Icons";
import styles from "./AIComponent.module.css";

const AIComponent = () => {
    const [textPrompt, setTextPrompt] = useState<string>("");
    const [isFocused, setIsFocused] = useState<boolean>(false);
    // const [data, setData] = useState<string>("");
    const { transcript, resetTranscript, listening } = useSpeechRecognition();
    const [isListening, setIsListening] = useState(false);
    // const [error, setError] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const microphoneRef = useRef(null);
    const [isMicrophoneSupported, setisMicrophoneSupported] = useState(true);
    const [placeholderText, setPlaceholderText] = useState("What would you like to create today?");
    const userInfo = useAtomValue(userDetails);
    // const [boxCreator, setBoxCreator] = useAtom(boxCreatorAtom);
    const setBoxCreator = useSetAtom(boxCreatorAtom);
    const setSnackbarInfo = useSetAtom(snackbarInfo);
    const setUploadSettingModal = useSetAtom(uploadSettingModalAtom);
    const [snackbarTimer, setSnackbarTimer] = useAtom(snackbarTimeoutID);
    const uploadSetting = userInfo.User.smartScaling;

    const handleMicListing: React.MouseEventHandler<HTMLDivElement> = () => {
        if (!isListening) {
            resetTranscript();
            setTextPrompt("");
            handleListing();
        } else stopHandle();
    };
    useEffect(() => {
        if (!listening && textPrompt.trim() !== "") {
            console.log("Listening stopped");
            stopHandle();
        }
        if (listening) {
            setPlaceholderText("Listening.........");
        }
        if (!listening && textPrompt.trim() === "" && placeholderText !== "What would you like to create today?") {
            setPlaceholderText("What would you like to create today?");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listening]);
    const handleListing = () => {
        // setError(false);
        setPlaceholderText("Listening.........");
        setIsListening(true);
        // SpeechRecognition.startListening({
        //     continuous: true,
        // });
        SpeechRecognition.startListening();
    };
    const stopHandle = () => {
        setPlaceholderText("What would you like to create today?");
        setIsListening(false);
        SpeechRecognition.stopListening();
        handleGenerateModelMic();
    };
    const handleFocus = () => {
        if (placeholderText === "What would you like to create today?") setPlaceholderText("");
        setIsFocused(true);
    };
    const handleBlur = () => {
        if (placeholderText === "") setPlaceholderText("What would you like to create today?");
        setIsFocused(false);
    };

    const importModelWithUserPref = (modelName: string, glbModelUrl: string) => {
        if (uploadSetting === "as-is") {
            const glbLoadingToast = toast.loading("Downloading your model, Please Wait.");
            setBoxCreator(null);
            editor.executer(
                new AddGlbModelCommand(editor, modelName, { root: "", fileName: glbModelUrl }, null, () => {
                    toast.dismiss(glbLoadingToast);
                    setSnackbarInfo({
                        icon: <InfoIcon />,
                        message: "The model was imported as is.",
                        actionBtn: (
                            <div
                                onClick={() => {
                                    setUploadSettingModal(true);
                                    clearTimeout(snackbarTimer);
                                }}
                            >
                                <SettingsSvg />
                            </div>
                        ),
                    });
                    setSnackbarTimer(
                        setTimeout(() => {
                            setSnackbarInfo(null);
                        }, 7000)
                    );
                })
            );
        }
        // bounding box upload case
        else {
            const boxCreator = new BoxCreator(editor.canvas, editor.scene);
            setBoxCreator(boxCreator);
            boxCreator?.onStarted(() => {
                setSnackbarInfo(null);
            });
            boxCreator?.onEnded((boxBound) => {
                const glbLoadingToast = toast.loading("Downloading your model, Please Wait.");
                editor.executer(
                    new AddGlbModelCommand(editor, modelName, { root: "", fileName: glbModelUrl }, boxBound, () => {
                        toast.dismiss(glbLoadingToast);
                        toast.success("Successfully imported your model.");
                    })
                );
                boxCreator?.dispose();
            });
            boxCreator?.activate();
            setSnackbarInfo({
                icon: <ArchitectureIcon />,
                message: "Please draw a bounding box to place the model in.",
                actionBtn: (
                    <div
                        onClick={() => {
                            setUploadSettingModal(true);
                            clearTimeout(snackbarTimer);
                        }}
                    >
                        <SettingsSvg />
                    </div>
                ),
            });
            clearTimeout(snackbarTimer);
        }
    };

    const handleSendPrompt = async () => {
        console.log(textPrompt);
        if (!isExecuting && textPrompt.trim() !== "") {
            const loaderToast = toast.loading("Generating your Model...");
            setIsExecuting(true);
            if (!textPrompt.trim()) {
                setIsExecuting(false);
                return;
            } else {
                try {
                    const response = await AIModal(textPrompt);
                    toast.dismiss(loaderToast);
                    if (typeof response.data === "object") {
                        // setError(true);
                        setPlaceholderText(`Sorry, we couldn’t create a model for ${textPrompt}`);
                        setTextPrompt("");
                        setIsExecuting(false);
                        toast.error("Sorry! Something went wrong. Try with another prompt.");
                        return;
                    } else {
                        // const glbLoadingToast = toast.loading("Downloading your model, Please Wait.")
                        const glbModelUrl = response.data;
                        const modelName = textPrompt;
                        importModelWithUserPref(modelName, glbModelUrl);
                        setTextPrompt("");
                        setIsExecuting(false);
                    }
                } catch (error) {
                    // setError(true);
                    setPlaceholderText(`Sorry, we couldn’t create a model for ${textPrompt}`);
                    toast.error(`Sorry, we couldn’t create a model for ${textPrompt}`);
                    setTextPrompt("");
                    setIsExecuting(false);
                }
            }
        }
    };
    const handleGenerateModelMic = async () => {
        if (!isExecuting) {
            setIsExecuting(true);
            const loaderToast = toast.loading("Generating your Model...");
            try {
                try {
                    const response = await AIModal(textPrompt);
                    toast.dismiss(loaderToast);
                    console.log(response.data);
                    // setData(response.data);
                    if (typeof response.data === "object") {
                        // setError(true);
                        toast.error(`Sorry, we couldn’t create a model for ${textPrompt}`);
                        setPlaceholderText(`Sorry, we couldn’t create a model for ${textPrompt}`);
                        setTextPrompt("");
                        setIsExecuting(false);

                        return;
                    } else {
                        const glbModelUrl = response.data;
                        const modelName = textPrompt;
                        importModelWithUserPref(modelName, glbModelUrl);
                        // setData(response.data);
                        setIsExecuting(false);
                    }
                } catch (error) {
                    // setError(true);
                    toast.error(`Sorry, we couldn’t create a model for ${textPrompt}`);
                    setPlaceholderText(`Sorry, we couldn’t create a model for ${textPrompt}`);
                    setTextPrompt("");
                    setIsExecuting(false);
                }
            } catch (error) {
                toast.error(`Sorry, we couldn’t create a model for ${textPrompt}`);
                console.log(error);
                setIsExecuting(false);
            }
        }
    };

    useEffect(() => {
        setTextPrompt(transcript);
    }, [transcript]);

    useEffect(() => {
        if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
            setisMicrophoneSupported(false);
        }
    }, []);
    const handleKeyPress = (event: { key: string; preventDefault: () => void }) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleGenerateModelMic();
            setTextPrompt("");
            setIsFocused(false);
        }
    };

    return (
        <>
            <div className={styles.ParentContainer}>
                <div className={styles.InputParentContainer}>
                    <input
                        className={!isFocused ? styles.InputBox : styles.InputFocusedBox}
                        type="text"
                        placeholder={placeholderText}
                        value={textPrompt}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={(e) => setTextPrompt(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <div className={styles.IconsContainer}>
                        {isMicrophoneSupported && (
                            <div
                                className={!isListening ? styles.MicContainer : styles.MicButtonListening}
                                ref={microphoneRef}
                                onClick={!isExecuting ? handleMicListing : undefined}
                                style={{
                                    cursor: !isExecuting ? "pointer" : "not-allowed",
                                }}
                            >
                                {!isListening ? <MicIcon /> : <PauseIcon />}
                            </div>
                        )}
                        <div style={{ cursor: "pointer" }} className={styles.SendContainer} onClick={handleSendPrompt}>
                            <SendIcon />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIComponent;
