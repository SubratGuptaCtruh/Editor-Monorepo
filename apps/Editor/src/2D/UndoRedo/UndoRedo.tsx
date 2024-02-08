import { Redo, Undo } from "./Icons/Icons";
import styles from "./UndoRedo.module.css";

interface UndoRedoTypes {
    undo: () => void;
    redo: () => void;
    undoEnabled?: boolean;
    redoEnabled?: boolean;
}

function UndoRedo({ undoEnabled, redoEnabled, undo, redo }: UndoRedoTypes) {
    return (
        <div className={styles.unduRedoMainContainer}>
            <button onClick={undo} className={undoEnabled ? styles.EnabledButton : styles.DisabledButton}>
                <Undo />
            </button>
            <button onClick={redo} className={redoEnabled ? styles.EnabledButton : styles.DisabledButton}>
                <Redo />
            </button>
        </div>
    );
}

export default UndoRedo;
