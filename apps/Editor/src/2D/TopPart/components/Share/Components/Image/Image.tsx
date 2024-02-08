import { Nullable, Tools } from "@babylonjs/core";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_GRID_ID } from "../../../../../../3D/EditorLogic/BackgroundSystem";
import { editor } from "../../../../../../3D/EditorLogic/editor";
import { useSecneGraph } from "../../../../../Hooks/useSecneGraph";
import styles from "./Image.module.css";

const includeMask = 0x0fffffff;
const excludeMask = 0x10000000;

function Image() {
    const sceneGraph = useSecneGraph(editor);

    const hotspotCameras = sceneGraph.filter((node) => node.type === "Camera");
    const isCameraInScene = hotspotCameras.length > 0;

    const [inPreview, setInPreview] = useState<Nullable<string>>(null);

    const [previewImage, setPreviewImage] = useState<Nullable<string>>(null);

    const checkedCameras = useRef<{ [key: string]: boolean }>({});

    const includeGrid = useRef(false);
    const includeBackground = useRef(false);

    const generatePreview = (cameraId: string, imgWidth?: number, imgHeight?: number, shouldDownload?: boolean, onComplete?: () => void) => {
        setInPreview(cameraId);
        const hotspot = editor.hotspotSystem.getHotspotById(cameraId);
        if (hotspot) {
            hotspot.animationDuration = 0.1;
            hotspot.zoomCameraHotspot(undefined, undefined, () => {
                hotspot.animationDuration = 2;
                const gridMesh = editor.scene.getMeshById(DEFAULT_GRID_ID) || editor.scene.getMeshByName(DEFAULT_GRID_ID);
                if (!includeGrid.current && gridMesh) {
                    gridMesh.layerMask = excludeMask;
                }
                if (!includeBackground.current) {
                    editor.scene.clearColor.a = 0;
                } else {
                    editor.scene.clearColor.a = 1;
                }

                Tools.CreateScreenshotUsingRenderTarget(
                    editor.scene.getEngine(),
                    editor.scene.activeCamera!,
                    {
                        width: imgWidth || 480,
                        height: imgHeight || 480 / editor.scene.getEngine().getAspectRatio(editor.scene.activeCamera!),
                    },
                    function (imageData) {
                        if (gridMesh) {
                            gridMesh.layerMask = includeMask;
                        }
                        editor.scene.clearColor.a = 1;
                        if (!shouldDownload) {
                            setPreviewImage(imageData);
                        } else {
                            const a = document.createElement("a");
                            a.href = imageData;
                            a.download = "preview.png";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }

                        onComplete && onComplete();
                    }
                );
            });
        }
    };

    useEffect(() => {
        return () => {
            const hotspot = editor.hotspotSystem.currentHotspotInPreveiw;
            if (hotspot) {
                hotspot.animationDuration = 0.1;
                hotspot.panCameraBackToOriginalPosition(undefined, undefined, () => {
                    hotspot.animationDuration = 2;
                });
            }
        };
    }, []);

    const desiredResolution = useRef("1080");

    // editor.scene.clearColor.a = 0

    const recursivePreviewGenerator = (hotspots: [string, boolean][], index: number) => {
        const aspectRatio = editor.scene.getEngine().getAspectRatio(editor.scene.activeCamera!);
        const width = aspectRatio > 1 ? Number(desiredResolution.current) : Number(desiredResolution.current) * aspectRatio;
        const height = aspectRatio > 1 ? Number(desiredResolution.current) / aspectRatio : Number(desiredResolution.current);

        if (index > hotspots.length - 1) {
            return;
        }

        if (!hotspots[index][1]) {
            index++;
            recursivePreviewGenerator(hotspots, index);
        }

        generatePreview(hotspots[index][0], width, height, true, () => {
            index++;
            recursivePreviewGenerator(hotspots, index);
        });
    };

    const download = () => {
        const index = 0;
        const hotspots = Object.entries(checkedCameras.current);
        recursivePreviewGenerator(hotspots, index);
    };

    return (
        <div style={{ pointerEvents: isCameraInScene ? "all" : "none" }} className={styles.ImageMainContainer}>
            <div className={styles.ImageTitle}>
                <h1>XR-ready Link</h1>
                <div className={styles.checkBoxContainer}>
                    <div className={styles.checkBoxInner}>
                        <input
                            onChange={(e) => {
                                if (includeGrid.current !== e.target.checked && inPreview) {
                                    generatePreview(inPreview);
                                }
                                includeGrid.current = e.target.checked;
                            }}
                            type="checkbox"
                            name="includeGrid"
                        />
                        <h5>Include Grid</h5>
                    </div>
                    <div className={styles.checkBoxInner}>
                        <input
                            onChange={(e) => {
                                if (includeBackground.current !== e.target.checked && inPreview) {
                                    generatePreview(inPreview);
                                }
                                includeBackground.current = e.target.checked;
                            }}
                            type="checkbox"
                            name="IncludeBackgroundColor"
                            id=""
                        />
                        <h5>Include Background Colour</h5>
                    </div>
                </div>

                <div className={styles.downloadContianer}>
                    <select
                        onChange={(e) => {
                            desiredResolution.current = e.target.value;
                        }}
                    >
                        <option value="1080">Resolution 1080p </option>
                        <option value="720">Resolution 720p </option>
                        <option value="480">Resolution 480p </option>
                    </select>
                    <button onClick={download}>Download</button>
                </div>

                <div className={styles.exportContainer}>
                    <div className={styles.cameraContainer}>
                        {hotspotCameras.map((camera) => {
                            return (
                                <div key={camera.ref.ref.id} className={styles.camera}>
                                    <input
                                        onChange={(e) => {
                                            checkedCameras.current[e.target.name] = e.target.checked;
                                        }}
                                        type="checkbox"
                                        name={camera.ref.ref.id}
                                    />
                                    <h5
                                        style={{
                                            cursor: "pointer",
                                            color: inPreview === camera.ref.ref.id ? "#457cf8" : "#323232",
                                        }}
                                        onClick={() => {
                                            generatePreview(camera.ref.ref.id);
                                        }}
                                    >
                                        {camera.name}
                                    </h5>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ backgroundImage: previewImage ? `url("${previewImage}")` : "none" }} className={styles.previewContainer}>
                        {!previewImage && <p>Click on a camera to preview it here</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Image;
