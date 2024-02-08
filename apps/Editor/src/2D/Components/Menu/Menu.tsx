import { useState } from "react";
import { useOutsideClick } from "../../Hooks/useOutsideClick";
import { ArrowRight } from "../../TopPart/components/Icons/Icons";
import styles from "./Menu.module.css";

interface Children {
    childName: string;
    onClick?: () => void;
}

interface MenuData {
    title: string;
    icons: JSX.Element;
    tab: string;
    children?: Children[];
    text?: string;
    onclick?: () => void;
}

interface Menu {
    onClose: () => void;
    menu: MenuData[];
    right?: boolean;
}

function Menu({ onClose, menu, right }: Menu) {
    const [menuSelected, setMenuSelected] = useState("");
    const ref = useOutsideClick(() => {
        onClose();
    });

    return (
        <div ref={ref} className={`${right && styles.menuMainContainerRight}  ${styles.menuMainContainer}`}>
            <div className={styles.menuInnerContainer}>
                {menu?.map((data, index) => (
                    <div className={styles.menuMain} key={index}>
                        <div
                            className={styles.menuMainInner}
                            onClick={() => (setMenuSelected(data.tab), data.onclick && data.onclick())}
                            onMouseEnter={() => setMenuSelected(data.tab)}
                        >
                            <div className={data.text === "red" ? styles.menuInnerRed : styles.menuInner}>
                                {data.icons} <h4>{data.title}</h4>
                            </div>
                            {data.children && <ArrowRight />}
                            {data.tab === menuSelected && (
                                <div className={styles.childContainer}>
                                    {data.children?.map((child, index) => (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                console.log(child);
                                                child.onClick ? child.onClick() : console.warn(`haven't given on click for ${child.childName}  `);
                                            }}
                                            className={styles.child}
                                        >
                                            {child.childName}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Menu;
