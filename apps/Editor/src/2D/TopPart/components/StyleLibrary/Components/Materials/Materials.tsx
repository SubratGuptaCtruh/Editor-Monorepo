import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { ChangeEvent, useEffect, useState } from "react";
import { MeshType, handleMaterialPreviewModal, materialPreviewAtom, userDetails } from "../../../../../../store/store";
import { getAllMeshes } from "../../../../../APIs/actions";
import SearchInput from "../../../AssetLibrary/Components/SearchInput/SearchInput";
import { Shimmer } from "../../../AssetLibrary/Components/Shimmer/Shimmer";
import Card from "../Card/Card";
import MaterialPreview from "./MaterialPreview/MaterialPreview";
import styles from "./Materials.module.css";

function Materials() {
    const [materials, setMaterials] = useState<MeshType[]>([]);
    const [isError, setIsError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>("");
    const [materialFilters, setMaterialFilters] = useState<string[]>([]);
    const [stopScroll, setStopScroll] = useState(false);

    const setFullScreen = useSetAtom(materialPreviewAtom);
    const [selectedCard, setSelectedCard] = useAtom(handleMaterialPreviewModal);
    const userInfo = useAtomValue(userDetails);
    const favourites = userInfo?.User?.favorites;

    const handleCardClick = () => {
        setSelectedCard(true);
    };
    const handleCardData = (data: MeshType) => {
        // Handle the click event here
        console.log(data);
        setFullScreen(data);
        console.log("Card clicked!");
    };
    // Get all materials on component's mount
    useEffect(() => {
        const getMaterials = async () => {
            setIsLoading(true);
            const { data, status } = await getAllMeshes();
            if (status === 200) {
                console.log("Materials", data);
                setMaterials(data);
                setIsLoading(false);
            } else {
                setIsError(true);
                setIsLoading(false);
            }
        };
        getMaterials();
    }, []);

    // Function to set the search value
    const handleSearchFilter = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const updateMaterialFilters = (item: string) =>
        materialFilters?.includes(item) ? setMaterialFilters((prev) => prev?.filter((filter) => filter !== item)) : setMaterialFilters((prev) => [...prev, item]);

    // Filter Buttons
    const filterButtonsData = [
        {
            content: "Favourite",
            tab: "Favourite",
            icon: "❤️",
            handleClick: () => updateMaterialFilters("Favourite"),
        },
        {
            content: "Fabric",
            tab: "Fabric",
            handleClick: () => updateMaterialFilters("Fabric"),
            icon: "🧵",
        },
        {
            content: "Metallic",
            tab: "Metal",
            handleClick: () => updateMaterialFilters("Metal"),
            icon: "🪩️",
        },
        {
            content: "Wooden",
            tab: "Wood",
            handleClick: () => updateMaterialFilters("Wood"),
            icon: "🪵",
        },
        {
            content: "Brick",
            tab: "Brick",
            handleClick: () => updateMaterialFilters("Brick"),
            icon: "🧱",
        },
        {
            content: "Concrete",
            tab: "Concrete",
            handleClick: () => updateMaterialFilters("Concrete"),
            icon: "🪨",
        },
    ];

    const searchFilteredMaterials = searchValue === "" ? materials : materials?.filter((item) => item.name.toLowerCase().includes(searchValue.toLowerCase()));

    const tagFilteredMaterials =
        materialFilters.length === 0 || (materialFilters.length === 1 && materialFilters[0] === "Favourite")
            ? searchFilteredMaterials
            : searchFilteredMaterials?.filter((item) => materialFilters?.some((filter) => filter === item.meshtype));

    const filteredMaterials = materialFilters.includes("Favourite") ? tagFilteredMaterials.filter((item) => favourites.includes(item.id)) : tagFilteredMaterials;

    return selectedCard ? (
        <div className={styles.sceneMainContainer}>
            <MaterialPreview />
        </div>
    ) : (
        <>
            <SearchInput handleChange={handleSearchFilter} placeholder="Search a material..." />
            <div className={stopScroll ? styles.containerStopScroll : styles.sceneMainContainer}>
                {/* buttons */}
                <div
                    className={styles.sceneButtons}
                    onWheel={(event) => (event.currentTarget.scrollLeft += event.deltaY)}
                    onMouseOver={() => setStopScroll(true)}
                    onMouseOut={() => setStopScroll(false)}
                >
                    {filterButtonsData.map((item, index) => (
                        <>
                            <button
                                className={materialFilters?.includes(item.tab) ? `${styles.buttonInActive} ${styles.buttonActive}` : styles.buttonInActive}
                                key={index}
                                onClick={item.handleClick}
                            >
                                {item.icon} {item.content}
                            </button>
                            {index === 0 && <div></div>}
                        </>
                    ))}
                </div>
                {/* cards */}
                {isLoading ? (
                    <Shimmer colorsModal />
                ) : isError ? (
                    <div className={styles.noMaterialsDiv}>Oops! Could not load textures.</div>
                ) : filteredMaterials.length === 0 ? (
                    <div className={styles.noMaterialsDiv}>Oops! No materials found.</div>
                ) : (
                    <div className={styles.sceneContainer}>
                        {filteredMaterials?.map((data) => (
                            <div key={data.id} onClick={handleCardClick}>
                                <Card data={data} onClick={() => handleCardData(data)} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default Materials;
