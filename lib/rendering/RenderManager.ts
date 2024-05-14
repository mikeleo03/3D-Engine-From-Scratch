import { GLTFState } from "../data/GLTFState";
import { GLRenderer } from "./GLRenderer";

export class RenderManager {
    private static readonly DEFAULT_FPS = 30;

    private _gltfState: GLTFState;
    private _glRenderer: GLRenderer;

    private _isRunning: boolean = false;
    private _interval: number = 0;
    private _lastTime: number = 0;
    private _loopId: number = 0;

    constructor(gltfState: GLTFState, glRenderer: GLRenderer) {
        this._gltfState = gltfState
        this._glRenderer = glRenderer
    }

    render() {
        const scene = this._gltfState.CurrentScene;

        if (!scene) {
            return;
        }

        this._glRenderer.render(scene);
    }

    loop(fps: number = RenderManager.DEFAULT_FPS) {
        if (this._isRunning) {
            this.stop();
        }

        this._isRunning = true;
        this._interval = 1000 / fps;

        const loop = (time: number) => {
            if (!this._isRunning) return;

            if (time - this._lastTime > this._interval) {
                this.render();
                this._lastTime = time;
            }

            this._loopId = requestAnimationFrame(loop);
        };

        this._loopId = requestAnimationFrame(loop);
    }

    stop() {
        this._isRunning = false;
        cancelAnimationFrame(this._loopId);
    }
}