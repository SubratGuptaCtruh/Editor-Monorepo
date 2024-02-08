import React, { useEffect, useState } from "react";

interface ProfileProps {
    userName: string;
    size: number;
    onClick?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ userName, size, onClick }) => {
    const initials = userName
        .split(" ")
        .slice(0, 2) // Taking the first two words
        .map((name) => name[0])
        .join("");

    // State to store the background color
    const [backgroundColor, setBackgroundColor] = useState<string>("");

    // Generating a random background color when the component mounts
    useEffect(() => {
        // Array of background colors
        const colors = ["#3498db", "#34495e", "#e74c3c", "#880000", "#27ae60", "#f1c40f", "#9b59b6", "#2ecc71", "#e67e22", "#1abc9c", "#95a5a6"];
        const randomIndex = Math.floor(Math.random() * colors.length);
        const randomColor = colors[randomIndex];
        setBackgroundColor(randomColor);
    }, []);

    const style = {
        width: size + "px",
        height: size + "px",
        backgroundColor: backgroundColor,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FFFFFF",
        fontSize: size / 2 + "px",
        fontFamily: "Rubik",
    };

    return (
        <div style={style} onClick={onClick}>
            {initials}
        </div>
    );
};

export default Profile;
