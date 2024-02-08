import { useAtomValue } from "jotai";
import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { userDetails } from "../../../../../../../../store/store";
import { getPurchasedSketchFabModels, getSketchFabModelByUid, getSpecificFilesByUserId, uploadFileFromExternalUrl } from "../../../../../../../APIs/actions";
import LoadingText from "../../../../../../../Components/LoadingText/LoadingText";
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
    name: string;
    thumbnails?: ImagesArray; // Thumbnails is an object of ImagesArray
    filename: string;
    corr2DImageUrl: string;
}

const SketchFabPurchasedModels = () => {
    const [isError, setIsError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [query, setQuery] = useState<string>("");
    const [modelsData, setModelsData] = useState<Model[]>([]);
    const [tempQueryValue, setTempQueryValue] = useState<string>("");
    const [selectedCard, setSelectedCard] = useState<Model | undefined>(undefined);
    const [isExecuting, setIsExecuting] = useState(false);
    const userInfo = useAtomValue(userDetails);

    // This will fetch all purchased Sketchfab models
    // and run whenever there is a change in query.
    useEffect(() => {
        getMyPurchasedSketchFabModels(query);
    }, [query]);

    // Function to get purchased sketchfab models
    const getMyPurchasedSketchFabModels = async (query: string) => {
        setIsLoading(true);
        setModelsData([]);
        const { data, status } = await getPurchasedSketchFabModels(query);
        if (status === 200) {
            console.log(data);
            setModelsData(data?.results);
            setIsLoading(false);
        } else {
            setIsLoading(false);
            setIsError(true);
        }
    };

    // Function to set query value
    const handleSearchQuery = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.value === "") {
            setQuery("");
        } else {
            setTempQueryValue(event.target.value);
        }
    };

    // Function to set query value on press of enter button
    const handleEnter = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.keyCode === 13) {
            setQuery(tempQueryValue);
        }
    };

    // Function to get downloadable glb url
    const getSFModelsDownloadUrl = async (modelId: string) => {
        if (!isExecuting) {
            setIsExecuting(true);
            const { data, status } = await getSketchFabModelByUid(modelId);
            if (status === 200) {
                console.log(data);
                // Checking file size of sketchfab model
                if (data?.glb?.size / 1000 / 1000 <= 100) {
                    // Checking how many GLBs the user has already uploaded.
                    const fileType = "sketchfab";
                    const userId = userInfo?.User?.id;
                    const { data: uploadedFiles, status } = await getSpecificFilesByUserId(userId, fileType);
                    if (status === 200) {
                        console.log();
                        if (uploadedFiles.length < 10) {
                            const glbUrl = data?.glb?.url;
                            const fileName = selectedCard?.name || "";
                            const userId = userInfo?.User?.id;
                            const imageUrl = selectedCard?.thumbnails?.images[3]?.url || "";

                            const { data: blobData, status } = await uploadFileFromExternalUrl(glbUrl, fileName, userId, imageUrl);
                            if (status === 200) {
                                // Here you will get final blob URL from db
                                console.log({ blobData });
                                toast.success("File uploaded!");
                                setSelectedCard(undefined);
                                setIsExecuting(false);
                            }
                            setIsExecuting(false);
                        } else {
                            toast.error("Please delete one of the models from the 'used models' section.");
                            setIsExecuting(false);
                        }
                    } else {
                        console.log(uploadedFiles);
                        toast.error("Something went wrong");
                        setIsExecuting(false);
                    }
                } else {
                    toast.error("Please select different model");
                    setIsExecuting(false);
                }
            }
            setIsExecuting(false);
        }
    };

    // This function will run when clicking on load object
    const loadGlb = () => {
        if (selectedCard) {
            getSFModelsDownloadUrl(selectedCard?.uid);
        } else {
            toast.error("Please select the glb");
        }
    };
    return (
        <>
            {modelsData.length !== 0 && (
                <SearchInput handleChange={handleSearchQuery} handleEnterKey={handleEnter} isError={isError} isLoading={isLoading} placeholder="Search for a model..." />
            )}
            <div className={styles.sceneMainContainer}>
                {isError && <div className={styles.noSceneTemplatesDiv}>Oops! Could not load sketchfab models.</div>}
                {isLoading && (
                    <div className={styles.noSceneTemplatesDiv}>
                        <LoadingText />
                    </div>
                )}
                {!isError && !isLoading && modelsData.length === 0 && <div className={styles.noSceneTemplatesDiv}>Oops! No models found.</div>}
                <div className={styles.sceneContainer}>
                    {/* Card Mapping */}
                    {!isError &&
                        modelsData?.map((model) => (
                            <ModelCard
                                style={
                                    model?.thumbnails?.images[3]?.uid === selectedCard?.thumbnails?.images[3]?.uid
                                        ? {
                                              border: "1px solid #457CF8",
                                          }
                                        : { border: "1px solid transparent" }
                                }
                                onClick={() => setSelectedCard(model)}
                                key={model?.uid}
                                data={model}
                            />
                        ))}
                </div>
                {!isError && !isLoading && modelsData.length !== 0 && (
                    <div className={styles.buttonContainer}>
                        <button
                            disabled={selectedCard?.uid === null || selectedCard?.uid === undefined}
                            style={{
                                cursor: selectedCard?.uid === null || selectedCard?.uid === undefined ? "not-allowed" : "pointer",
                                opacity: selectedCard?.uid === null || selectedCard?.uid === undefined ? "0.9" : "1",
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

export default SketchFabPurchasedModels;
