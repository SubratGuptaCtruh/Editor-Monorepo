import { useEffect, useState } from "react";
import styles from "./SliderWithInput.module.css";

interface SliderWithInputTypes {
    min: number;
    max: number;
    initialValue?: number;
    onChange?: (value: number) => void;
    steps?: number;
    onComplete?: (value: number) => void;
    onStart?: (value: number) => void;
    sliderEnabled?: boolean;
    context?: string;
}

function SliderWithInput({ min, max, onChange, steps, onComplete, onStart, initialValue, sliderEnabled, context }: SliderWithInputTypes) {
    const [value, setValue] = useState<number>(initialValue ? initialValue : context === "initialValueZero" ? 0 : (max + min) / 2);
    const [sliderPosition, setSliderPosition] = useState<number>(context === "spring" ? 0 : initialValue ? initialValue : context === "initialValueZero" ? 0 : (max + min) / 2);
    const [finalValue, setFinalValue] = useState<number>(initialValue ? initialValue : 0);
    useEffect(() => {
        setValue(initialValue ? initialValue : context === "initialValueZero" ? 0 : (max + min) / 2);
        context !== "spring" && setSliderPosition(context === "spring" ? 0 : initialValue ? initialValue : context === "initialValueZero" ? 0 : (max + min) / 2);
    }, [initialValue, max, min, context]);

    const handleMouseUp = (event: React.MouseEvent<HTMLInputElement>) => {
        // This captures the value when the user ends dragging.

        setFinalValue(Number(event.currentTarget.value) + finalValue);
        if (context === "spring") {
            onComplete && onComplete(Number(event.currentTarget.value) + finalValue);
        } else {
            onComplete && onComplete(Number(event.currentTarget.value));
        }

        if (context === "spring") {
            setSliderPosition(Number(0));
        }
    };
    const handleMouseDown = (event: React.MouseEvent<HTMLInputElement>) => {
        // This captures the value when the user ends dragging.
        onStart && onStart(Number(event.currentTarget.value));
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // // Updates the state every time the value changes.
        const newValue = Number(event.currentTarget.value);
        if (context === "spring") {
            onChange && onChange(newValue + finalValue);
            setValue(newValue + finalValue);
            setSliderPosition(Number(newValue));
        } else {
            onChange && onChange(newValue);
            setValue(newValue);
            setSliderPosition(Number(newValue));
        }
    };
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // // Updates the state every time the value changes.
        const newValue = Number(event.currentTarget.value);
        onChange && onChange(newValue);
        setValue(newValue);
        setSliderPosition(Number(newValue));
    };
    const handleMouseLeave = (event: React.MouseEvent<HTMLInputElement>) => {
        // // Updates the state every time the mouse leave.

        const newValue = Number(event.currentTarget.value);
        onComplete && onComplete(Number(event.currentTarget.value));
        setValue(newValue);
        setSliderPosition(Number(newValue));
    };
    // const handleDrag = (event: React.MouseEvent<HTMLInputElement>) => {
    //     event.preventDefault();

    //     onStart && onStart(Number(value));
    //     const initialMouseX = event.clientX;

    //     const handleMouseMove = (e: MouseEvent) => {
    //         const diff = initialMouseX - e.clientX;
    //         const newValue = Number(value) + diff;

    //         if (newValue >= min && newValue <= max) {
    //             setValue(newValue);
    //             onChange && onChange(newValue);
    //         } else if (newValue < min) {
    //             setValue(min);
    //         } else {
    //             setValue(max);
    //         }
    //         if (context === "spring") {
    //             setSliderPosition(Number(newValue));
    //         }
    //     };

    //     const handleMouseUp = () => {
    //         document.removeEventListener("mousemove", handleMouseMove);
    //         document.removeEventListener("mouseup", handleMouseUp);
    //     };

    //     document.addEventListener("mousemove", handleMouseMove);
    //     document.addEventListener("mouseup", handleMouseUp);
    // };

    // const handleInputMouseUp = () => {
    //     onComplete && onComplete(Number(value));
    //     if (context === "spring") {
    //         setSliderPosition(0);
    //     }
    // };
    return (
        <>
            {!sliderEnabled ? (
                <div className={styles.sliderContainer}>
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={steps}
                        value={Number(sliderPosition)}
                        onChange={handleChange}
                        onMouseUp={handleMouseUp}
                        onMouseDown={handleMouseDown}
                    />
                    <input
                        type="number"
                        min={min}
                        max={max}
                        value={context === "spring" ? Number(value) : Math.min(Math.max(Number(value), min), max)}
                        onChange={handleInputChange}
                        onMouseLeave={handleMouseLeave}
                    />{" "}
                    {context === "rotation" && <span className={styles.degree}>°</span>}
                    {context === "scale" && <span className={styles.degree}>x</span>}
                </div>
            ) : (
                <div className={styles.sliderGrayContainer}>
                    <input type="range" min={min} max={max} step={steps} value={Number(value)} onChange={handleChange} onMouseUp={handleMouseUp} onMouseDown={handleMouseDown} />
                    <input type="number" min={-50} max={50} value={Number(value)} onChange={handleChange} />
                </div>
            )}
        </>
    );
}

export default SliderWithInput;
