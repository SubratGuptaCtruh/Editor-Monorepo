import React, { useMemo } from "react";
import styles from "./OtpInput.module.css";

type Props = {
    value: string;
    valueLength: number;
    onChange: (value: string) => void;
};

export default function OtpInput({ value, valueLength, onChange }: Props) {
    const focusToNextInput = (target: HTMLElement) => {
        const nextElementSibling = target.nextElementSibling as HTMLInputElement | null;

        if (nextElementSibling) {
            nextElementSibling.focus();
        }
    };
    const focusToPrevInput = (target: HTMLElement) => {
        const previousElementSibling = target.previousElementSibling as HTMLInputElement | null;

        if (previousElementSibling) {
            previousElementSibling.focus();
        }
    };
    const valueItems = useMemo(() => {
        const RE_DIGIT = new RegExp(/^\d+$/);
        const valueArray = value.split("");
        const items: Array<string> = [];

        for (let i = 0; i < valueLength; i++) {
            const char = valueArray[i];

            if (RE_DIGIT.test(char)) {
                items.push(char);
            } else {
                items.push("");
            }
        }

        return items;
    }, [value, valueLength]);

    const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const target = e.target;
        let targetValue = target.value.trim();
        const RE_DIGIT = new RegExp(/^\d+$/);
        const isTargetValueDigit = RE_DIGIT.test(targetValue);

        if (!isTargetValueDigit && targetValue !== "") {
            return;
        }
        const nextInputEl = target.nextElementSibling as HTMLInputElement | null;
        if (!isTargetValueDigit && nextInputEl && nextInputEl.value !== "") {
            return;
        }
        targetValue = isTargetValueDigit ? targetValue : " ";

        const targetValueLength = targetValue.length;

        if (targetValueLength === 1) {
            const newValue = value.substring(0, idx) + targetValue + value.substring(idx + 1);

            onChange(newValue);

            if (!isTargetValueDigit) {
                return;
            }

            const nextElementSibling = target.nextElementSibling as HTMLInputElement | null;

            if (nextElementSibling) {
                nextElementSibling.focus();
            }
        } else if (targetValueLength === valueLength) {
            onChange(targetValue);

            target.blur();
        }
    };
    const inputOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { key } = e;
        const target = e.target as HTMLInputElement;
        if (key === "ArrowRight" || key === "ArrowDown") {
            e.preventDefault();
            return focusToNextInput(target);
        }

        if (key === "ArrowLeft" || key === "ArrowUp") {
            e.preventDefault();
            return focusToPrevInput(target);
        }
        const targetValue = target.value;
        target.setSelectionRange(0, targetValue.length);
        if (e.key !== "Backspace" || target.value !== "") {
            return;
        }

        const previousElementSibling = target.previousElementSibling as HTMLInputElement | null;

        if (previousElementSibling) {
            previousElementSibling.focus();
        }
    };
    const inputOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        const { target } = e;
        const prevInputEl = target.previousElementSibling as HTMLInputElement | null;

        if (prevInputEl && prevInputEl.value === "") {
            return prevInputEl.focus();
        }

        target.setSelectionRange(0, target.value.length);
    };

    return (
        <div className={styles.otpgroup}>
            {valueItems.map((digit, idx) => (
                <input
                    key={idx}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{1}"
                    maxLength={1}
                    className={styles.otpinput}
                    value={digit}
                    onChange={(e) => inputOnChange(e, idx)}
                    onKeyDown={inputOnKeyDown}
                    onFocus={inputOnFocus}
                />
            ))}
        </div>
    );
}
