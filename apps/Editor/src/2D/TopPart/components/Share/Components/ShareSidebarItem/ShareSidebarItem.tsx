import styles from "./ShareSidebarItem.module.css";

interface SideBarTypes {
    tab: string;
    handleClick: () => void;
    content: string;
    sideBarOptionSelected: string;
    desc: string;
    icons: JSX.Element;
}

const ShareSidebarItem = ({ sideBarOptionSelected, tab, handleClick, content, icons, desc }: SideBarTypes) => {
    return (
        <div className={sideBarOptionSelected === tab ? styles.modalSideBarHeadingActive : styles.modalSideBarHeading} onClick={handleClick}>
            {icons}
            <div className={styles.modaSidebarTitle}>
                <h1>{content}</h1>
                <p>{desc}</p>
            </div>
        </div>
    );
};

export default ShareSidebarItem;
