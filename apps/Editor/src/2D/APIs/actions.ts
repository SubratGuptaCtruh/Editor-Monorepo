import axios, { AxiosProgressEvent, isAxiosError } from "axios";
import { Storage as DBStorage } from "../../3D/EditorLogic/Storage";
import { ResponseData } from "../../3D/EditorLogic/editor";
import { dataURLtoImageFile, jsonToFile } from "../../3D/EditorLogic/utils";
import { FILE_TYPE } from "../Utils/FileUpload.utils";

const BASE_URL = import.meta.env.VITE_API_GATEWAY_BASE_URL;
const SKETCHFAB_BASE_URL = import.meta.env.VITE_SKETCHFAB_BASE_URL;
const AI_URL = import.meta.env.VITE_AI_GATEWAY_BASE_URL;
const FILE_SERVICE_API_KEY = import.meta.env.VITE_FILE_SERVICE_API_KEY;
const SCENE_SERVICE_API_KEY = import.meta.env.VITE_SCENE_SERVICE_API_KEY;
const MESH_SERVICE_API_KEY = import.meta.env.VITE_MESH_SERVICE_API_KEY;
const USER_SERVICE_API_KEY = import.meta.env.VITE_USER_SERVICE_API_KEY;
const PROJECT_SERVICE_API_KEY = import.meta.env.VITE_PROJECT_SERVICE_API_KEY;
const MODEL_SERVICE_API_KEY = import.meta.env.VITE_MODEL_SERVICE_API_KEY;
const BLOBSTOARGE_URL = import.meta.env.VITE_BLOBSTORAGE_BASE_URL;

type User = {
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
    iscompanyEmail: boolean | null;
    role: string;
};

const createFormData = (file: File, fileType: string, imageUrl?: string, userId?: string, name?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    // updated file name for "keep-both" case while uploading 3d objects
    formData.append("fileName", name ?? file.name);
    formData.append("isCompressed", "false");
    formData.append("fileType", fileType);
    imageUrl && formData.append("corr2DImageUrl", imageUrl);
    userId && formData.append("userId", userId);
    formData.append("uploadCategory", "user-defined");
    return formData;
};

const createAudioFormData = (file: File, userId: string, duration: string, name = file.name) => {
    const formData = new FormData();
    formData.append("title", name.split(".")[0]);
    formData.append("category", "");
    formData.append("tags", "");
    formData.append("userId", userId);
    formData.append("duration", duration);
    formData.append("file", file);
    return formData;
};

const createBackgroundAudioFormData = (audioId: string | null) => {
    const formData = new FormData();
    // to avoid types - audioId can be null
    formData.append("backgroundAudioId", audioId as string);
    return formData;
};

const handleAxiosError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        return { data: error?.response?.data, status: error?.response?.status };
    } else {
        return { data: null, status: 500 };
    }
};

const axiosConfig = (apiKey: string) => ({
    headers: { "X-Api-Key": apiKey },
});

