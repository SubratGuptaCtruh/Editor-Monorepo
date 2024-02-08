import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { getUserAllDetailsById } from "./2D/APIs/actions";
import AccountSettings from "./2D/AccountSetings/AccountSettings";
import Gizmo from "./2D/Gizmo/Gizmo";
import { useHistory } from "./2D/Hooks/useHistory";
import { useOutsideClick } from "./2D/Hooks/useOutsideClick";
import LeftPart from "./2D/LeftPart/LeftPart";
import RightPart from "./2D/RightPart/RightPart";
import TopPart from "./2D/TopPart/TopPart";
// import { useParams } from "react-router-dom";
import Button from "./2D/TopPart/components/Button/Button";
import FileDropzone from "./2D/TopPart/components/FileDropZone/FileDropZone";
import { AspectRationSvgIcon, CameraSwitchIcons } from "./2D/TopPart/components/Icons/Icons";
import UndoRedo from "./2D/UndoRedo/UndoRedo";
// import { decrypt } from "./2D/Utils/Encrypt_decrypt.utils";
import { Nullable } from "@babylonjs/core";
import { Hotspot } from "./3D/EditorLogic/HotspotSystem";
import { editor } from "./3D/EditorLogic/editor";
import { VALID_UID_SCENE_ID_PATHS, getCurrentQueryParams, getUrlPathName } from "./3D/EditorLogic/utils";
import styles from "./App.module.css";
import { fullScreenAtom, fullScreenForAccountAtom, menuPositionAtom, userDetails } from "./store/store";

function App() {
    const setUserInfo = useSetAtom(userDetails);
    const setMenuPosition = useSetAtom(menuPositionAtom);
    const [fullScreen, setFullScreen] = useAtom(fullScreenAtom);
    const [fullScreenAccount, setFullScreenAccount] = useAtom(fullScreenForAccountAtom);
    const [cameraState, setCameraState] = useState<number | undefined>(0);
    const [gizmoEnabledCamera, setgizmoEnabledCamera] = useState<boolean>(true);
    const { redosEnable, undosEnable } = useHistory(editor);

    useEffect(() => {
        const { UID, sceneID } = getCurrentQueryParams();
        const pathname = getUrlPathName();
        if (VALID_UID_SCENE_ID_PATHS.includes(pathname) && (!UID || !sceneID)) {
            window.location.replace("/404");
        }
        console.log("URndsbckL", UID, sceneID);
    }, []);

    // useEffect(() => {
    //     editor.hideLoadingUI();
    // }, []);

    useEffect(() => {
        const getUser = async () => {
            const { UID, sceneID } = getCurrentQueryParams();
            if (!UID || !sceneID) throw Error("provide UID and sceneID");
            const { data, status } = await getUserAllDetailsById(UID);
            if (status === 200) {
                setUserInfo(data);
                localStorage.setItem("user", JSON.stringify(data.User));
            }
        };
        getUser();
    }, [setUserInfo]);

    const ref = useOutsideClick(() => {
        setMenuPosition({});
    });
    const handleCameraStateClick = () => {
        editor.toggleCameraMode();
        setCameraState(editor.get.getCameraMode());
    };

    useEffect(() => {
        editor.setUpshortCuts();
        editor.hotspotSystem.unhide();
    }, []);

    useEffect(() => {
        const callback = (hotspotInPreview: Nullable<Hotspot>) => {
            if (hotspotInPreview) {
                setgizmoEnabledCamera(false);
            } else {
                setgizmoEnabledCamera(true);
            }
        };

        const unsubscriber = editor.hotspotSystem.setPreviewHotspotChangedCallback(callback);

        return () => {
            unsubscriber();
        };
    }, []);

    return (
        <div className={styles.uiLayerMainContainer} ref={ref}>
            {fullScreen ? (
                <div className={styles.fullScreenButton}>
                    <Button icon={<AspectRationSvgIcon />} content="SHOW UI" onClick={() => setFullScreen(false)} />
                </div>
            ) : fullScreenAccount ? (
                <AccountSettings close={() => setFullScreenAccount(false)} />
            ) : (
                <>
                    <Toaster containerClassName={styles.toasterWrapper} position="top-center" reverseOrder={false} />
                    <TopPart />
                    <LeftPart />
                    <RightPart />
                    <UndoRedo undo={editor.undo} redo={editor.redo} undoEnabled={undosEnable} redoEnabled={redosEnable} />
                    {gizmoEnabledCamera ? <Gizmo /> : null}
                    {cameraState !== undefined && (
                        <Button
                            style={{ position: "absolute", bottom: "32px", left: "32px" }}
                            icon={<CameraSwitchIcons />}
                            onClick={handleCameraStateClick}
                            content={cameraState === 1 ? "ISOMETRIC" : "PERSPECTIVE"}
                        />
                    )}
                </>
            )}
            <FileDropzone />
        </div>
    );
}

export default App;
