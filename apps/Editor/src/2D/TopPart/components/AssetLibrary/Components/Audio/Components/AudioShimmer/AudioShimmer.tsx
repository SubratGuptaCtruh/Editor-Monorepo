import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import styles from "./AudioShimmer.module.css";

interface AudioShimmerProps {
    soundLibraryModal?: boolean;
}

const AudioShimmerCard: React.FC<AudioShimmerProps> = ({ soundLibraryModal }) => {
    return (
        <div className={styles.shimmerCard}>
            <div className={styles.leftShimmer}>
                <div className={styles.shimmerImage}>
                    <Skeleton />
                </div>
                <div className={styles.shimmerInfo}>
                    <div>
                        <Skeleton />
                    </div>
                    {soundLibraryModal && (
                        <div>
                            <Skeleton />
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.rightShimmer}>
                <div className={styles.shimmerIcon}>
                    <Skeleton style={{ borderRadius: "8px" }} />
                </div>
                <div className={styles.shimmerIcon}>
                    <Skeleton style={{ borderRadius: "8px" }} />
                </div>
            </div>
        </div>
    );
};

export const AudioShimmer: React.FC<AudioShimmerProps> = ({ soundLibraryModal }) => {
    return (
        <div className={styles.shimmerContainer}>
            {Array.from({ length: soundLibraryModal ? 8 : 6 }).map((_e, i) => (
                <AudioShimmerCard soundLibraryModal={soundLibraryModal} key={i} />
            ))}
        </div>
    );
};
