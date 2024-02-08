import { FileItem } from "../../../store/store";
import { FavouriteIconOff, FavouriteIconOn } from "./Icons";
import styles from "./SceneCard.module.css";

// Props type
interface ChildProps {
    item: FileItem;
    handleFavourites?: () => void;
    handleRemoveFavourites?: () => void;
    favourites?: string[];
    onClick?: () => void;
    handleSetPreview?: () => void;
}

const SceneCard: React.FC<ChildProps> = ({ item, handleFavourites, favourites, handleRemoveFavourites, onClick, handleSetPreview }) => {
    return (
        <div className={styles.scene} onClick={onClick}>
            <img src={item.corr2DImageUrl} alt={item.filename} className={styles.sceneImg} onClick={handleSetPreview} />

            <div className={styles.sceneInfo}>
                <h1>{item.filename}</h1>
                {favourites?.includes(item.id) ? (
                    <div onClick={handleRemoveFavourites}>
                        <FavouriteIconOn className={styles.fav} />
                    </div>
                ) : (
                    <div onClick={handleFavourites}>
                        <FavouriteIconOff className={styles.fav} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SceneCard;
