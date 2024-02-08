import { useAtom } from "jotai";
import { ChangeEvent, useState } from "react";
import { handleAmbiencePreviewModal } from "../../../../../../store/store";
import SearchInput from "../../../AssetLibrary/Components/SearchInput/SearchInput";
import styles from "./Ambience.module.css";
import AmbiencePreview from "./AmbiencePreview/AmbiencePreview";
interface Item {
    name: string;
    img: string;
    author: string;
    authImg: string;
    tags: string[];
}
function Ambience() {
    // this is dummy data remove it after fetching from api

    const [selectedCard, setSelectedCard] = useAtom(handleAmbiencePreviewModal);
    const [searchValue, setSearchValue] = useState<string>("");
    const [ambienceFilters, setAmbienceFilters] = useState<string[]>([]);
    const filters = [
        {
            emoji: "🌳",
            name: "Nature",
        },
        {
            emoji: "⛅️",
            name: "Weather",
        },
        {
            emoji: "🏠",
            name: "Indoors",
        },
        {
            emoji: "🔥",
            name: "Popular",
        },
    ];

    const handleCardClick = () => {
        setSelectedCard(true);
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value);

    const handleAmbienceFilters = (filterName: string) => {
        if (ambienceFilters.includes(filterName)) {
            setAmbienceFilters(ambienceFilters.filter((item) => item !== filterName));
        } else {
            setAmbienceFilters([...ambienceFilters, filterName]);
        }
    };

    const sceneData: Item[] = [
        {
            name: "Hex Reactor Nature",
            img: "https://images.unsplash.com/photo-1634893661513-d6d1f579fc63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1828&q=80",
            author: "Alex Duncan",
            authImg: "./photo-2.webp",
            tags: ["Nature"],
        },
        {
            name: "Hex Reactor Weather",
            img: "https://images.unsplash.com/photo-1634893661513-d6d1f579fc63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1828&q=80",
            author: "Alex Duncan",
            authImg: "./photo-2.webp",
            tags: ["Weather"],
        },
        {
            name: "Hex Reactor Indoors",
            img: "https://images.unsplash.com/photo-1634893661513-d6d1f579fc63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1828&q=80",
            author: "Alex Duncan",
            authImg: "./photo-2.webp",
            tags: ["Indoors"],
        },
        {
            name: "Hex Reactor Popular",
            img: "https://images.unsplash.com/photo-1634893661513-d6d1f579fc63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1828&q=80",
            author: "Alex Duncan",
            authImg: "./photo-2.webp",
            tags: ["Popular"],
        },
        {
            name: "Hex Reactor Nature Popular",
            img: "https://images.unsplash.com/photo-1634893661513-d6d1f579fc63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1828&q=80",
            author: "Alex Duncan",
            authImg: "./photo-2.webp",
            tags: ["Nature", "Popular"],
        },
        {
            name: "Hex Reactor Weather Indoors",
            img: "https://images.unsplash.com/photo-1634893661513-d6d1f579fc63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1828&q=80",
            author: "Alex Duncan",
            authImg: "./photo-2.webp",
            tags: ["Weather", "Indoors"],
        },
        {
            name: "Hex Reactor Nature Popular",
            img: "https://images.unsplash.com/photo-1634893661513-d6d1f579fc63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1828&q=80",
            author: "Alex Duncan",
            authImg: "./photo-2.webp",
            tags: ["Nature", "Popular"],
        },
        {
            name: "Hex Reactor Weather",
            img: "https://images.unsplash.com/photo-1634893661513-d6d1f579fc63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1828&q=80",
            author: "Alex Duncan",
            authImg: "./photo-2.webp",
            tags: ["Weather"],
        },
        {
            name: "Hex Reactor Popular",
            img: "https://images.unsplash.com/photo-1634893661513-d6d1f579fc63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1828&q=80",
            author: "Alex Duncan",
            authImg: "./photo-2.webp",
            tags: ["Popular"],
        },
        {
            name: "Hex Reactor Weather",
            img: "https://images.unsplash.com/photo-1634893661513-d6d1f579fc63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1828&q=80",
            author: "Alex Duncan",
            authImg: "./photo-2.webp",
            tags: ["Weather"],
        },
        {
            name: "Hex Reactor Nature",
            img: "https://images.unsplash.com/photo-1634893661513-d6d1f579fc63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1828&q=80",
            author: "Alex Duncan",
            authImg: "./photo-2.webp",
            tags: ["Nature"],
        },
        {
            name: "Hex Reactor Popular",
            img: "https://images.unsplash.com/photo-1634893661513-d6d1f579fc63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1828&q=80",
            author: "Alex Duncan",
            authImg: "./photo-2.webp",
            tags: ["Popular"],
        },
    ];

    const searchFilteredAmbiences = sceneData.filter(({ name }) => name.toLowerCase().startsWith(searchValue.toLowerCase()));

    const tagsFilteredAmbiences = ambienceFilters.length
        ? searchFilteredAmbiences.filter((ambience) => ambienceFilters.some((filter) => ambience.tags.includes(filter)))
        : searchFilteredAmbiences;

    return selectedCard ? (
        <div className={styles.sceneMainContainer}>
            <AmbiencePreview />
        </div>
    ) : (
        <>
            <SearchInput placeholder="Eg. Sunset, rainy day, etc." value={searchValue} handleChange={handleSearchChange} autoFocus={true} />
            <div className={styles.sceneMainContainer}>
                {/* buttons */}
                <div className={styles.sceneButtons}>
                    {filters.map(({ emoji, name }) => (
                        <button
                            key={name}
                            value={name}
                            className={ambienceFilters.includes(name) ? `${styles.selectedSceneButton} ${styles.sceneButton}` : styles.sceneButton}
                            onClick={() => handleAmbienceFilters(name)}
                        >
                            {emoji} {name}
                        </button>
                    ))}
                </div>
                {/* scene cards */}
                {tagsFilteredAmbiences.length ? (
                    <div className={styles.sceneContainer}>
                        {tagsFilteredAmbiences.map((data, index) => (
                            // This will be replaced by the Card component.
                            <div key={index} className={styles.scene} onClick={handleCardClick}>
                                <img src={data.img} alt="" className={styles.sceneImg} />
                                <div className={styles.sceneInfo}>
                                    <h1>
                                        {data.name.substring(0, 15)}
                                        {data.name.length >= 16 ? "..." : ""}
                                    </h1>
                                    <img src="./TopPart/favDark.svg" alt="" className={styles.fav} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.noAmbienceTemplatesDiv}>No ambiences found!</div>
                )}
            </div>
        </>
    );
}

export default Ambience;
