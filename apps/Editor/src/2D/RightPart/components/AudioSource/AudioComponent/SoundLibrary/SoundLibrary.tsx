import { useState } from "react";
import Audio from "../../../../../TopPart/components/AssetLibrary/Components/Audio/Audio";
import { MusicNoteSvgIcon } from "../../../Icon/Icon";
import styles from "./SoundLibrary.module.css";

interface SoundLibraryProps {
    assetModalClose: () => void;
}

const SoundLibrary: React.FC<SoundLibraryProps> = ({ assetModalClose }) => {
    const [selectedTab, setSelectedTab] = useState(1);

    const action = (index: number) => {
        setSelectedTab(index);
    };

    return (
        <div className={styles.soundMainContainer}>
            <div className={styles.modalInnerHeader}>
                <div className={styles.modalInnerHeaderTitle}>
                    <MusicNoteSvgIcon />
                    <h4>Sound Library</h4>
                </div>
                <div className={styles.headerToggleContainer}>
                    <div className={styles.headerToggle}>
                        <div className={selectedTab === 1 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`} onClick={() => action(1)}>
                            Presets
                        </div>
                        <div className={selectedTab === 2 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`} onClick={() => action(2)}>
                            Uploaded
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.selectionInfo}>Click on the desired audio file to select it.</div>
            <div className={styles.modalInnerContainer}>
                {selectedTab === 1 ? (
                    <div className={styles.audioModal}>
                        <Audio headerSelected="presets" inputPlaceholder="Search for a sound..." soundLibraryModal actionButtonType="Favourite" assetModalClose={assetModalClose} />
                    </div>
                ) : (
                    <div className={styles.audioModal}>
                        <Audio headerSelected="uploaded" inputPlaceholder="Search for a sound..." soundLibraryModal actionButtonType="Delete" assetModalClose={assetModalClose} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SoundLibrary;
