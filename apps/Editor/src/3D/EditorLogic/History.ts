import type { Command, Editor } from "./editor";
export class History {
    private editor: Editor;
    public undos: Command[] = [];
    public redos: Command[] = [];
    constructor(editor: Editor) {
        this.editor = editor;
    }
    public undo = () => {
        const command = this.undos.pop();
        if (!command) return;
        this.redos.push(command);
        command.undo();
        this.editor.UIeventEmitter.emit("historyChange", () => {});
        this.editor.save();
    };
    public redo = () => {
        const command = this.redos.pop();
        if (!command) return;
        command.execute();
        this.undos.push(command);
        this.editor.UIeventEmitter.emit("historyChange", () => {});
        this.editor.save();
    };
    public execute = (cmd: Command) => {
        if (this.redos.length !== 0) {
            this.redos = [];
        }
        cmd.execute();
        this.editor.save();
        this.undos.push(cmd);
        this.editor.UIeventEmitter.emit("historyChange", () => {});
    };
}
