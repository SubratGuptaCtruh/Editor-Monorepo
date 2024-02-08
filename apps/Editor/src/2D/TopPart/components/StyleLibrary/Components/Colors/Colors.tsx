import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { handleCustomPalettePreviewModal } from "../../../../../../store/store";
import CustomPalette from "./Components/CustomPalette/CustomPalette";
import PresetsPalette from "./Components/PresetsPalette/PresetsPalette";

interface ColorsProps {
    headerSelected?: string;
    selectedFile?: File | undefined;
}

const Colors: React.FC<ColorsProps> = ({ headerSelected = "preset", selectedFile }) => {
    const setSelectedPalette = useSetAtom(handleCustomPalettePreviewModal);

    // closing custom palette preview page after opening style library
    useEffect(() => {
        setSelectedPalette(false);
    }, [setSelectedPalette]);

    return <>{headerSelected === "preset" ? <PresetsPalette /> : <CustomPalette selectedFile={selectedFile} />}</>;
};

export default Colors;
