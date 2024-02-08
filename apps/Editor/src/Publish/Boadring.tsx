import React from "react";

type BoadringPropsType = {
    setEnter: React.Dispatch<React.SetStateAction<boolean>>;
};

const Boadring = ({ setEnter }: BoadringPropsType) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(111deg, #323232 0%, #011627 100%)",
                width: "100%",
                height: "100%",
                color: "#f7fafc",
                position: "fixed",
                zIndex: "9999",
                top: 0,
                overflow: "hidden",
                pointerEvents: "all",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                }}
            >
                <h1
                    style={{
                        fontSize: "32px",
                        fontStyle: "normal",
                        fontWeight: "400",
                        lineHeight: "40px",
                        fontFamily: "Rubik",
                    }}
                >
                    What Will You Create Today?
                </h1>
                <img
                    style={{
                        width: "96px",
                        height: "96px",
                        marginTop: "30px",
                    }}
                    src="./logo.gif"
                    alt=""
                    width={96}
                    height={96}
                />
                <button
                    style={{
                        fontFamily: "Outfit",
                        lineHeight: "20px",
                        marginTop: "10px",
                        border: "1px solid rgba(247, 250, 252, 0.72)",
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderRadius: "12px",
                        background: "rgba(247, 250, 252, 0.72)",
                        boxShadow: "-2px -2px 4px 0px rgba(254, 254, 254, 0.2), 2px 2px 2px 0px rgba(34, 34, 34, 0.08), 0px 0px 4px 0px rgba(8, 35, 61, 0.05) inset",
                    }}
                    onClick={() => setEnter(true)}
                >
                    Enter
                </button>
            </div>
        </div>
    );
};

export default Boadring;
