import "@babylonjs/loaders";
import { useEffect, useState } from "react";
import HDRItoImage from "../../../../../../Utils/HDRItoImage";

interface HDRItoImageInterface {
    url: string;
    className: string;
    onClick?: () => void;
}

function HDRIImage({ url, className, onClick }: HDRItoImageInterface) {
    const [imageData, setImageData] = useState<unknown>();

    useEffect(() => {
        HDRItoImage(url).then((data: unknown) => {
            setImageData(data);
        });
    }, [url]);
    return <img src={`${imageData}`} alt="img" className={className} onClick={onClick} />;
}

export default HDRIImage;
