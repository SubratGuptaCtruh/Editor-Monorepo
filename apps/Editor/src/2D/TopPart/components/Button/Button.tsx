import React, { useCallback } from "react";
import styles from "./Button.module.css";

interface ButtonProps {
    icon: JSX.Element | null;
    content: string;
    onClick?: () => void;
    style?: React.CSSProperties;
    hoverStyle?: boolean;
}

const Button = ({ icon, content, style = {}, onClick, hoverStyle = true }: ButtonProps) => {
    const handleClick = useCallback(() => {
        if (onClick) {
            onClick();
        }
    }, [onClick]);

    const classes = `${styles.buttonContainer} ${styles.default}`;

    return (
        <div
            className={hoverStyle ? classes : styles.buttonContainer}
            style={{ ...style, cursor: onClick ? "pointer" : "default" }}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            aria-label={content}
        >
            {icon}
            <p>{content}</p>
        </div>
    );
};

export default Button;
