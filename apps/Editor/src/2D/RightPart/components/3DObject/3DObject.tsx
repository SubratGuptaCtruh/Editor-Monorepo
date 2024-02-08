import { BaseTexture, Color3, PBRMaterial, StandardMaterial, type AbstractMesh } from "@babylonjs/core";
import { useEffect, useState } from "react";
import { SetMaterialCommnand } from "../../../../3D/EditorLogic/commands/SetMaterialCommnand/SetMaterialCommnand";
import { editor } from "../../../../3D/EditorLogic/editor";
import { EditSvg, TextureSvg } from "../Icon/Icon";
import Placement from "../Placement/Placement";
import ColorModal, { ImageStateType } from "./3DComponent/ColorModal/ColorModal";
import TextureModal from "./3DComponent/TextureModal/TextureModal";
import Material from "./3DComponent/material";
import styles from "./3DObject.module.css";
type Props = {
    readonly selected: AbstractMesh;
};
function Object({ selected }: Props) {
    const [selectedTab, seSelectedTab] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false); // Color picker state
    const [selectedImage, setSelectedImage] = useState<ImageStateType>({ url: "", name: "" });
    const [selectedTabColor, seSelectedTabColor] = useState(1);
    const [isMaterialModal, setIsMaterialModal] = useState(false);
    const [selctedObjColor, setSelectedObjColor] = useState<string>("");
    // Function to open color picker
    const oldColor = editor.get.getMaterialOfMesh(selected);

    const openColorPicker = () => {
        setIsModalOpen((prevIsModalOpen) => !prevIsModalOpen);
    };
    const openMaterialPicker = () => {
        setIsMaterialModal((prevIsModalOpen) => !prevIsModalOpen);
    };
    const closeMaterialModal = () => {
        setIsMaterialModal(false);
    };

    const action = (index: number) => {
        seSelectedTab(index);
        console.log(index);
    };
    useEffect(() => {
        if (!(oldColor instanceof BaseTexture)) {
            setSelectedObjColor(selected.metadata.data.colorHex);
        } else {
            setSelectedObjColor("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={styles.mainContainer}>
            <h5 className={styles.topHeading}>3D Object</h5>
            <div className={styles.tabContainer}>
                <div className={styles.tabs}>
                    <div onClick={() => action(1)} className={selectedTab === 1 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <EditSvg />
                        <p className={styles.tabHeading}>TRANSFORM</p>{" "}
                    </div>
                    <div onClick={() => action(2)} className={selectedTab === 2 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <TextureSvg />
                        <p className={styles.tabHeading}>SURFACE</p>
                    </div>
                </div>
                <div className={selectedTab !== 3 ? styles.contents : styles.bodyTab}>
                    <div className={selectedTab === 1 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <Placement />
                    </div>

                    <div className={selectedTab === 2 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        {selected.material &&
                        (selected.material instanceof PBRMaterial || selected.material instanceof StandardMaterial || (selected.material as StandardMaterial).diffuseColor) ? (
                            <Material
                                handleOpenColorPicker={openColorPicker}
                                handleOpenMaterialPicker={openMaterialPicker}
                                selected={selected}
                                selectedObjColor={selctedObjColor}
                                setSelectedObjColor={setSelectedObjColor}
                            />
                        ) : null}
                    </div>
                </div>
                {/* Color picker  */}
                {isModalOpen && (
                    <div className={styles.openSection}>
                        <ColorModal
                            closeModal={() => setIsModalOpen(false)}
                            onChange={(e) => {
                                editor.update.color(selected, Color3.FromHexString(e));
                                (selected.material as StandardMaterial).diffuseTexture = null;
                                selected.metadata.data.textureUrl = null;
                                setSelectedObjColor(e);
                            }}
                            onComplete={(hexstring) => {
                                editor.executer(new SetMaterialCommnand(editor, selected, Color3.FromHexString(hexstring), null, oldColor ?? new Color3(1, 1, 1)));
                                setSelectedObjColor(hexstring);
                            }}
                            onStart={() => {
                                setSelectedObjColor("");
                                // diffuseColor Color3.FromHexString(e);
                            }}
                            value={selctedObjColor}
                            selectedTab={selectedTabColor}
                            setSelectedTab={seSelectedTabColor}
                            selectedImage={selectedImage}
                            setSelectedImage={(image) => {
                                setSelectedImage(image);
                                return image;
                            }}
                        />
                    </div>
                )}
                {isMaterialModal && (
                    <div className={styles.openTextureSection}>
                        <TextureModal closeMaterialModal={closeMaterialModal} setSelectedObjColor={setSelectedObjColor} />
                    </div>
                )}
            </div>
        </div>
    );
}
export default Object;
