import { OfflineIcon, ProcessingIcon, SyncNowIcon, SyncedIcon } from "../Icons/Icons";

export const SYNC_ICON: { [key: string]: { icon: () => JSX.Element; text: string; color: string } } = {
    IDLE: {
        icon: SyncedIcon,
        text: "Synced",
        color: "#2FAE62",
    },
    SYNCING: {
        icon: ProcessingIcon,
        text: "Syncing",
        color: "#3D75F3",
    },
    UNSYNCED: {
        icon: SyncNowIcon,
        text: "Sync Now",
        color: "#3D75F3",
    },
    OFFLINE: {
        icon: OfflineIcon,
        text: "Offline",
        color: "#E74646",
    },
};
