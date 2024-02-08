import styles from "./AccountSettingsSideBarItem.module.css";

interface SideBarTypes {
    tab: string;
    handleClick: () => void;
    content: string;
    sideBarOptionSelected: string;
}

const AccountSettingsSideBarItem = ({ sideBarOptionSelected, tab, handleClick, content }: SideBarTypes) => {
    return (
        <div className={sideBarOptionSelected === tab ? styles.modalSideBarHeadingActive : styles.modalSideBarHeading} onClick={handleClick}>
            {content}
        </div>
    );
};

export default AccountSettingsSideBarItem;
