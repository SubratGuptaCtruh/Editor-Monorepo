import { CSSProperties, ReactNode, useEffect, useRef } from "react";
import styles from "./Model.module.css";

interface FullName {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    style?: CSSProperties;
    assetLibrary?: boolean;
    closeIcon?: boolean;
}

function Modal({ isOpen, onClose, children, style, assetLibrary = false, closeIcon = true }: FullName) {
    const modalRef = useRef<HTMLDivElement | null>(null);

    // Handle closing of modal on click outside and on pressing escape key
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        // Close modal on click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = "hidden"; // Disable background scroll
            document.addEventListener("keydown", handleEsc);
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.body.style.overflow = ""; // Enable background scroll
            document.removeEventListener("keydown", handleEsc);
            document.removeEventListener("mousedown", handleClickOutside);
        }

        // Cleanup
        return () => {
            document.body.style.overflow = ""; // Make sure to enable scroll on unmount
            document.removeEventListener("keydown", handleEsc);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Return null if modal is not open
    if (!isOpen) return null;
    return (
        <div className={styles.modal_backdrop}>
            <div ref={modalRef} className={`${styles.modal_content} ${!assetLibrary && styles.nonAssetLibraryModalContent}`} style={style}>
                {closeIcon && (
                    <svg onClick={onClose} xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
                        <path d="m249-207-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z" />
                    </svg>
                )}

                {children}
            </div>
        </div>
    );
}

export default Modal;
