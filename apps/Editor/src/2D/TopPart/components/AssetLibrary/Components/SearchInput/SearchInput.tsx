import { ChangeEvent, KeyboardEvent } from "react";
import { SearchIcons } from "../../../Icons/Icons";
import styles from "./SearchInput.module.css";

// Props type
interface ChildProps {
    handleChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    isLoading?: boolean;
    isError?: boolean;
    value?: string;
    handleEnterKey?: (event: KeyboardEvent<HTMLInputElement>) => void;
    autoFocus?: boolean;
}

const SearchInput: React.FC<ChildProps> = ({ isError, isLoading, handleChange, placeholder = "Search for an asset...", value, handleEnterKey, autoFocus = false }) => {
    return (
        !isError &&
        !isLoading && (
            <div className={styles.modalSearch}>
                <SearchIcons />
                <input value={value} onChange={handleChange} type="text" placeholder={placeholder} onKeyDown={handleEnterKey} autoFocus={autoFocus} />
            </div>
        )
    );
};

export default SearchInput;
