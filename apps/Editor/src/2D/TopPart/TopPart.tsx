import { Vector3 } from "@babylonjs/core";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { AddGlbModelCommand, AddLightCommand, AddPrimitiveCommand, AddScreenCommand, AddSpatialAudio, AddTextCommand } from "../../3D/EditorLogic/commands";
import { AddCameraCommand } from "../../3D/EditorLogic/commands/AddCameraCommand/AddCameraCommand";
import { PrimitiveObjectType, editor } from "../../3D/EditorLogic/editor";
import {
    assetLibraryModalAtom,
    audioModalAtom,
    boxCreatorAtom,
    fullScreenAtom,
    fullScreenForAccountAtom,
    openStyle,
    sameFileModalAtom,
    snackbarInfo,
    snackbarTimeoutID,
    uploadModalAtom,
    uploadSettingModalAtom,
    userDetails,
} from "../../store/store";
import Menu from "../Components/Menu/Menu";
import Modal from "../Components/Modal/Modal";
import Profile from "../Components/Profile/Profile";
import styles from "./TopPart.module.css";
import AIComponent from "./components/AIComponent/AIComponent";
import AssetLibrary from "./components/AssetLibrary/AssetLibrary";
import Button from "./components/Button/Button";
import {
    Account,
    AddSvgIcon,
    AspectRationSvgIcon,
    Audio,
    BoltIcon,
    Camera,
    Help,
    InfoIcon,
    Light,
    Logout,
    MediaSvgIcon,
    PaletteSvgIcon,
    ShareSvgIcon,
    SlideShowIcon,
    Text,
    ThreeDShapes,
    UploadSvgIcon,
} from "./components/Icons/Icons";
// modals import
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { BoxCreator } from "../../3D/EditorLogic/BoxCreator";
import { addNamesWithIncrement, getCurrentQueryParams } from "../../3D/EditorLogic/utils";
import { ScreenUploadModalAtom } from "../../store/store";
import { updateUserDetails } from "../APIs/actions";
import Snackbar from "../Components/Snackbar/Snackbar";
import { ArchitectureIcon } from "../LeftPart/icons/icons";
import SoundLibrary from "../RightPart/components/AudioSource/AudioComponent/SoundLibrary/SoundLibrary";
import FileSameModal from "./components/AssetLibrary/Components/FileSameModal/FileSameModal";
import Uploads from "./components/AssetLibrary/Components/Uploads/Uploads";
import Share from "./components/Share/Share";
import StyleLibrary from "./components/StyleLibrary/StyleLibrary";
import { SyncState } from "./components/Sync/Sync";
import UploadSettings from "./components/Upload/Components/UploadSettings";
import Upload from "./components/Upload/Upload";

