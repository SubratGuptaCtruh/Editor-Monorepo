import { useState } from "react";
import toast from "react-hot-toast";
import { MeshType } from "../../../3D/EditorLogic/editor";
import { useOutsideClick } from "../../Hooks/useOutsideClick";
import { FilterIcon } from "./Icons";
import styles from "./MultiSelect.module.css";

interface SelectType {
    label: string;
    values: MeshType[];
    checked: boolean;
}

interface MultiSelectProps {
    data: SelectType[];
    onChange: (data: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ onChange, data }) => {
    const [options, setOptions] = useState(data);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const ref = useOutsideClick(() => {
        setIsDropdownOpen(false);
    });

    const selectedOptions = options.filter((option) => option.checked);

    return (
        <div ref={ref} className={`${styles.dropdown} ${isDropdownOpen ? styles.open : ""}`} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <div className={styles.selectedOptions}>
                <FilterIcon /> <span>{selectedOptions.length === data.length ? "All Assets Visible" : selectedOptions.map(({ label }) => label).join(", ")}</span>
            </div>
            <div className={styles.dropdownMenu}>
                {options.map((option, index) => (
                    <div className={styles.option} key={option.label}>
                        <label key={index}>
                            <input
                                type="checkbox"
                                checked={option.checked}
                                // onClick={(e) => e.stopPropagation()} // Prevent the checkbox click from closing the dropdown
                                onChange={() => {
                                    if (selectedOptions.length === 1 && selectedOptions[0].label === option.label) {
                                        toast.error("Minimum 1 selection required", {
                                            icon: "⚠️",
                                        });
                                        setIsDropdownOpen(true);
                                    } else {
                                        const updatedOptions = options.map((opt) => (opt.label === option.label ? { ...opt, checked: !opt.checked } : opt));
                                        setOptions(updatedOptions);
                                        onChange(updatedOptions.flatMap((opt) => opt.values.filter(() => opt.checked).map((val) => val)));
                                        // setIsDropdownOpen(false);
                                    }
                                }}
                            />
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MultiSelect;
