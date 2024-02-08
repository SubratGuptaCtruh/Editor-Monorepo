export const isFileValid = (filename: string, acceptedFileExtensions: string[]) => {
    const fileExtension = "." + filename.split(".").pop();
    return acceptedFileExtensions.includes(fileExtension?.toLowerCase() || "");
};

export const FILE_TYPE = {
    VIDEO: "video",
    MODEL: "model",
    HDR: "hdr",
    AUDIO: "audio",
    VECTOR: "vector",
    IMAGE: "image",
};

export const getFileTypeForFile = (fileName: string) => {
    const fileExtension = "." + fileName.split(".").pop();

    if ([".glb", ".gltf", ".obj"].includes(fileExtension)) {
        return FILE_TYPE.MODEL;
    } else if ([".hdr"].includes(fileExtension)) {
        return FILE_TYPE.HDR;
    } else if ([".mp3", ".wav", ".ogg"].includes(fileExtension)) {
        return FILE_TYPE.AUDIO;
    } else if ([".svg"].includes(fileExtension)) {
        return FILE_TYPE.VECTOR;
    } else if ([".jpg", ".png", ".jpeg"].includes(fileExtension)) {
        return FILE_TYPE.IMAGE;
    } else if ([".mp4", ".mov"].includes(fileExtension)) {
        return FILE_TYPE.VIDEO;
    }
    return ""; // Add more cases as needed
};
