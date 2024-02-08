import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { boxCreatorAtom, exportModalAtom, snackbarInfo } from "../../store/store";
import Modal from "../Components/Modal/Modal";
import ExportModal from "./Components/ExportModal/ExportModal";
import LeftPartEdit from "./Components/LeftPartEdit/LeftPartEdit";
import LeftPartUnEdit from "./Components/LeftPartUnEdit/LeftPartUnEdit";
import styles from "./LeftPart.module.css";
import { LayersIcons } from "./icons/icons";
function LeftPart() {
    const [openEditSection, setOpenEditSection] = useState<boolean>(false);
    const [exportModal, setExportModal] = useAtom(exportModalAtom);
    const exportModalClose = () => {
        setExportModal(false);
    };
    const boxCreator = useAtomValue(boxCreatorAtom);
    const setSnackbar = useSetAtom(snackbarInfo);

    return (
        <>
            <div
                className={styles.leftPartMainContainer}
                onClick={() => {
                    setSnackbar(null);
                    boxCreator?.dispose();
                }}
            >
                <div className={styles.leftPartHeading}>
                    <h4>Assets</h4>
                    <div onClick={() => setOpenEditSection(!openEditSection)} className={openEditSection ? styles.editIconOn : styles.editIconOff}>
                        <LayersIcons />
                    </div>
                </div>
                <section>{openEditSection ? <LeftPartEdit /> : <LeftPartUnEdit />}</section>
            </div>

            <Modal isOpen={exportModal} onClose={exportModalClose} style={{ height: "252px", maxWidth: "473px", overflow: "visible" }}>
                <ExportModal />
            </Modal>
        </>
    );
}
export default LeftPart;