const TopPart = () => {
    const [modeAnimate, setModeAnimate] = useState<boolean>(false);
    const [assetModal, setAssetModal] = useAtom(assetLibraryModalAtom);
    const [uploadModal, setUploadModal] = useAtom(uploadModalAtom);
    const [uploadSettingModal, setUploadSettingModal] = useAtom(uploadSettingModalAtom);
    const [sameFileModal, setSameFileModal] = useAtom(sameFileModalAtom);
    const [, setStyleModal] = useState<boolean>(false);
    const [shareModal, setShareModal] = useState<boolean>(false);
    const [openStyleLibrary, setOpenStyleLibrary] = useAtom(openStyle);
    const [objectMenuDropDown, setObjectMenuDropDown] = useState<boolean>(false);
    const [accoutMenuDropDown, setAccoutMentDropDown] = useState<boolean>(false);
    const [AIComponentOpen, setAIComponentOpen] = useState<boolean>(false);
    const setFullScreen = useSetAtom(fullScreenAtom);
    const setFullScreenAccount = useSetAtom(fullScreenForAccountAtom);
    const [userInfo, setUserInfo] = useAtom(userDetails);
    const [audioModal, setAudioModal] = useAtom(audioModalAtom);
    const [snackbar, setSnackbar] = useAtom(snackbarInfo);
    const setSnackbarInfo = useSetAtom(snackbarInfo);
    const setSnackbarTimer = useSetAtom(snackbarTimeoutID);
    const boxCreator = useAtomValue(boxCreatorAtom);
    const uploadSetting = userInfo.User.smartScaling;
    const [uploadScreenModal, setUploadScreenModal] = useAtom(ScreenUploadModalAtom);
    const [renderNormalButton, setRenderNormalButton] = useState(false);
    // const navigate = useNavigate();
    // Funtion to logout user from editor
    const handleLogout = () => {
        localStorage.clear();
        window.location.replace(`${import.meta.env.VITE_HOME_PAGE_URL}?logout=true`);
    };
    // asset modal toggel
    const assetModalClose = (): void => {
        setAssetModal(false);
    };
    const assetModalOpen = (): void => {
        setAssetModal(true);
    };

    // upload modal toggel
    const uploadModalClose = (): void => {
        setUploadModal(false);
    };
    const uploadModalOpen = (): void => {
        setUploadModal(true);
    };

    // upload setting modal toggle
    const uploadSettingModalClose = async () => {
        // updating user smartScaling value to as-is during first object/scene upload
        if (!uploadSetting) {
            const updatedUser = { smartScaling: "as-is" };
            const { data, status } = await updateUserDetails(updatedUser, userInfo.User.id);
            if (status === 200) {
                setUserInfo({ ...userInfo, User: data });
            }
        }
        setUploadSettingModal(false);
    };

    // duplicate asset modal toggle
    const sameFileModalClose = (): void => {
        setSameFileModal(false);
    };

    // style modal toggel
    const styleModalClose = (): void => {
        setOpenStyleLibrary(false);
    };
    const styleModalOpen = (): void => {
        // setStyleModal(true);
        setOpenStyleLibrary(true);
    };

    // share modal toggel
    const shareModalClose = (): void => {
        setShareModal(false);
    };

    const shareModalOpen = async (): Promise<void> => {
        const { sceneID } = getCurrentQueryParams() || { sceneID: "1501491e-1ae3-4978-b27b-7980c481a0d7" };
        if (!sceneID) {
            toast.error("Scene Id didn't find...");
            return;
        }

        setShareModal(true);
    };

    // audio modal toggle
    const audioModalClose = (): void => {
        setAudioModal(false);
    };

    // Menu Data
    // editor.executer(new AddPrimitiveCommand(editor, "Sphere", "Object_1"));
    const addShape = (type: PrimitiveObjectType) => {
        switch (type) {
            case "Cube":
                editor.executer(new AddPrimitiveCommand(editor, type, addNamesWithIncrement(editor, type)));
                break;
            case "Cylinder":
                editor.executer(new AddPrimitiveCommand(editor, type, addNamesWithIncrement(editor, type)));
                break;
            case "Sphere":
                editor.executer(new AddPrimitiveCommand(editor, type, addNamesWithIncrement(editor, type)));
                break;
            case "Torus":
                editor.executer(new AddPrimitiveCommand(editor, type, addNamesWithIncrement(editor, type)));
                break;
            case "Cone":
                editor.executer(new AddPrimitiveCommand(editor, type, addNamesWithIncrement(editor, type)));
                break;
            default:
                console.error(`Primitive shape '${type}' not recognized.`);
                break;
        }
        setObjectMenuDropDown(false);
    };
    const addObjectMenu = [
        {
            title: "3D Shape",
            icons: <ThreeDShapes />,
            tab: "3D Shape",
            children: [
                {
                    childName: "Sphere",
                    onClick: () => {
                        addShape("Sphere");
                    },
                },
                {
                    childName: "Cube",
                    onClick: () => {
                        addShape("Cube");
                    },
                },
                {
                    childName: "Cylinder",
                    onClick: () => {
                        addShape("Cylinder");
                    },
                },
                {
                    childName: "Torus",
                    onClick: () => {
                        addShape("Torus");
                    },
                },
                {
                    childName: "Cone",
                    onClick: () => {
                        addShape("Cone");
                    },
                },
            ],
        },
        {
            title: "Text",
            icons: <Text />,
            tab: "Text",
            onclick: () => {
                editor.executer(new AddTextCommand(editor, addNamesWithIncrement(editor, "Text"), "HELLO"));
                setObjectMenuDropDown(false);
            },
        },
        {
            title: "Camera",
            icons: <Camera />,
            tab: "Camera",
            onclick: () => {
                editor.executer(new AddCameraCommand(editor, addNamesWithIncrement(editor, "Camera") as string));
                setObjectMenuDropDown(false);
            },
        },
        {
            title: "Light Source",
            icons: <Light />,
            tab: "Light Source",
            children: [
                {
                    childName: "Spot Light",
                    onClick: () => {
                        editor.executer(
                            new AddLightCommand(editor, {
                                type: "SpotLight",
                                direction: new Vector3(0, -1, 0),
                                position: new Vector3(0, 0, 0),
                                hexColor: "#ffffff",
                                intensity: 0.5,
                            })
                        );
                        setObjectMenuDropDown(false);
                    },
                },
                {
                    childName: "Point Light",
                    onClick: () => {
                        editor.executer(
                            new AddLightCommand(editor, {
                                type: "PointLight",
                                direction: null,
                                position: new Vector3(0, 10, 0),
                                hexColor: "#ffffff",
                                intensity: 0.5,
                            })
                        );
                        setObjectMenuDropDown(false);
                    },
                },
                {
                    childName: "Directional Light",
                    onClick: () => {
                        editor.executer(
                            new AddLightCommand(editor, {
                                type: "DirectionalLight",
                                position: new Vector3(10, 20, 10),
                                direction: new Vector3(0, -1, 0),
                                hexColor: "#ffffff",
                                intensity: 0.5,
                            })
                        );
                        setObjectMenuDropDown(false);
                    },
                },
            ],
        },
        {
            title: "Audio Source",
            icons: <Audio />,
            tab: "Audio Source",
            onclick: () => {
                editor.executer(new AddSpatialAudio(editor, null, "Audio"));
                setObjectMenuDropDown(false);
            },
        },
        {
            title: "Screen",
            icons: <SlideShowIcon />,
            tab: "Screen",
            onclick: () => {
                editor.executer(new AddScreenCommand(editor, "16:9", addNamesWithIncrement(editor, "Screen") as string, null, null, new Vector3(0, 0, 0)));
                setObjectMenuDropDown(false);
            },
        },
    ];

    // Accounts Menu Data
    const accoutMenu = [
        {
            title: "Account Settings",
            icons: <Account />,
            tab: "Account Settings",
            onclick: () => setFullScreenAccount(true),
        },
        {
            title: "Help",
            icons: <Help />,
            tab: "Help",
        },
        {
            title: "Log Out",
            icons: <Logout />,
            tab: "Log Out",
            text: "red",
            // This onclick is temporary for testing Sketchfab.
            onclick: handleLogout,
        },
    ];

    const changeMode = (): void => {
        setModeAnimate(!modeAnimate);
    };
    // this effect is for opening style library modal when user come from material section
    useEffect(() => {
        setStyleModal(openStyleLibrary);
    }, [openStyleLibrary]);
    const handleAIComponent = () => {
        setAIComponentOpen(!AIComponentOpen);
        setRenderNormalButton(!renderNormalButton);
        console.log(renderNormalButton);
    };
    useEffect(() => {
        if (uploadSetting === "as-is" && boxCreator) {
            boxCreator.onEndedCallbacks.forEach((callback) => {
                callback(null);
                setSnackbarInfo({
                    icon: <InfoIcon />,
                    message: "The model was imported as is.",
                    actionBtn: (
                        <div
                            onClick={() => {
                                setUploadSettingModal(true);
                                setSnackbarInfo(null);
                            }}
                        ></div>
                    ),
                });
                setSnackbarTimer(
                    setTimeout(() => {
                        setSnackbarInfo(null);
                    }, 7000)
                );
            });
        }
        if (uploadSetting === "bounding-box" && !boxCreator) {
            const lastAction = editor.history.undos[editor.history.undos.length - 1];
            if (lastAction && lastAction.type === "AddGlbModelCommand") {
                const temBoxCreator = new BoxCreator(editor.canvas, editor.scene);
                //@ts-expect-error : TO do : find a better way to access mesh added by Add glb command
                const recentlyAddedGlb = editor.scene.getMeshById(lastAction.meshId);
                const prevGlbCommand = editor.history.undos.pop();
                if (!prevGlbCommand) return;
                editor.selector.deselect();
                editor.save();
                //@ts-expect-error : TO do : find a better way to access mesh added by Add glb command
                const fileName = prevGlbCommand.name;
                //@ts-expect-error : TO do : find a better way to access mesh added by Add glb command
                const link = prevGlbCommand.link.fileName;
                recentlyAddedGlb?.dispose();
                temBoxCreator.onEnded((boxBound) => {
                    const glbLoadingToast = toast.loading("Importing your model");
                    editor.executer(
                        new AddGlbModelCommand(
                            editor,
                            fileName,
                            { root: "", fileName: link },
                            boxBound,
                            () => {
                                toast.dismiss(glbLoadingToast);
                                setSnackbarInfo({
                                    icon: <InfoIcon />,
                                    message: "The model was imported with provided bounds.",
                                    actionBtn: (
                                        <div
                                            onClick={() => {
                                                setUploadSettingModal(true);
                                                setSnackbarInfo(null);
                                            }}
                                        ></div>
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
                                toast.error("Error while importing model, Please try again.");
                            }
                        )
                    );
                });
                temBoxCreator.onStarted(() => {
                    setSnackbarInfo(null);
                });
                temBoxCreator.activate();

                setSnackbarInfo({
                    icon: <ArchitectureIcon />,
                    message: "Please draw a bounding box to place the model in.",
                    actionBtn: <div></div>,
                });
            }
        }
    }, [uploadSetting, boxCreator, setSnackbarInfo, setUploadSettingModal, setSnackbarTimer]);

    return (
        <>
            <div
                className={styles.topPartMainContainer}
                onClick={() => {
                    setSnackbar(null);
                    boxCreator?.dispose();
                }}
            >
                <div>
                    <div className={styles.leftSide}>
                        <div className={styles.logo_mode}>
                            <Link to="https://www.ctruh.org/dashboard">
                                <div className={styles.logo}>
                                    <img width={40} height={40} src="./Ctruh_Logo.webp" alt="logo" />
                                </div>
                            </Link>
                            <div onClick={changeMode} className={styles.modeContainer}>
                                <p>Modeling</p>
                                {/* <RightSvgIcon /> */}
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <div className={styles.dropDownMainContainer}>
                                <Button icon={<AddSvgIcon />} content="Add" onClick={() => setObjectMenuDropDown(true)} />
                                {objectMenuDropDown && <Menu onClose={() => setObjectMenuDropDown(false)} menu={addObjectMenu} />}
                            </div>
                            <Button icon={<UploadSvgIcon />} content="Upload" onClick={uploadModalOpen} />
                            <div className={styles.verticalLine}></div>
                            <Button icon={<MediaSvgIcon />} content="Assets" onClick={assetModalOpen} />
                            <Button icon={<PaletteSvgIcon />} content="Styles" onClick={styleModalOpen} />
                        </div>
                        <div className={`${AIComponentOpen ? styles.AIComponent : styles.customClassName}`}>
                            {renderNormalButton ? (
                                <button className={styles.activeAIButton} onClick={handleAIComponent}>
                                    <BoltIcon />
                                </button>
                            ) : (
                                <Button icon={<BoltIcon />} content={!AIComponentOpen ? "AI-TO-3D" : ""} onClick={handleAIComponent}></Button>
                            )}
                            <div className={styles.SearchAIComponent}>{AIComponentOpen && <AIComponent />}</div>
                        </div>
                    </div>
                    <div className={styles.rightSide}>
                        <div className={styles.rhsModalActions}>
                            <SyncState />
                            <Button
                                icon={<AspectRationSvgIcon />}
                                onClick={() => {
                                    setFullScreen(true);
                                    editor.selector.deselect();
                                }}
                                content="Hide UI"
                            />
                            <Button icon={<ShareSvgIcon />} content="Share" onClick={shareModalOpen} />
                        </div>

                        <div className={styles.accountDropDownContainer}>
                            <div className={styles.profileContainer}>
                                <Profile userName={userInfo?.User?.UserName || "User Name"} size={52} onClick={() => setAccoutMentDropDown(true)} />
                            </div>
                            {accoutMenuDropDown && <Menu onClose={() => setAccoutMentDropDown(false)} menu={accoutMenu} right />}
                        </div>
                    </div>
                </div>
            </div>
            {/* asset modal */}
            <Modal isOpen={assetModal} onClose={assetModalClose} style={{ height: "500px", maxWidth: "840px" }} assetLibrary={true}>
                <AssetLibrary />
            </Modal>

            {/* upload modal */}
            <Modal isOpen={uploadModal} onClose={uploadModalClose} style={{ maxWidth: "528px" }}>
                <Upload />
            </Modal>

            {/* upload setting modal */}
            <Modal isOpen={uploadSettingModal} onClose={uploadSettingModalClose} style={{ maxWidth: "528px" }}>
                <UploadSettings />
            </Modal>

            {/* duplicate asset upload modal */}
            <Modal isOpen={sameFileModal} onClose={sameFileModalClose} style={{ width: "512px" }}>
                <FileSameModal />
            </Modal>

            {/* styles Modals */}
            <Modal isOpen={openStyleLibrary} onClose={styleModalClose} style={{ height: "500px", maxWidth: "702px" }}>
                <StyleLibrary />
            </Modal>

            {/* audio modal */}
            <Modal isOpen={audioModal} onClose={audioModalClose} style={{ height: "500px", maxWidth: "772px" }}>
                <SoundLibrary assetModalClose={audioModalClose} />
            </Modal>

            {/* share Modals */}
            <Modal isOpen={shareModal} onClose={shareModalClose} style={{ height: "496px", maxWidth: "838px" }}>
                <Share />
            </Modal>
            {/* upload screen modal */}
            <Modal isOpen={uploadScreenModal} onClose={() => setUploadScreenModal(false)} style={{ height: "450px", maxWidth: "600px", padding: "20px", paddingTop: "10px" }}>
                <Uploads />
            </Modal>

            {snackbar && <Snackbar message={snackbar.message} icon={snackbar.icon} actionBtn={snackbar.actionBtn} />}
        </>
    );
};

export default TopPart;
