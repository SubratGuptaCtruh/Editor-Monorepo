import { MenuPosition } from "../../../store/store";
import { CustomTreeItem } from "../../LeftPart/Components/LeftPartUnEdit/LeftPartUnEdit";
import style from "./ContextMenu.module.css";

interface MenuItem {
    title: string;
    icons: JSX.Element; // Assuming icons can be any ReactNode
    tab: string;
    onclick: (data: CustomTreeItem) => void; // Assuming onclick is a function with no parameters and no return value
}

interface ContextMenuProps {
    menuPosition: MenuPosition;
    clickedData: CustomTreeItem;
    menu: MenuItem[];
}

const ContextMenu: React.FC<ContextMenuProps> = ({ menuPosition, clickedData, menu }) => {
    if (!menuPosition.left) return null; // Return null if menuPosition.left is not defined
    const invalidateExportTypes = ["SpotLight", "PointLight", "DirectionLight", "SpatialAudio", "Camera"]; // excluding objects to get exported
    console.log(clickedData, "clickedData"); // Log statement outside of JSX

    return (
        <div className={style.context_menu} style={menuPosition}>
            {menu
                .filter((data) => !invalidateExportTypes.includes(clickedData.meshData?.type as string) || data.title !== "Export")
                .map((data, index) => (
                    <div
                        key={index}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            data.onclick(clickedData);
                        }}
                        className={style.context_menu_item}
                    >
                        {data.icons} <h1>{data.title}</h1>
                    </div>
                ))}
        </div>
    );
};

export default ContextMenu;
