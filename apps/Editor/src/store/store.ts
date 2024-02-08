import { atom } from "jotai";
import { ReactElement } from "react";
import { CustomTreeItem } from "../2D/LeftPart/Components/LeftPartUnEdit/LeftPartUnEdit";
import { AudioProps } from "../2D/TopPart/components/AssetLibrary/AssetLibrary";
import paletteData from "../2D/TopPart/components/StyleLibrary/Components/Colors/palette.json";
import { BoxCreator } from "../3D/EditorLogic/BoxCreator";

// // files array
// interface FilesArray {
//     id: string;
//     filename: string;
//     type: string | null;
//     bloburl: string;
//     isCompressed: boolean;
//     fileextension: string;
//     userid: string;
//     uploadCategory: string;
//     corr2DImageUrl: string | null;
//     blobId: string;
//     category: string | null;
//     subcategory: string | null;
//     subtype: string | null;
// }

// User Info type
export interface UserObject {
    Files: FileItem[];
    User: {
        CreatedOn: string;
        IsActive: string;
        Phone: string;
        UserName: string;
        company_id: null | string;
        country: null | string;
        email_id: string;
        expertise: null | string;
        favorites: string[];
        firstLogin: boolean;
        id: string;
        iscompanyEmail: null | boolean;
        role: string;
        backgroundAudioId: string | null;
        smartScaling: UploadSettingOptions;
    };
}

interface PalletInfoTypes {
    id: string;
    title: string;
    url?: string;
    tags: string[] | null;
    hexCodes: string[];
}

export interface MeshType {
    id: string;
    meshtype: string;
    name: string;
    screenShot: string;
    texture: string;
}
export interface MenuPosition {
    left?: number;
    top?: number;
}

export interface FileItem {
    id: string;
    filename: string;
    type: string;
    bloburl: string | null;
    isCompressed: boolean;
    fileextension: string | null;
    userid: string;
    uploadCategory: string | null;
    corr2DImageUrl: string;
    blobId: string | null;
    category: string | null;
    subcategory: string | null;
    subtype: string | null;
}

export interface SnackbarInfoTypes {
    icon: ReactElement;
    message: string;
    actionBtn: ReactElement;
}

// including null default value before first object/scene upload
export type UploadSettingOptions = "as-is" | "bounding-box" | null;

export type SameFileActionTypes = "keep-both" | "replace" | null;

// State to store user informations
export const userDetails = atom<UserObject>({
    Files: [],
    User: {
        CreatedOn: "",
        IsActive: "",
        Phone: "",
        UserName: "",
        company_id: null,
        country: null,
        email_id: "",
        expertise: null,
        favorites: [],
        firstLogin: false,
        id: "",
        iscompanyEmail: null,
        role: "",
        backgroundAudioId: "",
        smartScaling: null,
    },
});
export const materialPreviewAtom = atom<MeshType>({
    id: "",
    meshtype: "",
    name: "",
    screenShot: "",
    texture: "",

    // id: "d371b8a2-3093-4615-93d1-ca35007ec737",
    // meshtype: "Wood",
    // name: "Dark_Wood",
    // screenShot: "https://ctruht0.blob.core.windows.net/mesh/dark_wood.webp",
    // texture: "https://ctruht0.blob.core.windows.net/mesh/dark_wood.jpg",
});
export const selectedMaterialAtom = atom<MeshType>({
    id: "",
    meshtype: "",
    name: "",
    screenShot: "/rightPartSVG/image placeholder.png",
    texture: "",
});

export const handleAmbiencePreviewModal = atom<boolean>(false);
export const handleMaterialPreviewModal = atom<boolean>(false);
export const handleCustomPalettePreviewModal = atom<boolean>(false);
export const fullScreenAtom = atom<boolean>(false);
export const fullScreenForAccountAtom = atom<boolean>(false);
export const handleObjectPreviewModal = atom<boolean>(false);
export const handleScenePreviewModal = atom<boolean>(false);
export const MenuSelected = atom<string>("");
export const LightSelected = atom<string>("Light Source");
export const menuPositionAtom = atom<MenuPosition>({});
export const exportModalAtom = atom<boolean>(false);
export const exportItemAtom = atom<CustomTreeItem | undefined>(undefined);
export const previewScreenAtom = atom<boolean>(false);
export const assetLibraryModalAtom = atom<boolean>(false);
export const styleLibraryModalAtom = atom<boolean>(false);
export const uploadModalAtom = atom<boolean>(false);
export const uploadSettingModalAtom = atom<boolean>(false);
export const sameFileModalAtom = atom<boolean>(false);
export const sameFileAtom = atom<File | null>(null);
export const sameFileItemAtom = atom<FileItem | null>(null);
export const ScreenUploadModalAtom = atom<boolean>(false);
export const PreviewItemAtom = atom<FileItem>({
    blobId: "",
    bloburl: "",
    category: "",
    corr2DImageUrl: "",
    fileextension: "",
    filename: "",
    id: "",
    isCompressed: false,
    subcategory: "",
    subtype: "",
    type: "",
    uploadCategory: "",
    userid: "",
});

//pallet info default value
export const palletSelectedInfo = atom<PalletInfoTypes>(paletteData[0]);
export const palletClickedInfo = atom<PalletInfoTypes>(paletteData[0]);

//audio info default value
export const audioSelectedInfoAtom = atom<AudioProps | null>(null);
export const backgroundAudioSelectedInfoAtom = atom<AudioProps | null>(null);

//state for opening style library
export const openStyle = atom<boolean>(false);

export const snackbarInfo = atom<SnackbarInfoTypes | null>(null);
export const snackbarTimeoutID = atom<NodeJS.Timeout | undefined>(undefined);

export const audioModalAtom = atom<boolean>(false);
export const currentAudioPlayingAtom = atom<string>("");
export const backgroundAudioModalAtom = atom<boolean>(false);

export const boxCreatorAtom = atom<BoxCreator | null>(null);

// for play pause functionality in Spatial Audio
export const selectedMusicAtom = atom<string>("");

export const uploadAndApplyMediaAtom = atom<"screen" | "audio" | "background-audio" | "hdr" | null>(null);
