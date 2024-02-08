import { useAtomValue, useSetAtom } from "jotai";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BoxCreator } from "../../../../../../../../3D/EditorLogic/BoxCreator";
import { editor } from "../../../../../../../../3D/EditorLogic/editor";
import { boxCreatorAtom, userDetails } from "../../../../../../../../store/store";
import { getSpecificFilesByUserId, handleDeleteBlobFile } from "../../../../../../../APIs/actions";
import LoadingText from "../../../../../../../Components/LoadingText/LoadingText";
import { useAddModel } from "../../../../../../../Hooks/useAddModel";
import styles from "../../../Scene/Scene.module.css";
import SearchInput from "../../../SearchInput/SearchInput";
import ModelCard from "./ModelCard/ModelCard";

// Define the URL interface
interface URL {
    url: string;
    uid: string;
}

// Define the ImagesArray interface
interface ImagesArray {
    images: URL[];
}

// Dynamic Model type
interface Model {
    uid: string;
    bloburl: string;
    name: string;
    thumbnails?: ImagesArray; // Thumbnails is an object of ImagesArray
    filename: string;
    corr2DImageUrl: string;
    id: string;
}

const UsedSketchFabModels = () => {
    const [isError, setIsError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>("");
    const [modelsData, setModelsData] = useState<Model[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [selectedCard, setSelectedCard] = useState<Model | undefined>(undefined);
    const userInfo = useAtomValue(userDetails);
    const uploadSetting = userInfo.User.smartScaling;
    const importModel = useAddModel();
    const setBoxCreator = useSetAtom(boxCreatorAtom);

    // Function to get all sketchfab models uploaded by user to Db
    const getUsedSketchFabModels = useCallback(async () => {
        setIsLoading(true);
        const fileType = "sketchfab";
        const userId = userInfo?.User?.id;
        const { data, status } = await getSpecificFilesByUserId(userId, fileType);
        if (status === 200) {
            setModelsData(data);
            setIsLoading(false);
        } else {
            setIsError(true);
            setIsLoading(false);
        }
    }, [userInfo]);

    useEffect(() => {
        getUsedSketchFabModels();
    }, [getUsedSketchFabModels]);
    // Function to set search value
    const handleSearchFilter = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    // Function to delete a file
    const deleteUploadedFile = async (id: string) => {
        if (!isExecuting) {
            setIsExecuting(true);
            const { data, status } = await handleDeleteBlobFile(id);
            if (status === 200) {
                console.log(data);
                const newData = modelsData.filter((item) => item.id !== id);
                setModelsData(newData);
                setIsExecuting(false);
            } else {
                setIsExecuting(false);
                throw new Error("Could not be deleted!");
            }
        }
    };

    // This function will run when clicking on load object
    const loadGlb = () => {
        if (selectedCard) {
            importModel(selectedCard.bloburl, selectedCard.filename);
            console.log(selectedCard, "svkm");
        } else {
            toast.error("Please select the glb");
        }
    };

    useEffect(() => {
        if (uploadSetting === "bounding-box") {
            setBoxCreator(new BoxCreator(editor.canvas, editor.scene));
        } else {
            setBoxCreator(null);
        }
    }, [uploadSetting, setBoxCreator]);

    return (
        <>
            {modelsData.length !== 0 && <SearchInput handleChange={handleSearchFilter} isError={isError} isLoading={isLoading} placeholder="Search for a model..." />}
            <div className={styles.sceneMainContainer}>
                {isError && <div className={styles.noSceneTemplatesDiv}>Oops! Could not load your uploaded sketchfab models.</div>}
                {isLoading && (
                    <div className={styles.noSceneTemplatesDiv}>
                        <LoadingText />
                    </div>
                )}
                {!isError && !isLoading && modelsData.length === 0 && <div className={styles.noSceneTemplatesDiv}>Oops! No models found.</div>}
                <div className={styles.sceneContainer}>
                    {/* Card Mapping */}
                    {!isError &&
                        modelsData
                            ?.filter((model) => {
                                if (searchValue === "") {
                                    return model;
                                } else if (model?.name.toLowerCase().includes(searchValue.toLowerCase())) return model;
                            })
                            ?.map((model) => (
                                <ModelCard
                                    style={
                                        model?.id === selectedCard?.id
                                            ? {
                                                  border: "1px solid #457CF8",
                                              }
                                            : { border: "1px solid transparent" }
                                    }
                                    onClick={() => setSelectedCard(model)}
                                    key={model?.id}
                                    data={model}
                                    isDeleteButton={true}
                                    handleDelete={() =>
                                        toast.promise(deleteUploadedFile(model?.id), {
                                            loading: "Deleting...",
                                            success: "File deleted!",
                                            error: "Could not be deleted.",
                                        })
                                    }
                                />
                            ))}
                </div>
                {!isError && !isLoading && modelsData.length !== 0 && (
                    <div className={styles.buttonContainer} style={{ justifyContent: "end" }}>
                        <button
                            disabled={selectedCard?.id === null || selectedCard?.id === undefined}
                            style={{
                                cursor: selectedCard?.id === null || selectedCard?.id === undefined ? "not-allowed" : "pointer",
                                opacity: selectedCard?.id === null || selectedCard?.id === undefined ? "0.9" : "1",
                            }}
                            onClick={loadGlb}
                            className={styles.uploadButton}
                        >
                            {isExecuting ? <LoadingText /> : "Load Object"}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default UsedSketchFabModels;
