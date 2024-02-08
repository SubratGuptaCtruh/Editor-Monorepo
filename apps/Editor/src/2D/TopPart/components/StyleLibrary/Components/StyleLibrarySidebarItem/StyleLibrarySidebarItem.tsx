import styles from "./StyleLibrarySidebarItem.module.css";

interface SideBarTypes {
    tab: string;
    handleClick: () => void;
    content: string;
    sideBarOptionSelected: string;
}

const StyleLibrarySidebarItem = ({ sideBarOptionSelected, tab, handleClick, content }: SideBarTypes) => {
    return (
        <div className={sideBarOptionSelected === tab ? styles.modalSideBarHeadingActive : styles.modalSideBarHeading} onClick={handleClick}>
            {content}
        </div>
    );
};

export default StyleLibrarySidebarItem;
