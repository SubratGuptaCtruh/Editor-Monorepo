import styles from "./Button.module.css";

interface ButtonProps {
    content: string;
    type?: "primary" | "secondary"; // Assuming 'type' can be either 'primary' or 'secondary'
    svg?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    size?: "small" | "medium" | "large"; // Assuming 'size' can be one of these options
}

const Button: React.FC<ButtonProps> = ({ content, type = "primary", svg, style, onClick, size = "small" }) => {
    // This will return className according to conditions
    const buttonCss = () => {
        if (type.toLocaleLowerCase() === "primary" && size.toLocaleLowerCase() === "small" && content) {
            return styles.primarySM;
        } else if (type.toLocaleLowerCase() === "primary" && size.toLocaleLowerCase() === "regular" && content) {
            return styles.primaryRegular;
        } else if (type.toLocaleLowerCase() === "secondary" && size.toLocaleLowerCase() === "small" && content) {
            return styles.secondarySM;
        } else if (type.toLocaleLowerCase() === "secondary" && size.toLocaleLowerCase() === "regular" && content) {
            return styles.secondaryRegular;
        } else {
            return styles.primarySmSVG;
        }
    };
    const buttonClassName = buttonCss();
    return (
        <button onClick={onClick} style={style} className={buttonClassName}>
            {svg ? svg : content}
        </button>
    );
};

export default Button;
