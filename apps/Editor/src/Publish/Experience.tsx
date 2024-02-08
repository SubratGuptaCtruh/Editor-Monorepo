import { AbstractMesh, Engine, Sound, Vector3 } from "@babylonjs/core";
import { useEffect, useRef, useState } from "react";
import { DataTypes, Item, MeshDataTypes } from "../2D/LeftPart/Components/LeftPartEdit/data";
import { MenuIcon } from "../2D/LeftPart/icons/icons";
import { RestartSvg } from "../2D/RightPart/components/Icon/Icon";
import { CloseIcon } from "../2D/TopPart/components/Icons/Icons";
import { editor } from "../3D/EditorLogic/editor";
import styles from "./Publish.module.css";

type List = { [key: string]: Item };

const filterDataFromDropDown = (types: string[], longTree: DataTypes): List => {
    const filteredDataKey = Object.keys(longTree.items).filter((key) => {
        const item = longTree.items[key];
        return item.meshData && types.includes((item.meshData as MeshDataTypes).type) && key !== "root";
    });

    const filteredData = filteredDataKey.reduce(
        (acc, key: string) => {
            const item = longTree.items[key];
            if (item.isFolder && item.children) {
                const filteredChildren = item.children.filter((childKey: string) => {
                    const childItem = longTree?.items[childKey];
                    if (childItem && childItem.meshData && (childItem.meshData as MeshDataTypes).type) return types.includes((childItem.meshData as MeshDataTypes).type);
                    return false;
                });
                acc[key] = { ...item, children: filteredChildren };
            } else {
                acc[key] = item;
            }
            return acc;
        },
        {} as { [key: string]: Item }
    );

    const isFolderChildren: string[] = [];
    Object.keys(filteredData).forEach((key) => {
        const item = filteredData[key];
        if (item.isFolder && item.children) {
            isFolderChildren.push(...item.children);
        }
    });

    return filteredData;
};

const initialPostionVec = new Vector3(350, 350, 350);

function Experience() {
    const [viewList, setViewList] = useState(false);

    const meshData = filterDataFromDropDown(["Camera"], editor.get.SecenGraphNew() as unknown as DataTypes);
    editor.hotspotSystem.hide();
    editor.selector.enable = false;
    const currentPrewievId = useRef<string | null>(null);

    const initialCameraPosition = useRef<Vector3>(initialPostionVec);

    useEffect(() => {
        editor.isInPublishMode = true;
        initialCameraPosition.current = editor.scene.activeCamera?.position.clone() || initialPostionVec;
        const screenMeshes = filterDataFromDropDown(["Screen"], editor.get.SecenGraphNew() as unknown as DataTypes);

        const lights = filterDataFromDropDown(["DirectionLight", "PointLight", "SpotLight"], editor.get.SecenGraphNew() as unknown as DataTypes);
        const lightArray = Object.values(lights);

        lightArray.forEach((lightData) => {
            const lightHelper = (lightData.meshData as unknown as { ref: AbstractMesh }).ref;
            lightHelper.visibility = 0;
        });

        Object.values(screenMeshes).forEach((screenData) => {
            const screen = (screenData.meshData as unknown as { ref: AbstractMesh }).ref;
            Engine.audioEngine?.audioContext?.resume().then(() => {
                editor.screenLoader.play(screen);
                editor.screenLoader.setLoop(screen, true);
            });
        });

        const spatialAudioMeshes = filterDataFromDropDown(["SpatialAudio"], editor.get.SecenGraphNew() as unknown as DataTypes);

        editor.backGroundSystem?.playAudio();
        editor.backGroundSystem?.toggleLoop(true);

        const audios = Object.values(spatialAudioMeshes).map((data) => {
            const mesh = (data.meshData as unknown as { ref: AbstractMesh })?.ref;

            const audio = new Sound(
                mesh.id,
                mesh.metadata.data.audioUrl,
                editor.scene,
                () => {
                    Engine.audioEngine?.audioContext?.resume().then(() => {
                        audio.play();
                    });
                },
                {
                    loop: true,
                    autoplay: true,
                    volume: mesh.metadata.data.volume || 1,
                    maxDistance: mesh.metadata.data.distance || 5,
                    spatialSound: true,
                    distanceModel: "exponential",
                    rolloffFactor: 2,
                }
            );

            audio.attachToMesh(mesh);
            mesh.setEnabled(false);
            return { audio, mesh };
        });

        return () => {
            editor.isInPublishMode = false;
            editor.selector.enable = true;
            audios.forEach((audioObject) => {
                audioObject.audio.dispose();
                audioObject.mesh.setEnabled(true);
            });
        };
    }, []);

    return (
        <div className={styles.uiLayerMainContainer}>
            <div className={styles.bottomContainer}>
                {!viewList ? (
                    <div style={{ cursor: "pointer" }} className={styles.MenuBottom} onClick={() => setViewList(true)}>
                        <MenuIcon />
                    </div>
                ) : (
                    <div className={styles.lowerMenu}>
                        <div className={styles.Heading}>
                            <h6>Select a Viewpoint</h6>
                            <div onClick={() => setViewList(false)}>
                                <CloseIcon />
                            </div>
                        </div>
                        <div className={styles.ParentView}>
                            <div className={styles.ViewItems}>
                                {Object.keys(meshData)
                                    .filter((meshData) => meshData !== "root")
                                    .map((key) => {
                                        const Camera = meshData[key];
                                        return (
                                            <div
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (!Camera.meshData) throw Error("no  meshdata");
                                                    const id = (Camera.meshData as unknown as { id: string }).id;
                                                    const Hotspot = editor.hotspotSystem.getHotspotById(id);
                                                    if (!Hotspot) throw Error("no Hotspot mesh with id found");
                                                    editor.hotspotSystem.hide();
                                                    Hotspot.zoomCameraHotspot();
                                                    editor.hotspotSystem.hide();

                                                    currentPrewievId.current = id;
                                                }}
                                            >
                                                {Camera.data}
                                            </div>
                                        );
                                    })}
                            </div>
                            <div
                                className={styles.Restart}
                                onClick={() => {
                                    if (currentPrewievId.current) {
                                        const Hotspot = editor.hotspotSystem.getHotspotById(currentPrewievId.current);
                                        if (!Hotspot) throw Error("dh");
                                        const cb = () => {};
                                        Hotspot.panCameraBackToOriginalPosition(cb, cb, cb, initialCameraPosition.current);
                                        Hotspot.hide();
                                    }
                                }}
                            >
                                <RestartSvg />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Experience;
