import { Mesh } from "@babylonjs/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useRef } from "react";
import { editor } from "../../../../3D/EditorLogic/editor";
import { exportItemAtom, exportModalAtom } from "../../../../store/store";
import Button from "../../../Components/Button/Button";
import Dropdown from "../../../Components/DropDown/DropDown";
import { Audio, CameraIcon, DownloadIcons, Light, Shapes } from "../../icons/icons";
import style from "./ExportModal.module.css";

function ExportModal() {
    const exportItemValue = useAtomValue(exportItemAtom);
    const setExportModal = useSetAtom(exportModalAtom);

    const selectedFormat = useRef<"GLTF" | "GLB">("GLB");

    const handleDownload = () => {
        console.log(exportItemValue, "export data");
        setExportModal(false);
        if (!exportItemValue?.meshData) return;
        const mesh = exportItemValue.meshData.ref;
        editor.export({ fileFormat: selectedFormat.current, fileName: (mesh as unknown as Mesh).name, object: mesh as unknown as Mesh });
    };
    return (
        <div className={style.exportMainContainer}>
            <div className={style.exportHeader}>
                <DownloadIcons /> <h1>Export Asset</h1>
            </div>

            <div className={style.exportMainBody}>
                <div className={style.exportInner}>
                    <div className={style.shapeIcon}>
                        <div className={style.shapIconButton}>
                            {exportItemValue?.meshData?.type === "Mesh" ? (
                                <Shapes />
                            ) : exportItemValue?.meshData?.type === "Light" ? (
                                <Light />
                            ) : exportItemValue?.meshData?.type === "Hotspot" ? (
                                <CameraIcon />
                            ) : exportItemValue?.meshData?.type === "SpatialAudio" ? (
                                <Audio />
                            ) : null}{" "}
                            <h1>{exportItemValue?.data}</h1>
                        </div>
                    </div>
                    <div className={style.sliderMainContainer}>
                        <Dropdown
                            style={{ width: "90%", margin: "0" }}
                            name="options"
                            options={[
                                { name: ".GLB (Default)", value: "GLB", defaultValue: true },
                                { name: ".GLTF", value: "GLTF" },
                            ]}
                            onChange={(e) => {
                                selectedFormat.current = e.target.value as "GLTF" | "GLB";
                            }}
                        />
                        <Button content="DOWNLOAD" onClick={handleDownload} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExportModal;
