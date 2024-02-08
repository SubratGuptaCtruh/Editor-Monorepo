import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { previewScreenAtom } from "../../../../../../../store/store";
import { PauseIcon, PlayIcon } from "../../../../Icons/Icons";
import styles from "./AudioCard.module.css";

const useAudio = (url: string) => {
    const [audio] = useState(new Audio(url));
    const [playing, setPlaying] = useState(false);
    const toggle = () => setPlaying(!playing);

    useEffect(() => {
        playing ? audio.play() : audio.pause();
    }, [playing, audio]);

    useEffect(() => {
        const handleEnded = () => setPlaying(false);
        audio.addEventListener("ended", handleEnded);
        return () => {
            audio.removeEventListener("ended", handleEnded);
        };
    }, [audio, setPlaying]);

    return [playing, toggle] as const;
};

interface AudioInterface {
    url: string;
    className?: string;
    onClick?: () => void;
}

function AudioCard({ url, className, onClick }: AudioInterface) {
    const [playing, toggle] = useAudio(url);
    const previewScreen = useAtomValue(previewScreenAtom);
    return (
        <div className={styles.cardAudioContainer}>
            {previewScreen && (
                <div className={styles.playPauseContainer} onClick={() => toggle()}>
                    {playing ? <PauseIcon /> : <PlayIcon />}
                </div>
            )}

            <img src="./audioPlaceholder.png" alt="" className={className || styles.audioCardImage} onClick={onClick} />
        </div>
    );
}

export default AudioCard;
