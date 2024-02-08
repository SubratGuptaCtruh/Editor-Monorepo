import { ImagesModeSvg } from "../../../RightPart/components/Icon/Icon";
import { HangoutVideoIcon, MusicIcons, ThreeDShapes, VRIcons } from "../Icons/Icons";

export interface Item {
    icons: JSX.Element;
    heading: string;
    subHeading: string;
    accepts: string;
}
export const inputCards: Item[] = [
    {
        icons: <ThreeDShapes />,
        heading: "3D Model",
        subHeading: ".glb",
        accepts: ".glb",
    },
    {
        icons: <VRIcons />,
        heading: "360° Background",
        subHeading: ".hdr",
        accepts: ".hdr",
    },
    {
        icons: <MusicIcons />,
        heading: "Audio File",
        subHeading: ".mp3, .wav, .ogg",
        accepts: ".mp3,.wav,.ogg",
    },
    // {
    //     icons: <VectorIcons />,
    //     heading: "Vector Shape",
    //     subHeading: ".svg",
    //     accepts: ".svg",
    // },
    {
        icons: <ImagesModeSvg />,
        heading: "Image as Screen",
        subHeading: ".jpg, .png",
        accepts: ".jpg,.png",
    },
    {
        icons: <HangoutVideoIcon />,
        heading: "Video as Screen",
        subHeading: ".mp4, .mov",
        accepts: ".mp4,.mov",
    },
];
