import React, { useEffect, useRef, useState } from "react";
import styles from "./ColorPicker.module.css";
import { colorConverterService } from "./Component/services/color-converter";

interface HSL {
    hue: number;
    saturation: number;
    lightness: number;
}

interface ColorPickerComponentProps {
    style?: React.CSSProperties;
    onComplete: (color: string) => void;
    onChange: (color: string) => void;
    onStart: (color: string) => void;
    value?: string;
}

export default function ColorPicker(props: ColorPickerComponentProps) {
    const hueRef = useRef<HTMLDivElement | null>(null);
    const saturationRef = useRef<HTMLDivElement | null>(null);
    const hueSelectorRef = useRef<HTMLDivElement | null>(null);
    const saturationSelectorRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null); // Added null type for inputRef
    const isDown = useRef<boolean>(false);
    const optionActive = useRef<"saturation" | "hue" | undefined>(undefined);
    const mousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const MAX_HUE = 360;
    const [onStartHex, setOnStartHex] = useState("#000000");

    const hslColor = useRef<HSL>({
        hue: 0,
        saturation: 0,
        lightness: 0,
    });

    const calculateHslFromCoordinates = (x: number, y: number): void => {
        hslColor.current.saturation = x;
        hslColor.current.lightness = (50 * (1 - x / 100) + 50) * (1 - y / 100);
    };

    const handleHueCursorPosition = (e: React.MouseEvent<HTMLDivElement> | MouseEvent): void => {
        if (hueRef.current && hueSelectorRef.current && saturationRef.current && inputRef.current) {
            const hueRect = hueRef.current.getBoundingClientRect();
            const hueWidth = hueRef.current.offsetWidth - hueSelectorRef.current.offsetWidth;
            const mousePositionX = e.clientX - hueRect.left;

            mousePosition.current = {
                x: mousePositionX >= 0 && mousePositionX <= hueWidth ? mousePositionX : mousePositionX > hueWidth ? hueWidth : 0,
                y: 0, // Set the y property to 0 initially
            };

            hueSelectorRef.current.style.left = mousePosition.current.x + "px";
            const hue = (mousePosition.current.x / hueWidth) * MAX_HUE;
            hslColor.current.hue = hue;
            saturationRef.current.style.background = `hsl(${hue},${100}%,${50}%)`;

            const hex = colorConverterService.hslToHex(hslColor.current.hue, hslColor.current.saturation, hslColor.current.lightness);

            inputRef.current.value = hex.toUpperCase();
            props.onChange(hex);
        }
    };

    const handleSaturationCursorPosition = (e: React.MouseEvent<HTMLDivElement> | MouseEvent): void => {
        if (saturationRef.current && saturationSelectorRef.current && inputRef.current) {
            const saturationRect = saturationRef.current.getBoundingClientRect();
            const [saturationWidth, saturationHeight] = [saturationRef.current.offsetWidth, saturationRef.current.offsetHeight];
            const [mousePositionX, mousePositionY] = [e.clientX - saturationRect.left, e.clientY - saturationRect.top];

            mousePosition.current = {
                x: mousePositionX >= 0 && mousePositionX <= saturationWidth ? mousePositionX : mousePositionX > saturationWidth ? saturationWidth : 0,
                y: mousePositionY >= 0 && mousePositionY <= saturationHeight ? mousePositionY : mousePositionY > saturationHeight ? saturationHeight : 0,
            };

            saturationSelectorRef.current.style.top = mousePosition.current.y + "px";
            saturationSelectorRef.current.style.left = mousePosition.current.x + "px";

            calculateHslFromCoordinates((mousePosition.current.x * 100) / saturationWidth, (mousePosition.current.y * 100) / saturationHeight);

            const hex = colorConverterService.hslToHex(hslColor.current.hue, hslColor.current.saturation, hslColor.current.lightness);
            inputRef.current.value = hex;
            props.onChange(hex);
            setOnStartHex(hex);
        }
    };

    const handleMouseMove = (e: MouseEvent): void => {
        e.preventDefault();

        if (isDown.current) {
            if (optionActive.current === "saturation") {
                handleSaturationCursorPosition(e);
            } else if (optionActive.current === "hue") {
                handleHueCursorPosition(e);
            }
        }
    };

    const handleMouseUp = (): void => {
        isDown.current = false;

        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("mousemove", handleMouseMove);

        optionActive.current = undefined;
        const hex = colorConverterService.hslToHex(hslColor.current.hue, hslColor.current.saturation, hslColor.current.lightness);

        props.onComplete(hex);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement> | MouseEvent, option: "saturation" | "hue"): void => {
        isDown.current = true;
        optionActive.current = option;
        props.onStart(onStartHex);

        if (optionActive.current === "saturation") {
            handleSaturationCursorPosition(e);
        } else if (optionActive.current === "hue") {
            handleHueCursorPosition(e);
        }

        // props.onStart(onStartHex);

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const calculateCoordinatesFromHsl = (h: number, s: number, l: number): void => {
        const x = s;
        const y = -(l / (50 * (1 - s / 100) + 50) - 1) * 100;
        if (saturationRef.current && hueSelectorRef.current && hueRef.current && saturationSelectorRef.current) {
            const [saturationWidth, saturationHeight] = [saturationRef.current.offsetWidth, saturationRef.current.offsetHeight];

            hueSelectorRef.current.style.left = (h * (hueRef.current.offsetWidth - hueSelectorRef.current.offsetWidth)) / MAX_HUE + "px";
            saturationSelectorRef.current.style.top = (y * saturationHeight) / 100 + "px";
            saturationSelectorRef.current.style.left = (x * saturationWidth) / 100 + "px";
        }
    };

    // Function to get the value from input on change of input value
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (inputRef.current) {
            let input = e.target.value.toUpperCase();

            // Ensure that the input starts with '#'
            if (!input.startsWith("#")) {
                input = "#" + input;
            }

            // Validate if the input is a valid hex color
            const isValidHex = /^#[0-9A-F]{6}$/i.test(input);
            if (!isValidHex) {
                return; // Don't proceed if the input is not a valid hex color
            }

            const hsl = colorConverterService.hexToHSL(input);

            if (hsl) {
                const rgb = colorConverterService.hexToRGB(input);
                const hsv = colorConverterService.RGBToHSV(rgb.r, rgb.g, rgb.b);

                calculateCoordinatesFromHsl(hsl.h, hsv.s, hsl.l);

                hslColor.current = {
                    hue: hsl.h,
                    saturation: hsl.s,
                    lightness: hsl.l,
                };
                if (saturationRef.current) {
                    saturationRef.current.style.background = `hsl(${hsl.h},${100}%,${50}%)`;
                }
                props.onChange(input);
                setOnStartHex(input);
            }
        }
    };

    // This is used to change the picker position according to the value of palette
    const { value } = props;

    useEffect(() => {
        const changeCoordinates = (colorValue: string) => {
            const hsl = colorConverterService.hexToHSL(colorValue);

            if (hsl) {
                const rgb = colorConverterService.hexToRGB(colorValue);
                const hsv = colorConverterService.RGBToHSV(rgb.r, rgb.g, rgb.b);

                calculateCoordinatesFromHsl(hsl.h, hsv.s, hsl.l);

                hslColor.current = {
                    hue: hsl.h,
                    saturation: hsl.s,
                    lightness: hsl.l,
                };
                if (saturationRef.current) {
                    saturationRef.current.style.background = `hsl(${hsl.h},${100}%,${50}%)`;
                }

                props.onChange(colorValue);
            }
        };

        if (inputRef.current) {
            let inputValue = value ? value : "#000000";

            // Ensure that the input starts with '#'
            if (!inputValue.startsWith("#")) {
                inputValue = "#" + inputValue;
            }

            // Validate if the input is a valid hex color
            const isValidHex = /^#[0-9A-F]{6}$/i.test(inputValue);
            if (!isValidHex) {
                return; // Don't proceed if the input is not a valid hex color
            }

            inputRef.current.value = inputValue;
            changeCoordinates(inputValue);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
        <div style={props.style} className={styles.colorPickerWrapper}>
            <div className={styles.colorPicker}>
                <div ref={saturationRef} className={styles.saturation} onMouseDown={(e) => handleMouseDown(e, "saturation")}>
                    <div className={styles.saturation__white} />
                    <div className={styles.saturation__black} />

                    <span ref={saturationSelectorRef} className={styles.saturation__selector} />
                </div>

                <div className={styles.hueWrapper}>
                    <div ref={hueRef} className={styles.hue} onMouseDown={(e) => handleMouseDown(e, "hue")}>
                        <span ref={hueSelectorRef} className={styles.hue__selector} />
                    </div>
                </div>
            </div>

            <input ref={inputRef} className={styles.input} type="text" maxLength={7} onChange={handleInput} />
        </div>
    );
}
