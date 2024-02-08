import { useEffect, useState } from "react";
import { editor } from "../../../../3D/EditorLogic/editor";
import { getCurrentQueryParams } from "../../../../3D/EditorLogic/utils";
import Button from "../Button/Button";
import { SYNC_ICON } from "./SyncUtils";

export const SyncState = () => {
    const [syncState, setSyncState] = useState("IDLE");

    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const callBack = (state: string) => {
            setSyncState(state);
        };
        const offlineCallback = () => setIsOffline(true);
        const onlineCallback = () => setIsOffline(false);

        editor.UIeventEmitter.on("syncState", callBack);
        window.addEventListener("online", onlineCallback);
        window.addEventListener("offline", offlineCallback);

        return () => {
            editor.UIeventEmitter.off("syncState", callBack);
            window.removeEventListener("online", onlineCallback);
            window.removeEventListener("offline", offlineCallback);
        };
    }, []);

    const uiInfo = isOffline ? SYNC_ICON["OFFLINE"] : SYNC_ICON[syncState];
    const Icon = uiInfo.icon;
    const text = uiInfo.text;
    return (
        <Button
            icon={<Icon />}
            onClick={() => {
                const unsubscriber = editor.retryUploadingFailedTextures((status) => {
                    if (status === "SUCCESSFUL") {
                        const { UID, sceneID } = getCurrentQueryParams();
                        editor.uploadSceneData(UID, sceneID);
                    }
                    unsubscriber();
                });
            }}
            content={text}
            hoverStyle={false}
            style={{
                color: uiInfo.color,
            }}
        />
    );
};