export const handleUploadFile = async (file: File, userId: string, fileType: string, imageUrl?: string | File, name = file.name) => {
    try {
        if (fileType === FILE_TYPE.MODEL) {
            const formdata = new FormData();
            formdata.append("userId", userId);
            formdata.append("file", file, file.name);
            const img = imageUrl as File;
            formdata.append("imageFile", img, img.name);
            const response = await axios.post(`${BASE_URL}/editorGltfUpload`, formdata, axiosConfig(MODEL_SERVICE_API_KEY));
            return { data: response.data, status: 200 };
        } else {
            // updated file name for "keep-both" case while uploading 3d objects
            const formData = createFormData(file, fileType, imageUrl as string, userId, name);
            const response = await axios.post(`${BASE_URL}/UploadFile`, formData, axiosConfig(FILE_SERVICE_API_KEY));

            return { data: response.data, status: 200 };
        }
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const handleUploadModel = async (file: File, userId: string, url?: string, fileRelativePath?: string, throwError = false) => {
    try {
        const sasRequestUrl = new URL(`${BASE_URL}/generateEditorSASToken`);
        sasRequestUrl.searchParams.append("userId", userId);
        sasRequestUrl.searchParams.append("fileName", fileRelativePath ? fileRelativePath : file.name);
        sasRequestUrl.searchParams.append("requestType", "update");

        const token = await axios.get(sasRequestUrl.href, axiosConfig(MODEL_SERVICE_API_KEY));
        const postUrl = new URL(url ? url : `${BLOBSTOARGE_URL}/user-${userId}/models/${file.name}`);
        if (!token.data.sasToken) throw Error("no sasToken genrated");

        console.log(postUrl, "dfcsb");
        const response = await axios.put(`${postUrl}?${token.data.sasToken}`, file, {
            headers: {
                "x-ms-blob-type": "BlockBlob",
            },
        });
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        if (throwError) {
            throw new Error("Somthing went wrong while uploading resources.");
        }
        return handleAxiosError(error);
    }
};

export const handleUploadSceneData = async (
    userId: string,
    sceneId: string,
    json: { [key: string]: unknown },
    img: string,
    update: boolean = false,
    onProgress?: (e: AxiosProgressEvent) => void
) => {
    try {
        const formData = new FormData();
        formData.append("userId", userId);
        const sceneFile = jsonToFile(json);
        formData.append("jsonFile", sceneFile);
        formData.append("sceneId", sceneId);
        const imgFile = dataURLtoImageFile(img);
        formData.append("imageFile", imgFile);

        // console.log(sceneFile, sceneFile.size/1048576,  "SCENEFILE");;

        const configs = {
            ...axiosConfig(MODEL_SERVICE_API_KEY),
            onUploadProgress: (e: AxiosProgressEvent) => {
                console.log(e.progress, "UPLOAD EVENT");
                onProgress && onProgress(e);
            },
        };

        const response = update ? await axios.put(`${BASE_URL}/editorConfigUpdate`, formData, configs) : await axios.post(`${BASE_URL}/editorConfigUpload`, formData, configs);

        return { data: response.data, status: 200 };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const getSceneDataFile = async (userId: string, sceneId: string, storage: DBStorage) => {
    try {
        //adding current time as dummy param to make sure browser's internal caching doesn't interfer
        const sceneJsonURL = `https://ctruhcdn.azureedge.net/editor/user-${userId}/scenes/${sceneId}/jsonFile.json?_=${new Date().getTime()}`;
        const response = await axios.get(sceneJsonURL, { headers: { "Access-Control-Allow-Origin": "*" } });

        if (response.status === 404) {
            console.log("asfhbjkfsbldfjksda");
        }
        return { data: response.data, status: 200 };
    } catch (error) {
        if (!isAxiosError(error)) throw error;
        if (error.response?.status !== 404) throw error;

        const hasInIDB = await storage.getKey(sceneId);

        if (hasInIDB) {
            return { data: { LoadFrom: "IDB" } satisfies ResponseData, status: 200 };
        }
        if (!hasInIDB) {
            return { data: { LoadFrom: "DEFUALT" } satisfies ResponseData, status: 200 };
        }
    }
};

export const getSceneJsonData = async (userId: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/GetUserScenesViaWebSocket/${userId}`, axiosConfig(SCENE_SERVICE_API_KEY));
        return { data: response.data, status: 200 };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const getAllSystemFiles = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/GetAllSystemFiles`, axiosConfig(FILE_SERVICE_API_KEY));
        console.log(response.data);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const getAllAudioFiles = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/GetAllAudios`, axiosConfig(PROJECT_SERVICE_API_KEY));
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return { data: error?.response?.data, status: error?.response?.status };
        } else {
            return { data: null, status: 500 };
        }
    }
};

export const getAllCustomAudioFiles = async (pageLimit: number, pageNumber: number, titleQuery: string, userId: string) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/GetCustomAudiosByPagination?pageLimit=${pageLimit}&pageNumber=${pageNumber}&titleQuery=${titleQuery}&userId=${userId}`,
            axiosConfig(PROJECT_SERVICE_API_KEY)
        );
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const getAllAudioFilesByPagination = async (audioPageLimit: number, audioPageNumber: number, titleQuery: string, tagQueries: string) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/GetAudiosByPagination?pageLimit=${audioPageLimit}&pageNumber=${audioPageNumber}&titleQuery=${titleQuery}&tagQueries=${tagQueries}`,
            axiosConfig(PROJECT_SERVICE_API_KEY)
        );
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return { data: error?.response?.data, status: error?.response?.status };
        } else {
            return { data: null, status: 500 };
        }
    }
};

export const getPresetAudioById = async (audioId: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/GetAudioById/${audioId}`, axiosConfig(PROJECT_SERVICE_API_KEY));
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const getCustomAudioById = async (audioId: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/GetCustomAudioById/${audioId}`, axiosConfig(PROJECT_SERVICE_API_KEY));
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const addCustomAudio = async (file: File, userId: string, duration: string, name?: string) => {
    try {
        const formData = createAudioFormData(file, userId, duration, name);
        const response = await fetch(`${BASE_URL}/PostCustomAudio`, {
            method: "POST",
            headers: { "X-Api-Key": FILE_SERVICE_API_KEY },
            body: formData,
        });
        const data = await response.json();
        return { data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const deleteCustomAudio = async (audioId: string) => {
    try {
        const response = await axios.delete(`${BASE_URL}/DeleteCustomAudio/${audioId}`, axiosConfig(PROJECT_SERVICE_API_KEY));
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const handleDeleteBlobFile = async (id: string) => {
    try {
        const response = await axios.delete(`${BASE_URL}/DeleteBlobFile/${id}`, axiosConfig(FILE_SERVICE_API_KEY));
        console.log(response.data);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const handleUploadImageToBlob = async (image: File, userId: string, name = image.name) => {
    try {
        // updated file name for "keep-both" case while uploading 3d objects
        const formData = createFormData(image, "image", undefined, userId, name);
        const response = await axios.post(`${BASE_URL}/UploadFileToBlobOnly`, formData, axiosConfig(FILE_SERVICE_API_KEY));
        if (response.data !== "Object reference not set to an instance of an object.: File upload failed") {
            console.log(response.data);
            return { data: response.data, status: 200 };
        }
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const getSpecificFilesByUserId = async (userId: string, fileType: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/GetSpecificFilesByUserId/${userId}?filetype=${fileType}`, axiosConfig(FILE_SERVICE_API_KEY));
        console.log(response.data);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const uploadFileFromExternalUrl = async (glbUrl: string, fileName: string, userId: string, imageUrl: string) => {
    try {
        const body = {
            fileUrl: glbUrl,
            fileName: fileName,
            userid: userId,
            corr2DImageUrl: imageUrl,
        };
        const response = await axios.post(`${BASE_URL}/UploadFileFromExternalURL`, body, axiosConfig(FILE_SERVICE_API_KEY));
        console.log(response.data);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const getSceneData = async (sceneId: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/GetScene/${sceneId}`, axiosConfig(SCENE_SERVICE_API_KEY));
        console.log(response.data);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const updateSceneById = async (sceneId: string, body: object) => {
    try {
        const response = await axios.put(`${BASE_URL}/UpdateScene/${sceneId}`, body, axiosConfig(SCENE_SERVICE_API_KEY));
        console.log(response.data);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const getAllMeshes = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/GetAllMesh`, axiosConfig(MESH_SERVICE_API_KEY));
        console.log(response.data);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const getUserById = async (userId: string) => {
    try {
        const response = await axios.get(`/GetUserByGUID/${userId}`, axiosConfig(USER_SERVICE_API_KEY));
        console.log(response.data);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const getUserAllDetailsById = async (userId: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/GetUserDetail/${userId}`, axiosConfig(USER_SERVICE_API_KEY));
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const updateUserDetails = async (user: object, userId: string) => {
    try {
        const response = await axios.put(`${BASE_URL}/UpdateUser/${userId}`, user, axiosConfig(USER_SERVICE_API_KEY));
        console.log(response.data);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const updateUserBackgroundAudio = async (userId: string, audioId: string | null) => {
    try {
        const formData = createBackgroundAudioFormData(audioId);
        const response = await axios.put(`${BASE_URL}/UpdateUserBackgroundSound/${userId}`, formData, axiosConfig(USER_SERVICE_API_KEY));
        console.log(response.data);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const updateFirstTimeUser = async (userId: string) => {
    try {
        const response = await axios.put(`${BASE_URL}/UpdateUserLogin/${userId}`, {}, axiosConfig(USER_SERVICE_API_KEY));
        console.log(response.data);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const getApiKeyByServiceId = async (serviceId: string) => {
    try {
        const config = {
            headers: {
                "X-SERVICE-KEY": serviceId,
            },
        };
        const response = await axios.get("/api/API_Identity/GetAPIKeyByServiceId", config);
        console.log(response.data);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const getSketchFabModelByUid = async (uid: string) => {
    try {
        const token = localStorage.getItem("sb_t");
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        const response = await axios.get(`${SKETCHFAB_BASE_URL}/v3/models/${uid}/download`, config);
        console.log(response.data);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const getAllSketchFabModels = async (pagination: string, query: string) => {
    try {
        const response = await axios.get(
            `${SKETCHFAB_BASE_URL}/v3/search?archives_flavours=false&count=24&cursor=${pagination}&downloadable=true&sort_by=-likeCount&q=${query}&type=models`
        );
        console.log(response.data);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const getPurchasedSketchFabModels = async (query: string) => {
    try {
        const token = localStorage.getItem("sb_t");
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        const response = await axios.get(`${SKETCHFAB_BASE_URL}/v3/me/models/purchases?q=${query}`, config);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const getMySketchFabModels = async () => {
    try {
        const token = localStorage.getItem("sb_t");
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        const response = await axios.get(`${SKETCHFAB_BASE_URL}/v3/me/models?downloadable=true&archives_flavours=false`, config);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

// Function to add template to favorites list
export const addToFavorites = async (id: string, userDetails: User, favorites: string[]) => {
    try {
        const newFavourites = [...favorites, id];
        userDetails.favorites = newFavourites;
        const response = await axios.put(`${BASE_URL}/UpdateUser/${userDetails.id}`, userDetails, axiosConfig(USER_SERVICE_API_KEY));
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

// Function to remove template from favorites list
export const removeFromFavorites = async (id: string, favorites: string[], userDetails: User) => {
    try {
        const newFavourites = favorites?.filter((elem: string) => elem !== id);
        userDetails.favorites = newFavourites;
        const response = await axios.put(`${BASE_URL}/UpdateUser/${userDetails?.id}`, userDetails, axiosConfig(USER_SERVICE_API_KEY));
        console.log(response.data);
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        return handleAxiosError(error);
    }
};

export const getPaletteFiles = async (pageLimit: number, pageNumber: number, titleQuery: string, tagQueries: string) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/GetPalettesByPagination?pageLimit=${pageLimit}&pageNumber=${pageNumber}&titleQuery=${titleQuery}&tagQueries=${tagQueries}`,
            axiosConfig(PROJECT_SERVICE_API_KEY)
        );
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return { data: error?.response?.data, status: error?.response?.status };
        } else {
            return { data: null, status: 500 };
        }
    }
};

export const getCustomPaletteFiles = async (userId: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/GetCustomPaletteByUsrId/${userId}`, axiosConfig(PROJECT_SERVICE_API_KEY));
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return { data: error?.response?.data, status: error?.response?.status };
        } else {
            return { data: null, status: 500 };
        }
    }
};

export const addCustomPalette = async (userId: string, title: string, url: string, hexCodes: string[]) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/PostCustomPalette`,
            {
                userId,
                title,
                url,
                hexCodes,
            },
            axiosConfig(PROJECT_SERVICE_API_KEY)
        );
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return { data: error?.response?.data, status: error?.response?.status };
        } else {
            return { data: null, status: 500 };
        }
    }
};

export const editCustomPalette = async (paletteId: string, title: string) => {
    try {
        const url = `${BASE_URL}/UpdateCustomPaletteTitle/${paletteId}?title=${title}`;
        const config = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": PROJECT_SERVICE_API_KEY,
            },
        };
        const response = await fetch(url, config);
        const data = await response.json();
        return { data, status: 200 };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return { data: error?.response?.data, status: error?.response?.status };
        } else {
            return { data: null, status: 500 };
        }
    }
};

export const deleteCustomPalette = async (paletteId: string) => {
    try {
        const response = await axios.delete(`${BASE_URL}/DeleteCustomPalette/${paletteId}`, axiosConfig(PROJECT_SERVICE_API_KEY));
        return { data: response.data, status: 200 };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return { data: error?.response?.data, status: error?.response?.status };
        } else {
            return { data: null, status: 500 };
        }
    }
};
// API TO GET AI MODEL
export const AIModal = async (request: string) => {
    const prompt = request;
    if (prompt) {
        try {
            const response = await axios.post(AI_URL, {
                prompt,
            });
            return { data: response.data, status: 200 };
        } catch (error: unknown) {
            console.log("error", error);
            return { data: error };
        }
    } else {
        return { message: "Invalid Request", status: 400 };
    }
};
