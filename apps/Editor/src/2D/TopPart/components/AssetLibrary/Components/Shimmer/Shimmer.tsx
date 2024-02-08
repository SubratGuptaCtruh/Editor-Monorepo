import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import styles from "./Shimmer.module.css";

interface ShimmerProps {
    uploadsModal?: boolean;
    colorsModal?: boolean;
}

const ShimmerCard: React.FC<ShimmerProps> = ({ uploadsModal, colorsModal }) => {
    return (
        <div className={styles.shimmerCard} style={{ height: colorsModal ? "180px" : "" }}>
            <div className={styles.shimmerImage} style={{ height: colorsModal ? "130px" : "" }}>
                <Skeleton />
            </div>
            <div className={styles.shimmerInfo}>
                <div className={styles.shimmerHeading}>
                    <Skeleton />
                </div>
                {!uploadsModal && !colorsModal && (
                    <div className={styles.shimmerImageText}>
                        <div className={styles.shimmerRoundImage}>
                            <Skeleton circle={true} />
                        </div>
                        <div className={styles.shimmerText}>
                            <Skeleton />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const Shimmer: React.FC<ShimmerProps> = ({ uploadsModal, colorsModal }) => {
    return (
        <div className={styles.shimmerContainer} style={{ height: uploadsModal ? "" : "250px" }}>
            {Array.from({ length: uploadsModal || colorsModal ? 4 : 2 }).map((_e, i) => (
                <ShimmerCard uploadsModal={uploadsModal} colorsModal={colorsModal} key={i} />
            ))}
        </div>
    );
};
