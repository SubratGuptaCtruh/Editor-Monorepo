import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
import { editor } from "../../../../../../3D/EditorLogic/editor";
import { getCurrentQueryParams } from "../../../../../../3D/EditorLogic/utils";
import { SYNC_ICON } from "../../../Sync/SyncUtils";
import styles from "./Web.module.css";

const COPY_STATE = {
    IDLE: "idle",
    PROCESSING: "processing",
    DONE: "done",
};

function Web() {
    const { UID, sceneID } = getCurrentQueryParams();
    const publishUrl = new URL("/publish", window.location.origin);

    // Append UID and sceneID as query parameters
    publishUrl.searchParams.set("UID", UID);
    publishUrl.searchParams.set("sceneID", sceneID);

    const [copyState, setCopyState] = useState(COPY_STATE.IDLE);

    const [syncState, setSyncState] = useState<string>(() => {
        return editor.cloudSyncState.finalState as string;
    });

    useEffect(() => {
        const callBack = (state: string) => {
            setSyncState(state);
        };

        editor.UIeventEmitter.on("syncState", callBack);

        return () => {
            editor.UIeventEmitter.off("syncState", callBack);
        };
    }, []);

    const copyLink = () => {
        setCopyState(COPY_STATE.PROCESSING);
        setTimeout(() => {
            navigator.clipboard
                .writeText(publishUrl.href)
                .then(() => {
                    setCopyState(COPY_STATE.DONE);
                    setTimeout(() => {
                        setCopyState(COPY_STATE.IDLE);
                    }, 800);
                })
                .catch(() => {
                    toast.error("Error while copying...");
                });
        }, 500);
    };

    const syncData = () => {
        if (syncState === "SYNCING") return;
        const unsubscriber = editor.retryUploadingFailedTextures((status) => {
            if (status === "SUCCESSFUL") {
                const { UID, sceneID } = getCurrentQueryParams();
                editor.uploadSceneData(UID, sceneID, () => {
                    toast.success("Publish link is ready!");
                });
            }
            unsubscriber();
        });
    };

    const Icon = SYNC_ICON[syncState].icon;
    const text = SYNC_ICON[syncState].text;

    const buttonStyle =
        syncState === "IDLE"
            ? {}
            : {
                  background: "rgba(247, 250, 252, 0.72)",
                  color: "#457cf8",
                  boxShadow: `-2px -2px 4px 0px rgba(254, 254, 254, 0.2),
        2px 2px 2px 0px rgba(34, 34, 34, 0.08),
        0px 0px 4px 0px rgba(8, 35, 61, 0.05) inset`,
                  padding: "0 0.75rem",
              };

    return (
        <div className={styles.webMainContainer}>
            <div className={styles.webTitle}>
                <h1>Share the Link</h1>
                <div className={styles.titleInner}>
                    <p>{syncState === "IDLE" ? publishUrl.href : "Data is not synced, click on Sync now to share the experience"}</p>
                    <button
                        onClick={() => {
                            syncState === "IDLE" ? copyLink() : syncData();
                        }}
                        style={buttonStyle}
                    >
                        {syncState === "IDLE" ? (
                            <span className={copyState === COPY_STATE.PROCESSING ? styles.loader : ""}>
                                {copyState === COPY_STATE.IDLE && "Copy Link"}
                                {copyState === COPY_STATE.PROCESSING && ""}
                                {copyState === COPY_STATE.DONE && "Copied"}
                            </span>
                        ) : (
                            <>
                                <Icon />
                                <span>{text}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
            {syncState === "IDLE" && (
                <div className={styles.qrContainer}>
                    <div className={styles.qrMain}>
                        <h1>Scan the QR Code</h1>
                        <QRCode style={{ width: "12rem", height: "12rem" }} value={publishUrl.href} />
                    </div>
                    <button>Download as Image</button>
                </div>
            )}
        </div>
    );
}

export default Web;
