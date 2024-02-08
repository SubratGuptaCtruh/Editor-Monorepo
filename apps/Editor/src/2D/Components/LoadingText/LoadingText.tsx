import { useEffect, useState } from "react";

const LoadingText = () => {
    const [dots, setDots] = useState<string>("");

    useEffect(() => {
        const interval = setInterval(() => {
            // Update the dots in sequence
            setDots((prevDots) => {
                if (prevDots === "...") {
                    return "";
                } else {
                    return prevDots + ".";
                }
            });
        }, 500); // Interval

        return () => {
            clearInterval(interval); // Cleanup
        };
    }, []);

    return <>Loading{dots}</>;
};

export default LoadingText;
