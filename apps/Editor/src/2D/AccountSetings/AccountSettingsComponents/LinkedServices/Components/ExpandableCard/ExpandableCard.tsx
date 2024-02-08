import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../../../Components/Button/Button";
import { ExpandMore, Expandless } from "../../../icons/icons";
import styles from "./Expandable.module.css";

interface ProjectProps {
    logo?: string;
    Description: string[];
    status: string;
    handleClick?: () => void;
    website?: string;
    subheading: string;
    title: string;
}

const ExpandableCard: React.FC<{ content: ProjectProps }> = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const handleMouseEnter = () => {
        setIsExpanded(true);
    };

    const handleMouseLeave = () => {
        setIsExpanded(false);
    };

    return (
        <div className={`${styles.card} ${isExpanded ? styles.expanded : ""}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <div className={styles.visibleContent}>
                <div className={styles.visibleContentLeft}>
                    <div className={styles.boxicon}>
                        <img width={"100%"} src={content?.logo} alt={content?.title} />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <h5 className={styles.title}>{content.title}</h5>
                        <div className={content.status !== "" ? styles.status : ""}>
                            <div className={content.status === "Connected" ? styles.green : styles.red}>{content.status}</div>
                        </div>
                    </div>
                </div>
                <div>
                    {isExpanded ? (
                        <div className={styles.expand}>
                            <Expandless />
                        </div>
                    ) : (
                        <div className={styles.expand}>
                            <ExpandMore />
                        </div>
                    )}
                </div>
            </div>
            <div className={`${styles.expandedContent} ${isExpanded ? styles.marginTop : styles.hidden}`}>
                <div className={styles.subtitle}>
                    <div className={styles.description}>{content.subheading}</div>
                    <div className={styles.line}></div>
                </div>
                <ul className={styles.content}>
                    {content.Description.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
                {content.status === "Connected" ? (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button content="Disconnect" onClick={content?.handleClick} type={content.status === "Connected" ? "secondary" : "primary"} />
                        <Link to={content?.website || ""} target="_blank">
                            <Button content="Go to website" />
                        </Link>
                    </div>
                ) : (
                    <Button content="Connect" onClick={content?.handleClick} type={content.status === "Connected" ? "secondary" : "primary"} />
                )}
            </div>
        </div>
    );
};

export default ExpandableCard;
