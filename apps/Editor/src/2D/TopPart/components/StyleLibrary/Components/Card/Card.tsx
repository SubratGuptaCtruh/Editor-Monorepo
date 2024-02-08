import { useAtom } from "jotai";
import { useState } from "react";
import toast from "react-hot-toast";
import { UserObject, userDetails } from "../../../../../../store/store";
import { addToFavorites, removeFromFavorites } from "../../../../../APIs/actions";
import { FavouriteIconOff, FavouriteIconOn } from "../../../../../Components/SceneCard/Icons";
import styles from "./Card.module.css";

interface MeshType {
    id: string;
    meshtype: string;
    name: string;
    screenShot: string;
    texture: string;
}

interface ChildProps {
    data: MeshType;
    onClick: () => void;
}

const Card: React.FC<ChildProps> = ({ data, onClick }) => {
    const [userInfo, setUserInfo] = useAtom(userDetails);
    const [favourites, setFavourites] = useState<string[]>(userInfo?.User?.favorites);
    const [isExecuting, setIsExecuting] = useState<boolean>(false);

    const handleFavourites = async (id: string, userDetails: UserObject["User"], favourites: string[]) => {
        if (!isExecuting) {
            setIsExecuting(true);
            const { data, status } = await addToFavorites(id, userDetails, favourites);
            if (status === 200) {
                const User = data;
                const newData = { ...userInfo, User };
                setUserInfo(newData);
                setFavourites(data?.favorites);
                setIsExecuting(false);
            } else {
                setIsExecuting(false);
                throw new Error("Could not be removed.");
            }
        }
    };

    const handleRemoveFavourites = async (id: string, userDetails: UserObject["User"], favourites: string[]) => {
        if (!isExecuting) {
            setIsExecuting(true);
            const updatedFavorites = favourites?.filter((elem) => elem !== id);
            userDetails.favorites = updatedFavorites;
            const { data, status } = await removeFromFavorites(id, updatedFavorites, userDetails);
            if (status === 200) {
                const User = data;
                const newData = { ...userInfo, User };
                setUserInfo(newData);
                localStorage.setItem("User", JSON.stringify(data));
                setFavourites(data?.favorites);
                setIsExecuting(false);
            } else {
                setIsExecuting(false);
                throw new Error("Could not be removed.");
            }
        }
    };

    const handleFavIconClick = (data: MeshType) =>
        favourites?.includes(data.id)
            ? toast.promise(handleRemoveFavourites(data.id, userInfo?.User, favourites), {
                  loading: "Removing...",
                  success: "Removed from favourites.",
                  error: "Could not removed.",
              })
            : toast.promise(handleFavourites(data.id, userInfo?.User, favourites), {
                  loading: "Adding...",
                  success: "Added to favourites.",
                  error: "Could not be added.",
              });

    return (
        <div className={styles.card} onClick={onClick}>
            <img src={data.screenShot} alt={data.name} className={styles.cardImage} />
            <div className={styles.cardInfo}>
                <h1>{data.name}</h1>
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        handleFavIconClick(data);
                    }}
                >
                    {favourites?.includes(data.id) ? <FavouriteIconOn className={styles.favIcon} /> : <FavouriteIconOff className={styles.favIcon} />}
                </div>
            </div>
        </div>
    );
};

export default Card;
