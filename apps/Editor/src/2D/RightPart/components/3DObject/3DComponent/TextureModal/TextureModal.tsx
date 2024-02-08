import { Color3, Texture } from "@babylonjs/core";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { SetMaterialCommnand } from "../../../../../../3D/EditorLogic/commands/SetMaterialCommnand/SetMaterialCommnand";
import { editor } from "../../../../../../3D/EditorLogic/editor";
import { selectedMaterialAtom } from "../../../../../../store/store";
import { getAllMeshes } from "../../../../../APIs/actions";
import Dropdown from "../../../../../Components/DropDown/DropDown";
import { useOutsideClick } from "../../../../../Hooks/useOutsideClick";
import { useSelectedState } from "../../../../../Hooks/useSelected";
import styles from "../ColorModal/ColorModal.module.css";
import { TextureShimmer } from "../TextureShimmer/TextureShimmer";
import style from "./TextureModal.module.css";
interface MeshType {
    id: string;
    meshtype: string;
    name: string;
    screenShot: string;
    texture: string;
}
interface ChildProps {
    setSelectedObjColor: React.Dispatch<React.SetStateAction<string>>;
    closeMaterialModal: () => void;
}
const TextureModal: React.FC<ChildProps> = ({ closeMaterialModal: closeMaterialModal, setSelectedObjColor }) => {
    const [materials, setMaterials] = useState<MeshType[]>([]);
    const [filteredMaterials, setFilteredMaterials] = useState<MeshType[]>([]);
    const [selectedTab] = useState(1);
    const [selectedOption, setSelectedOption] = useState(""); // Default selected option
    const [selectedMaterial, setSelectedMaterial] = useState<MeshType>();
    const setSelectedMaterialAtom = useSetAtom(selectedMaterialAtom);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const selectedObj = useSelectedState(editor);
    // Get all materials on component's mount
    useEffect(() => {
        const getMaterials = async () => {
            setIsLoading(true);
            const { data, status } = await getAllMeshes();
            if (status === 200) {
                console.log("Materials", data);
                setMaterials(data);
            }
            setIsLoading(false);
        };
        getMaterials();
    }, []);
    //get selected texture type onSelect
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        const selectedOption = event.target.options[event.target.selectedIndex].text;
        console.log("Selected Value:", selectedValue);
        console.log("Selected Option:", selectedOption);
        setSelectedOption(selectedValue);
    };
    const ref = useOutsideClick(() => {
        closeMaterialModal();
    });
    // get selected tecture from filtered data
    const handleSelectedTexture = (data: MeshType) => {
        setSelectedMaterialAtom(data);
        if (selectedObj) {
            const oldTexture = editor.get.getMaterialOfMesh(selectedObj) ?? new Color3(1, 1, 1);
            if (data.texture) {
                const texture = new Texture(data.texture, editor.scene);
                editor.executer(new SetMaterialCommnand(editor, selectedObj, null, texture, oldTexture));
                setSelectedObjColor("");
            }
        }

        console.log(data, "selected");
        setSelectedMaterial(data);
        closeMaterialModal();
    };
    useEffect(() => {
        const filteredData = materials.filter((material) => material.name.toLowerCase().includes(selectedOption.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
        setFilteredMaterials(filteredData);
    }, [materials, selectedMaterial, selectedOption]);
    // const action = (index: number) => {
    //     setSelectedTab(index);
    //     console.log(index);
    // };

    return (
        <div className={styles.mainContainer} ref={ref}>
            <div className={styles.tabContainer}>
                {/* <div className={style.tabs}>
                    <div onClick={() => action(1)} className={selectedTab === 1 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <p className={styles.tabHeading}>PRESETS</p>{" "}
                    </div>
                    <div className={`${styles.tab} ${styles.verticalLine}`}></div>
                    <div onClick={() => action(2)} className={selectedTab === 2 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <p className={styles.tabHeading}>CUSTOM</p>
                    </div>
                    <div className={`${styles.tab} ${styles.verticalLine}`}></div>
                    <div onClick={() => action(3)} className={selectedTab === 3 ? `${styles.tab} ${styles.activeTab}` : `${styles.tab}`}>
                        <p className={styles.tabHeading}>3rdPARTY</p>
                    </div>
                </div> */}
                <div className={styles.contents}>
                    <div className={selectedTab === 1 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>
                        <div className={style.contentOneContainer}>
                            {/* <select onChange={handleSelectChange} className={style.optionContainer}>
                                <option value="WOOD">WOOD</option>
                                <option value="BRICK">BRICK</option>
                                <option value="FABRIC">FABRIC</option>
                                <option value="METAL">METAL</option>
                                <option value="CONCRETE">CONCRETE</option>
                            </select> */}
                            <Dropdown
                                style={{ width: "90%", margin: "0" }}
                                name="options"
                                options={[
                                    { name: "WOOD", value: "WOOD", defaultValue: true },
                                    { name: "BRICK", value: "BRICK" },
                                    { name: "FABRIC", value: "FABRIC" },
                                    { name: "METAL", value: "METAL" },
                                    { name: "CONCRETE", value: "CONCRETE" },
                                ]}
                                // onChange={(e) => {
                                //     console.log(e.target.value);
                                // }}
                                onChange={handleSelectChange}
                            />
                            {/* Render the filtered materials */}
                            <div className={style.filteredMaterialsContainer}>
                                {isLoading ? (
                                    <TextureShimmer />
                                ) : (
                                    filteredMaterials.map((material) => (
                                        <div
                                            key={material.id}
                                            className={selectedMaterial === material ? style.selectedMaterial : style.filteredMaterial}
                                            onClick={() => handleSelectedTexture(material)}
                                        >
                                            <div className={style.filteredImage}>
                                                <img src={material.screenShot} />
                                            </div>
                                            <p>{material.name}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={selectedTab === 2 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>CONTENT 2</div>
                    <div className={selectedTab === 3 ? `${styles.content} ${styles.activeContent}` : `${styles.content}`}>CONTENT 3</div>
                </div>
            </div>
        </div>
    );
};
export default TextureModal;
