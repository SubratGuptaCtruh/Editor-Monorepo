import styles from "./Toggle.module.css";
interface SliderTypes {
    initialValue?: boolean;
    onChange?: (event: boolean) => void;
    disabled?: boolean;
    value?: boolean;
}

function Toggle({ initialValue, onChange, value }: SliderTypes) {
    return (
        <label className={styles.toggle_switch}>
            <input type="checkbox" defaultChecked={initialValue} checked={value} onChange={(e) => onChange && onChange(e.target.checked)} />
            <span className={styles.switch} />
        </label>
    );
}
export default Toggle;
