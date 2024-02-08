import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./DropDown.module.css";
interface Option {
    name: string;
    value: string;
    defaultValue?: boolean;
}

interface DropdownProps {
    name: string;
    icon?: JSX.Element;
    options: Option[];
    style?: React.CSSProperties;
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

const Dropdown: React.FC<DropdownProps> = ({ name, options, style, onChange, icon }) => {
    const optList = useRef<HTMLUListElement>(null);
    const selectElement = useRef<HTMLSelectElement>(null);
    const [isActive, setIsActive] = useState(false);
    const defaultIndex = options.findIndex((option) => option.defaultValue) ?? 0;
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

    const onOptionHover: React.MouseEventHandler<HTMLLIElement> = (e) => {
        const index = Array.from(optList.current?.children ?? []).findIndex((el) => el === e.currentTarget);
        setHighlightedIndex(index);
    };

    const onOptionClick: React.MouseEventHandler<HTMLLIElement> = (e) => {
        const index = Array.from(optList.current?.children ?? []).findIndex((el) => el === e.currentTarget);
        setSelectedIndex(index);
        setIsActive(false);
    };

    let isMouseDown = false;
    const onDropdownMouseDown: React.MouseEventHandler<HTMLDivElement> = () => {
        isMouseDown = true;
    };

    const onDropdownMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
        isMouseDown = false;
    };

    const onDropdownFocus: React.FocusEventHandler<HTMLDivElement> = () => {
        if (isMouseDown) return;
        setIsActive(true);
    };

    const onDropdownBlur: React.FocusEventHandler<HTMLDivElement> = () => {
        setIsActive(false);
    };

    const onDropdownClick: React.MouseEventHandler<HTMLDivElement> = () => {
        setIsActive(!isActive);
    };

    const onDropdownKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
        if (!e.key) return;
        if (e.key === "Escape") {
            setIsActive(false);
        }
        if (e.key === "Enter") {
            if (isActive) {
                setSelectedIndex(highlightedIndex);
            }
            setIsActive(!isActive);
        }
        if (e.key === "ArrowUp") {
            if (highlightedIndex === 0) return;
            moveScrollbarToOption(highlightedIndex - 1);
            setHighlightedIndex(highlightedIndex - 1);
        }
        if (e.key === "ArrowDown") {
            if (highlightedIndex === options.length - 1) return;
            moveScrollbarToOption(highlightedIndex + 1);
            setHighlightedIndex(highlightedIndex + 1);
        }
    };

    const getSelectedOptionValue = () => {
        return options[selectedIndex]?.value ?? options[selectedIndex]?.name;
    };

    const getSelectedOptionText = () => {
        return options[selectedIndex]?.name ?? "";
    };

    const moveScrollbarToOption = (index: number) => {
        const element = optList.current?.children[index] as HTMLElement;
        const parentHeight = optList.current?.offsetHeight || 0;
        const optionHeight = element.offsetHeight;
        const topSpacing = Math.min(Math.trunc(parentHeight / optionHeight / 2 - 1), 3);
        const scrollOffset = element.offsetTop - element.offsetHeight * topSpacing;
        optList.current!.scrollTop = scrollOffset;
    };

    useEffect(() => {
        if (selectElement.current) {
            selectElement.current.selectedIndex = selectedIndex;
            const event = new Event("change", { bubbles: true });
            selectElement.current.dispatchEvent(event);
        }
    }, [selectedIndex]);

    const select = useMemo(() => {
        return (
            <select {...(onChange ? { onChange } : {})} name={name} ref={selectElement}>
                {options.map((el, i) => (
                    <option key={i} value={el.value ? el.value : el.name}>
                        {el.name}
                    </option>
                ))}
            </select>
        );
    }, [onChange, name, options]);

    return (
        <div
            onKeyDown={onDropdownKeyDown}
            onMouseUp={onDropdownMouseUp}
            onFocus={onDropdownFocus}
            onBlur={onDropdownBlur}
            onClick={onDropdownClick}
            onMouseDown={onDropdownMouseDown}
            className={`${styles["react-dropdown"]} ${isActive ? styles["active"] : ""}`} // Use dynamic class names
            role="listbox"
            tabIndex={0}
            data-value={getSelectedOptionValue()}
            style={style} // Apply external styles if provided
        >
            <span className={styles["value"]}>
                {" "}
                {icon}
                {getSelectedOptionText()}
            </span>
            <ul ref={optList} className={`${styles["optList"]} ${isActive ? "" : styles["hidden"]}`} role="presentation">
                {options.map((el, i) => (
                    <li
                        key={i}
                        aria-selected={i === selectedIndex}
                        data-value={el.value ? el.value : el.name}
                        onMouseOver={onOptionHover}
                        onClick={onOptionClick}
                        style={{ "--index": i } as React.CSSProperties}
                        className={`${styles["option"]} ${i === highlightedIndex ? styles["highlight"] : ""}`}
                        role="option"
                    >
                        {el.name}
                    </li>
                ))}
            </ul>
            {select}
        </div>
    );
};

export default Dropdown;
