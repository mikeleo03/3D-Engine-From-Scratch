import { GLTFState } from "../data/GLTFState";
import { SceneNode } from "../data/SceneNode";
import { NodeComponent } from "../data/components/NodeComponent";
import { GLRenderer } from "./GLRenderer";

export class RenderManager {
    private static readonly DEFAULT_FPS = 30;

    private _gltfState: GLTFState;
    private _glRenderer: GLRenderer;

    private _isRunning: boolean = false;
    private _interval: number = 0;
    private _lastTime: number = 0;
    private _loopId: number = 0;
    private _customCamera: SceneNode | null = null;
    private _customLight: SceneNode | null = null;

    constructor(gltfState: GLTFState, glRenderer: GLRenderer) {
        this._gltfState = gltfState
        this._glRenderer = glRenderer
    }

    set customCamera(cameraNode: SceneNode) {
        this._customCamera = cameraNode;
    }

    set customLight(cameraNode: SceneNode) {
        this._customLight = cameraNode;
    }

    set enablePhongShading(enable: boolean) {
        this._glRenderer.enablePhongShading = enable;
    }

    getCustomeCamera(): SceneNode | null{
        return this._customCamera;
    }

    removeCustomCamera() {
        this._customCamera = null;
    }

    getCustomeLight(): SceneNode | null{
        return this._customLight;
    }

    removeCustomLight() {
        this._customLight = null;
    }

    render() {
        const scene = this._gltfState.CurrentScene;
        const cameraNode = this._customCamera || scene?.getActiveCameraNode();
        const lightNode = this._customLight || scene?.getActiveLightNode();

        if (!scene || !cameraNode || !lightNode) {
            return;
        }

        this._glRenderer.render(scene, cameraNode, lightNode);
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