import { useEffect, useState } from "react";
import { editor } from "../3D/EditorLogic/editor";
import { VALID_UID_SCENE_ID_PATHS, getCurrentQueryParams, getUrlPathName } from "../3D/EditorLogic/utils";
import Boadring from "./Boadring";
import Experience from "./Experience";

function Publish() {
    const [enter, setEnter] = useState(false);
    useEffect(() => {
        const pathname = getUrlPathName();
        const { UID, sceneID } = getCurrentQueryParams();
        if (VALID_UID_SCENE_ID_PATHS.includes(pathname) && (!UID || !sceneID)) {
            window.location.replace("/404");
        }
        editor.isInPublishMode = true;
    }, []);

    // useEffect(() => {
    //     editor.hideLoadingUI();
    // }, []);

    return <>{!enter ? <Boadring setEnter={setEnter} /> : <Experience />}</>;
}

export default Publish;
