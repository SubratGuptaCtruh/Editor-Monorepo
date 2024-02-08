import { useAtomValue, useSetAtom } from "jotai";
import { MeshType, editor } from "../../3D/EditorLogic/editor";
import { boxCreatorAtom, snackbarInfo } from "../../store/store";
import { useSelectedState } from "../Hooks/useSelected";
import styles from "./RightPart.module.css";
import Object from "./components/3DObject/3DObject";
import ThreeDText from "./components/3DText/3DText";
import AudioSource from "./components/AudioSource/AudioSource";
import CameraSettings from "./components/CameraSettings/CameraSettings";
import LightSource from "./components/LightSource/LightSource";
import MultiSelect from "./components/MultiSelect/multiselect";
import ParentAsset from "./components/Parent Asset/ParentAsset";
import ScenePreference from "./components/ScenePreference/ScenePreference";
import Screen from "./components/Screen/Screen";

const RightPart = () => {
    const selected = useSelectedState(editor);
    const boxCreator = useAtomValue(boxCreatorAtom);
    const setSnackbar = useSetAtom(snackbarInfo);

    // only pass down selected to children with props , dont call this hook inside children
    const getComponentToDisplay = () => {
        if (!selected) return <ScenePreference />;
        if (!selected.metadata) throw Error(`no meta data found on this mesh ${selected}`);
        switch (selected.metadata.type as MeshType) {
            case "Mesh":
                return <Object selected={selected} />;
            case "Camera":
                return <CameraSettings key={selected.id} />;
            case "DirectionLight":
                return <LightSource key={selected.id} />;
            case "PointLight":
                return <LightSource key={selected.id} />;
            case "SpotLight":
                return <LightSource key={selected.id} />;
            case "SpatialAudio":
                return <AudioSource key={selected.id} />;
            case "Text":
                return <ThreeDText key={selected.id} />;
            case "Screen":
                return <Screen key={selected.id} />;
            case "TransformNode":
                return <ParentAsset key={selected.id} />;
            case "MultiSelectGroup":
                return <MultiSelect key={selected.id} />;
            default:
                return <ScenePreference />;
        }
    };
    return (
        <div
            className={styles.rightPartMainContainer}
            onClick={() => {
                setSnackbar(null);
                boxCreator?.dispose();
            }}
        >
            {getComponentToDisplay()}
        </div>
    );
};

export default RightPart;
