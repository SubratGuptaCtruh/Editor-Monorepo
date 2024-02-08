import { useAtom, useAtomValue, useSetAtom } from "jotai";
import toast from "react-hot-toast";
import { AddGlbModelCommand } from "../../3D/EditorLogic/commands";
import { editor } from "../../3D/EditorLogic/editor";
import { boxCreatorAtom, snackbarInfo, snackbarTimeoutID, uploadSettingModalAtom, userDetails } from "../../store/store";
import { ArchitectureIcon } from "../LeftPart/icons/icons";
import { SettingsSvg } from "../RightPart/components/Icon/Icon";
import { InfoIcon } from "../TopPart/components/Icons/Icons";

export const useAddModel = () => {
    const userInfo = useAtomValue(userDetails);
    const uploadSetting = userInfo.User.smartScaling;
    const setSnackbarInfo = useSetAtom(snackbarInfo);
    const setUploadSettingModal = useSetAtom(uploadSettingModalAtom);
    const [snackbarTimer, setSnackbarTimer] = useAtom(snackbarTimeoutID);
    const boxCreator = useAtomValue(boxCreatorAtom);

    const importModel = (fileUrl: string, fileName: string) => {
        if (!uploadSetting || uploadSetting === "as-is") {
            const glbLoadingToast = toast.loading("Downloading your model, Please Wait.");
            editor.executer(
                new AddGlbModelCommand(
                    editor,
                    fileName,
                    { root: "", fileName: fileUrl },
                    null,
                    () => {
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
                    },
                    () => {
                        toast.dismiss(glbLoadingToast);
                        toast.error("Error while loading a model, Please try again.");
                    }
                )
            );
        }
        // bounding box upload case
        else {
            boxCreator?.onStarted(() => {
                setSnackbarInfo(null);
            });
            boxCreator?.onEnded((boxBound) => {
                const glbLoadingToast = toast.loading("Downloading your model, Please Wait.");
                editor.executer(
                    new AddGlbModelCommand(
                        editor,
                        fileName,
                        { root: "", fileName: fileUrl },
                        boxBound,
                        () => {
                            toast.dismiss(glbLoadingToast);
                            setSnackbarInfo({
                                icon: <InfoIcon />,
                                message: "The model was imported within provided bounds.",
                                actionBtn: <div></div>,
                            });
                            setSnackbarTimer(
                                setTimeout(() => {
                                    setSnackbarInfo(null);
                                }, 3000)
                            );
                        },
                        () => {
                            toast.dismiss(glbLoadingToast);
                            toast.error("Error while loading a model, Please try again.");
                        }
                    )
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

    return importModel;
};
