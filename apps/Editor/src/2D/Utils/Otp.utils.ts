import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useEffect, useRef } from "react";
import { auth } from "../Firebase/config";

// Function to set up recaptha
export const setUpRecaptcha = (number: string) => {
    if (typeof window !== "undefined") {
        // Define appVerifier with the correct type
        const appVerifier: RecaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {});
        return signInWithPhoneNumber(auth, number, appVerifier);
    }
};

export default function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef<() => void>();

    // Remember the latest callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Setup interval
    useEffect(() => {
        function tick() {
            if (typeof savedCallback.current === "function") {
                savedCallback.current();
            }
        }
        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}
