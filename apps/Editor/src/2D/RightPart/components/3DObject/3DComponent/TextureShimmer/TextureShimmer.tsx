import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import styles from "./TextureShimmer.module.css";

const TextureShimmerCard = () => {
    return (
        <div className={styles.shimmerCard}>
            <div className={styles.shimmerRoundImage}>
                <Skeleton circle={true} />
            </div>
            <div className={styles.shimmerText}>
                <Skeleton />
            </div>
        </div>
    );
};

export const TextureShimmer = () => {
    return (
        <div className={styles.shimmerContainer}>
            {Array.from({ length: 4 }).map((_e, i) => (
                <TextureShimmerCard key={i} />
            ))}
        </div>
    );
};
