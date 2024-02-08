import { DeleteSvgIcon } from "../../../../../../../../RightPart/components/Icon/Icon";
import styles from "./ModelCard.module.css";

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

// Props type
interface ChildProps {
    data: Model;
    onClick?: () => void;
    handleDelete?: () => void;
    isDeleteButton?: boolean;
    deleteButtonStyle?: React.CSSProperties;
    style?: React.CSSProperties;
}
const ModelCard: React.FC<ChildProps> = ({ data, onClick, isDeleteButton = false, deleteButtonStyle, handleDelete, style }) => {
    return (
        <div style={style} onClick={onClick} className={styles.card}>
            <img src={data?.thumbnails?.images[3]?.url || data?.corr2DImageUrl} alt={data?.name || data?.filename} className={styles.cardImage} />
            <div className={styles.cardInfo}>
                <h1>{data?.name || data?.filename}</h1>
                {isDeleteButton && (
                    <button style={deleteButtonStyle} onClick={handleDelete}>
                        <DeleteSvgIcon />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ModelCard;
