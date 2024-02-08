import styles from "./AssetLibrarySidebarItem.module.css";

interface SideBarTypes {
    tab: string;
    handleClick: () => void;
    content: string;
    sideBarOptionSelected: string;
}

const AssetLibrarySidebarItem = ({ sideBarOptionSelected, tab, handleClick, content }: SideBarTypes) => {
    return (
        <div className={sideBarOptionSelected === tab ? styles.modalSideBarHeadingActive : styles.modalSideBarHeading} onClick={handleClick}>
            {content}
        </div>
    );
};

export default AssetLibrarySidebarItem;
