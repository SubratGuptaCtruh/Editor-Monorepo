export class WebWorker {
    private _worker: Worker;

    private _onMessageListeners: ((event: MessageEvent) => void)[] = [];

    constructor(worker: new () => Worker) {
        this._worker = new worker();

        this._worker.onmessage = this.broadcastMessage;
    }

    public postMessage(message: unknown, offscreenCanvas?: OffscreenCanvas) {
        if (!offscreenCanvas) {
            this._worker.postMessage(message);
        } else {
            this._worker.postMessage(message, [offscreenCanvas]);
        }
    }

    public onMessage = (callback: (event: MessageEvent) => void) => {
        this._onMessageListeners.push(callback);
        return () => {
            const index = this._onMessageListeners.indexOf(callback);
            if (index !== -1) {
                this._onMessageListeners.splice(index, 1);
            }
        };
    };

    private broadcastMessage = (event: MessageEvent) => {
        this._onMessageListeners.forEach((listener) => listener(event));
    };

    public dispose() {
        this._worker.terminate();
        this._onMessageListeners = [];
    }
}
