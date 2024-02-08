import { FileItem } from "../../../../../../store/store";
import { getSpecificFilesByUserId } from "../../../../../APIs/actions";
import { getFileTypeForFile } from "../../../../../Utils/FileUpload.utils";

// updated file name for "keep-both" case while uploading 3d objects
export const updatedFileName = async (userId: string, file: File) => {
    let newName = file.name;
    const pattern = /^(.*?)(\d*)\.(glb|gltf|obj|hdr|mp3|wav|ogg|svg|jpg|png|jpeg|mp4|mov)$/;

    // Use regular expression to extract the base name and the number (if any)
    const match = newName.match(pattern);

    if (match) {
        const [, baseName, numberStr, extension] = match;
        let newNumber = numberStr;
        const fileType = getFileTypeForFile(newName);
        let sameFileNameObject = file;

        // initial new number creation
        if (numberStr) {
            // If a number is present, increment it by 1
            newNumber = String(Number(numberStr) + 1);
        } else {
            // If no number is present, add 1
            newNumber = "1";
        }

        // initial new name creation
        newName = `${baseName}${newNumber}.${extension}`;

        // check if model upload file with same name exists in database
        while (sameFileNameObject) {
            const { data, status } = await getSpecificFilesByUserId(userId, fileType);
            if (status === 200) {
                sameFileNameObject = data.find((fileItem: FileItem) => fileItem.filename === newName);
                // if same file name exists, update new name and check again
                if (sameFileNameObject) {
                    newNumber = String(Number(newNumber) + 1);
                    newName = `${baseName}${newNumber}.${extension}`;
                    continue;
                }
                // if same file name does not exist, exit this while loop
                else {
                    break;
                }
            }
        }
    }
    // return file name which does not exist
    return newName;
};
