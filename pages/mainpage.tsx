import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GLTFState } from '@/lib/data/GLTFState';
import { Color, GLContainer } from '@/lib/cores';
import { ObliqueCamera, OrthographicCamera, PerspectiveCamera } from '@/lib/data/components/cameras';
import { DirectionalLight } from '@/lib/data/components/lights';
import { SceneNode } from '@/lib/data/SceneNode';
import { GLRenderer } from '@/lib/rendering/GLRenderer';
import { GLTFParser } from '@/lib/data/GLTFParser';
import { RenderManager } from '@/lib/rendering/RenderManager';
import { FileUtil } from '@/lib/utils/FileUtil';
import { AnimationRunner } from "@/lib/data/components/animations";
import { Quaternion, Vector3 } from '@/lib/data/math';
import { AnimationEasingTypeString, CameraTypeString, LightTypeString } from '@/lib/data/types/gltftypes';
import NodeView from '@/components/NodeView';
import { Camera } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BasicMaterial, PhongMaterial } from '@/lib/data/components/materials';
import { RgbaColorPicker } from 'react-colorful';

type Axis = 'x' | 'y' | 'z';
type TRSType = 'translation' | 'rotation' | 'scale';
interface TRS {
    x: number;
    y: number;
    z: number;
}

interface CameraState {
    type: CameraTypeString;
    zoom: number;
    obliqueAngleX?: number;
    obliqueAngleY?: number;
}

interface AnimationState {
    type: AnimationEasingTypeString;
}

interface ShaderState {
    phongEnabled: boolean;
}

type MaterialListState = {
    basics: BasicMaterial[];
    phongs: PhongMaterial[];
}

type RgbaColor = {
    r: number;
    g: number;
    b: number;
    a: number;
}

const colorToRgba = (color: Color) => {
    return {
        r: color.R,
        g: color.G,
        b: color.B,
        a: color.A / 255
    } as RgbaColor;
}

const rgbaToColor = (rgba: RgbaColor) => {
    return new Color(rgba.r, rgba.g, rgba.b, rgba.a * 255);
}

const gltfParser = new GLTFParser();
const cameraPosition = new Vector3(0, 0, 100);

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const secondCanvasRef = useRef<HTMLCanvasElement>(null);
    const [translation, setTranslation] = useState<TRS>({ x: 0, y: 0, z: 0 });
    const [rotation, setRotation] = useState<TRS>({ x: 0, y: 0, z: 0 });
    const [scale, setScale] = useState<TRS>({ x: 1, y: 1, z: 1 });
    const [camera, setCamera] = useState<CameraState>({
        type: CameraTypeString.PERSPECTIVE,
        zoom: 1,
    });
    const [secondCamera, setSecondCamera] = useState<CameraState>({
        type: CameraTypeString.PERSPECTIVE,
        zoom: 1,
    });
    const [easingMode, setEasingMode] = useState<AnimationState>({ 
        type: AnimationEasingTypeString.LINEAR
    });
    const [fps, setFps] = useState<number>(20);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isReversing, setIsReversing] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [currentNode, setCurrentNode] = useState<SceneNode>();
    const [disableTRS, setDisableTRS] = useState(true);
    const [shader, setShader] = useState<ShaderState>({ phongEnabled: false });
    const [materialList, setMaterialList] = useState<MaterialListState>({basics: [], phongs: []});

    const glContainerRef = useRef<GLContainer>();
    const secondGlContainerRef = useRef<GLContainer>();
    const glRendererRef = useRef<GLRenderer>();
    const secondGLRendererRef = useRef<GLRenderer>();
    const renderManagerRef = useRef<RenderManager>();
    const secondRenderManagerRef = useRef<RenderManager>();
    const gltfStateRef = useRef<GLTFState>();
    const cameraNodesRef = useRef<SceneNode[]>([]);
    const secondCameraNodesRef = useRef<SceneNode[]>([]);
    const lightNodesRef = useRef<SceneNode[]>([]);
    const animationRunnersRef = useRef<AnimationRunner[]>([]);
    const currentNodeRef = useRef<SceneNode>();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, type: TRSType, axis: Axis) => {
        if (e.target.value !== null && e.target.value !== undefined) {
            let value = parseFloat(e.target.value);

            if (type === 'rotation') {
                // limit the value to -360 to 360
                value = value % 360;
            }

            let newValue = { x: 0, y: 0, z: 0 };

            if (type === 'translation') {
                setTranslation(prevState => {
                    newValue = { ...prevState, [axis]: value };
                    return newValue;
                });
            }

            else if (type === 'rotation') {
                setRotation(prevState => {
                    newValue = { ...prevState, [axis]: value };
                    return newValue;
                });
            }

            else if (type === 'scale') {
                setScale(prevState => {
                    newValue = { ...prevState, [axis]: value };
                    return newValue;
                });
            }

            else {
                throw new Error("Invalid TRS type");
            }

            if (isNaN(value)) {
                return;
            }

            // Process the value
            if (!currentNodeRef.current) {
                return;
            }

            if (type === 'translation') {
                currentNodeRef.current.position = new Vector3(newValue.x, newValue.y, newValue.z);
            }

            if (type === 'rotation') {
                currentNodeRef.current.rotation = Quaternion.fromDegrees(newValue.x, newValue.y, newValue.z);
            }

            if (type === 'scale') {
                currentNodeRef.current.scale = new Vector3(newValue.x, newValue.y, newValue.z);
            }
        }
    };
    

    const getCurrentCameraNode = () => {
        const currentScene = gltfStateRef.current?.CurrentScene;

        if (!currentScene) {
            return;
        }

        const cameraNode = currentScene.getActiveCameraNode();

        return cameraNode;
    }

    const getCurrentCamera = () => {
        const cameraNode = getCurrentCameraNode();

        if (!cameraNode) {
            return;
        }

        const camera = cameraNode.camera;

        return camera;
    }

    const getCurrentLightNode = () => {
        const currentScene = gltfStateRef.current?.CurrentScene;

        if (!currentScene) {
            return;
        }

        const lightNode = currentScene.getActiveLightNode();

        return lightNode;
    }

    const getCurrentLight = () => {
        const lightNode = getCurrentLightNode();

        if (!lightNode) {
            return;
        }

        const light = lightNode.light;

        return light;
    }

    const changeCurrentCamera = (type: CameraTypeString) => {
        const currentScene = gltfStateRef.current?.CurrentScene;

        if (!currentScene) {
            setCamera(prevState => ({
                ...prevState,
                type: type,
                zoom: 1,
                obliqueAngleX: 0,
                obliqueAngleY: 0
            }));
            return;
        }

        const cameras = currentScene.cameras;
        const lights = currentScene.lights;

        for (const lightNode of lights) {
            if (lightNode.light && lightNode.light.type === LightTypeString.DIRECTIONAL) {
                currentScene.setActiveLightNode(lightNode);
            }
        }

        for (const cameraNode of cameras) {
            if (cameraNode.camera && cameraNode.camera.type === type) {
                currentScene.setActiveCameraNode(cameraNode);

                setCamera(prevState => {
                    const newState: CameraState = {
                        ...prevState,
                        type: type,
                        zoom: cameraNode.camera!.zoom,
                    }

                    if (type === CameraTypeString.OBLIQUE) {
                        const obliqueCamera = cameraNode.camera as ObliqueCamera;
                        newState.obliqueAngleX = obliqueCamera.angleX
                        newState.obliqueAngleY = obliqueCamera.angleY
                    }

                    return newState;
                });

                break;
            }
        }
    }

    const handleCameraModeChange = (type: string) => {
        const value = type as CameraTypeString;
        changeCurrentCamera(value);
    };

    const handleSecondCameraModeChange = (type: string) => {
        const value = type as CameraTypeString;

        const currentScene = gltfStateRef.current?.CurrentScene;

        if (!currentScene) {
            setSecondCamera(prevState => ({
                ...prevState,
                type: value,
                zoom: 1,
                obliqueAngleX: 0,
                obliqueAngleY: 0
            }));
            return;
        }

        const cameras = secondCameraNodesRef.current

        for (const cameraNode of cameras) {
            if (cameraNode.camera && cameraNode.camera.type === type) {
                secondRenderManagerRef.current!!.customCamera = cameraNode;

                setSecondCamera(prevState => {
                    const newState: CameraState = {
                        ...prevState,
                        type: value,
                        zoom: cameraNode.camera!.zoom,
                    }

                    if (type === CameraTypeString.OBLIQUE) {
                        const obliqueCamera = cameraNode.camera as ObliqueCamera;
                        newState.obliqueAngleX = obliqueCamera.angleX
                        newState.obliqueAngleY = obliqueCamera.angleY
                    }

                    return newState;
                });

                break;
            }
        }

    }

    const handleCameraZoomChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCamera(prevState => ({ ...prevState, zoom: parseFloat(e.target.value) }));

        const currentCamera = getCurrentCamera();

        if (!currentCamera) {
            return;
        }

        currentCamera.zoom = parseFloat(e.target.value);
    };

    const handleSecondCameraZoomChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSecondCamera(prevState => ({ ...prevState, zoom: parseFloat(e.target.value) }));

        const currentCamera = secondRenderManagerRef.current?.getCustomeCamera();

        if (!currentCamera) {
            return;
        }

        currentCamera.camera!!.zoom = parseFloat(e.target.value);
    }

    const handleObliqueHorizontalAngleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCamera(prevState => ({ ...prevState, obliqueAngleX: parseFloat(e.target.value) }));

        const currentCamera = getCurrentCamera();

        if (!currentCamera) {
            return;
        }

        if (currentCamera.type !== CameraTypeString.OBLIQUE) {
            return;
        }

        const obliqueCamera = currentCamera as ObliqueCamera;

        obliqueCamera.angleX = parseFloat(e.target.value);
    };

    const handleObliqueVerticalAngleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCamera(prevState => ({ ...prevState, obliqueAngleY: parseFloat(e.target.value) }));

        const currentCamera = getCurrentCamera();

        if (!currentCamera) {
            return;
        }

        if (currentCamera.type !== CameraTypeString.OBLIQUE) {
            return;
        }

        const obliqueCamera = currentCamera as ObliqueCamera;

        obliqueCamera.angleY = parseFloat(e.target.value);
    }

    const handleSecondObliqueHorizontalAngleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSecondCamera(prevState => ({ ...prevState, obliqueAngleX: parseFloat(e.target.value) }));

        const currentCamera = secondRenderManagerRef.current?.getCustomeCamera()?.camera;

        if (!currentCamera) {
            return;
        }

        if (currentCamera.type !== CameraTypeString.OBLIQUE) {
            return;
        }

        const obliqueCamera = currentCamera as ObliqueCamera;

        obliqueCamera.angleX = parseFloat(e.target.value);
    };

    const handleSecondObliqueVerticalAngleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSecondCamera(prevState => ({ ...prevState, obliqueAngleY: parseFloat(e.target.value) }));

        const currentCamera = secondRenderManagerRef.current?.getCustomeCamera()?.camera;

        if (!currentCamera) {
            return;
        }

        if (currentCamera.type !== CameraTypeString.OBLIQUE) {
            return;
        }

        const obliqueCamera = currentCamera as ObliqueCamera;

        obliqueCamera.angleY = parseFloat(e.target.value);
    }

    const toggleShader = (isChecked: boolean) => {
        if (renderManagerRef.current) {
            renderManagerRef.current.enablePhongShading = isChecked;
        }

        if (secondRenderManagerRef.current) {
            secondRenderManagerRef.current.enablePhongShading = isChecked;
        }

        setShader(prevState => ({...prevState, phongEnabled: isChecked }));
    };

    const togglePlay = () => {
        setIsPlaying(prevState => !prevState);
    };

    const toggleReverse = () => {
        setIsReversing(prevState => !prevState);
    };

    const toggleLoop = () => {
        setIsLooping(prevState => !prevState);
    };

    const handleEasingModeChange = (type: string) => {
        const value = type as AnimationEasingTypeString;
        changeCurrentAnimationEasing(value);
    };

    const changeCurrentAnimationEasing = (type: AnimationEasingTypeString) => {
        const currentScene = gltfStateRef.current?.CurrentScene;

        if (!currentScene) {
            setEasingMode({ type: type });
            return;
        }

        // TODO (Marthen) : handle gimana mekanismenya

        setEasingMode({ type: type });
    }

    const handleFPSChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value !== null && e.target.value !== undefined) {
            let value = parseFloat(e.target.value);

            if (isNaN(value)) {
                return;
            }

            // TODO (Marthen) : process the value

            setFps(value);
        }
    };

    const handleCurrentNodeChange = () => {
        setCurrentNode(currentNodeRef.current);
        setCurrentTRS();
        setDisableTRS(!currentNodeRef.current || currentNodeRef.current.camera !== undefined);

        const currentCameraNode = getCurrentCameraNode();

        if (currentCameraNode && currentCameraNode != currentNodeRef.current) {
            currentCameraNode.lookAt(currentNodeRef.current!!.position);
        }

        const currentSecondCameraNode = secondRenderManagerRef.current?.getCustomeCamera();

        if (currentSecondCameraNode && currentSecondCameraNode != currentNodeRef.current) {
            currentSecondCameraNode.lookAt(currentNodeRef.current!!.position);
        }

        const mesh = currentNodeRef.current?.mesh;

        if (mesh) {
            const basics: BasicMaterial[] = [];
            const phongs: PhongMaterial[] = [];

            for (const geometry of mesh.geometries) {
                const basicMaterial = geometry.basicMaterial;

                if (basicMaterial && !basics.includes(basicMaterial)) {
                    basics.push(basicMaterial);
                }

                const phongMaterial = geometry.phongMaterial;

                if (phongMaterial && !phongs.includes(phongMaterial)) {
                    phongs.push(phongMaterial);
                }
            }

            setMaterialList({ basics: basics, phongs: phongs });
        }

        else {
            setMaterialList({ basics: [], phongs: [] });
        }
    }

    const handleNodeChange = (node: SceneNode) => {
        currentNodeRef.current = node;
        handleCurrentNodeChange();

    }

    const setCurrentTRS = (currentNode: SceneNode | undefined = currentNodeRef.current) => {
        if (currentNode && currentNodeRef.current !== currentNode) {
            return;
        }

        if (!currentNode) {
            // set to 0
            setTranslation({ x: 0, y: 0, z: 0 });
            setRotation({ x: 0, y: 0, z: 0 });
            setScale({ x: 1, y: 1, z: 1 });

            return;
        }

        setTranslation({
            x: currentNode.position.X,
            y: currentNode.position.Y,
            z: currentNode.position.Z
        });

        const degrees = currentNode.rotation.toDegrees();

        setRotation({
            x: degrees.X,
            y: degrees.Y,
            z: degrees.Z
        });

        setScale({
            x: currentNode.scale.X,
            y: currentNode.scale.Y,
            z: currentNode.scale.Z
        });
    }

    const setNewState = (newState: GLTFState) => {
        gltfStateRef.current = newState;

        const currentScene = newState.CurrentScene;

        if (!currentScene) {
            return;
        }

        for (const node of cameraNodesRef.current) {
            const currentScene = newState.CurrentScene;
            if (!currentScene.hasCamera(node.camera!!.type)) {
                newState.addNodeToScene(node, currentScene);
            }
        }

        for (const node of lightNodesRef.current) {
            const currentScene = newState.CurrentScene;
            if (!currentScene.hasLight(node.light!!.type)) {
                newState.addNodeToScene(node, currentScene);
            }
        }

        const currentCamera = getCurrentCamera();

        for (const root of currentScene.roots) {
            // TODO: must check children too if they has camera
            if (!root.camera) {
                handleNodeChange(root);
                break;
            }
        }

        if (renderManagerRef.current) {
            renderManagerRef.current.stop();
        }

        if (secondRenderManagerRef.current) {
            secondRenderManagerRef.current.stop();
        }

        renderManagerRef.current = new RenderManager(newState, glRendererRef.current!!);
        renderManagerRef.current.loop();

        secondRenderManagerRef.current = new RenderManager(newState, secondGLRendererRef.current!!);
        secondRenderManagerRef.current.loop();

        const animations = newState.animations;

        for (const animation of animations) {
            const animationRunner = new AnimationRunner();
            animationRunnersRef.current.push(animationRunner);
            animationRunner.setAnimation(animation);
        }

        handleCameraModeChange(currentCamera!!.type);
        handleSecondCameraModeChange(CameraTypeString.PERSPECTIVE);
        
        toggleShader(false);
    }

    const importFile = async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".gltf";
        input.onchange = async () => {
            if (!input.files || input.files.length === 0) {
                return;
            }

            else {
                const file = input.files[0];
                const gltfState = await gltfParser.parse(file)
                gltfStateRef.current = gltfState;

                const currentScene = gltfState.CurrentScene;

                if (!currentScene) {
                    return;
                }
                
                for (const node of cameraNodesRef.current) {
                    const currentScene = gltfState.CurrentScene;
                    if (!currentScene.hasCamera(node.camera!!.type)) {
                        gltfState.addNodeToScene(node, currentScene);
                    }
                }

                for (const node of secondCameraNodesRef.current) {
                    const currentScene = gltfState.CurrentScene;
                    gltfState.addNodeToScene(node, currentScene);

                }

                for (const node of lightNodesRef.current) {
                    const currentScene = gltfState.CurrentScene;
                    if (!currentScene.hasLight(node.light!!.type)) {
                        gltfState.addNodeToScene(node, currentScene);
                    }
                }

                renderManagerRef.current = new RenderManager(gltfState, glRendererRef.current!!);
                renderManagerRef.current.loop();

                secondRenderManagerRef.current = new RenderManager(gltfState, secondGLRendererRef.current!!);
                secondRenderManagerRef.current.loop();

                setNewState(gltfState);
            }
        }

        input.click();
    }

    const exportFile = async () => {
        const gltfState = gltfStateRef.current;
        if (!gltfState) {
            return;
        }

        for (const node of secondCameraNodesRef.current) {
            gltfState.CurrentScene?.removeNode(node);
        }

        const gltf = gltfParser.write(gltfState);

        FileUtil.downloadFile(gltf);
    }


    const handleScrollEvent = (e: WheelEvent) => {
        const deltaFactor = 0.05;
        const currentCameraNode = getCurrentCameraNode();

        if (!currentCameraNode) {
            return;
        }

        if (currentCameraNode == currentNodeRef.current) {
            return;
        }

        const delta = e.deltaY * deltaFactor;

        currentCameraNode.translate(currentCameraNode.forward.mul(-delta));
        setCurrentTRS(currentCameraNode);
    }

    const handleMouseDragEvent = (e: MouseEvent) => {
        const deltaXFactor = 0.5;
        const deltaYFactor = 0.5;

        const currentCameraNode = getCurrentCameraNode();

        if (!currentCameraNode) {
            return;
        }

        const currentNode = currentNodeRef.current;

        if (!currentNode) {
            return;
        }

        if (currentCameraNode == currentNode) {
            return;
        }

        const deltaX = e.movementX * deltaXFactor;
        const deltaY = e.movementY * deltaYFactor;


        currentCameraNode.rotateAroundPoint(currentNode.position, Quaternion.fromDegrees(-deltaY, -deltaX, 0));
        setCurrentTRS(currentNode);
    }

    const handleSecondScrollEvent = (e: WheelEvent) => {
        const deltaFactor = 0.05;
        const currentCameraNode = secondRenderManagerRef.current?.getCustomeCamera();

        if (!currentCameraNode) {
            return;
        }

        if (currentCameraNode == currentNodeRef.current) {
            return;
        }

        const delta = e.deltaY * deltaFactor;

        currentCameraNode.translate(currentCameraNode.forward.mul(-delta));
        setCurrentTRS(currentCameraNode);
    }

    const handleSecondMouseDragEvent = (e: MouseEvent) => {
        const deltaXFactor = 0.5;
        const deltaYFactor = 0.5;

        const currentCameraNode = secondRenderManagerRef.current?.getCustomeCamera();

        if (!currentCameraNode) {
            return;
        }

        const currentNode = currentNodeRef.current;

        if (!currentNode) {
            return;
        }

        if (currentCameraNode == currentNode) {
            return;
        }

        const deltaX = e.movementX * deltaXFactor;
        const deltaY = e.movementY * deltaYFactor;


        currentCameraNode.rotateAroundPoint(currentNode.position, Quaternion.fromDegrees(-deltaY, -deltaX, 0));
        setCurrentTRS(currentNode);
    }

    const handleMouseDownEvent = (e: MouseEvent) => {
        const canvas = canvasRef.current;
        canvas?.addEventListener('mousemove', handleMouseDragEvent);
    }

    const handleSecondMouseDownEvent = (e: MouseEvent) => {
        const canvas = secondCanvasRef.current;
        canvas?.addEventListener('mousemove', handleSecondMouseDragEvent);
    }

    const handleMouseUpEvent = (e: MouseEvent) => {
        const canvas = canvasRef.current;
        canvas?.removeEventListener('mousemove', handleMouseDragEvent);
    }

    const handleSecondMouseUpEvent = (e: MouseEvent) => {
        const canvas = secondCanvasRef.current;
        canvas?.removeEventListener('mousemove', handleSecondMouseDragEvent);
    }

    const handleMouseOutEvent = (e: MouseEvent) => {
        const canvas = canvasRef.current;
        canvas?.removeEventListener('mousemove', handleMouseDragEvent);
    }

    const handleSecondMouseOutEvent = (e: MouseEvent) => {
        const canvas = secondCanvasRef.current;
        canvas?.removeEventListener('mousemove', handleSecondMouseDragEvent);
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const secondCanvas = secondCanvasRef.current;

        if (!canvas || !secondCanvas) {
            return;
        }

        const initializeGL = async () => {
            const glContainer = new GLContainer(canvas);
            const secondGlContainer = new GLContainer(secondCanvas);

            const orthographicCamera = new OrthographicCamera(
                canvas.height / 2,
                -canvas.height / 2,
                -canvas.width / 2,
                canvas.width / 2,
                0.01,
                1000,
                1
            );

            const perspectiveCamera = new PerspectiveCamera(
                canvas.width / canvas.height,
                120,
                0.01,
                1000,
                1
            );

            const obliqueCamera = new ObliqueCamera(
                canvas.height / 2,
                -canvas.height / 2,
                -canvas.width / 2,
                canvas.width / 2,
                0.01,
                1000,
                1,
                0,
                0
            );

            const secondOrthographicCamera = new OrthographicCamera(
                canvas.height / 2,
                -canvas.height / 2,
                -canvas.width / 2,
                canvas.width / 2,
                0.01,
                1000,
                1
            );

            const secondPerspectiveCamera = new PerspectiveCamera(
                canvas.width / canvas.height,
                120,
                0.01,
                1000,
                1
            );

            const secondObliqueCamera = new ObliqueCamera(
                canvas.height / 2,
                -canvas.height / 2,
                -canvas.width / 2,
                canvas.width / 2,
                0.01,
                1000,
                1,
                0,
                0
            );

            const cameraNodes = [
                new SceneNode({
                    name: 'Perspective Camera',
                    camera: perspectiveCamera,
                    position: cameraPosition
                }),
                new SceneNode({
                    name: 'Orthographic Camera',
                    camera: orthographicCamera,
                    position: cameraPosition
                }),
                new SceneNode({
                    name: 'Oblique Camera',
                    camera: obliqueCamera,
                    position: cameraPosition
                })
            ]

            const secondCameraNodes = [
                new SceneNode({
                    name: 'Second Perspective Camera',
                    camera: secondPerspectiveCamera,
                    position: cameraPosition
                }),
                new SceneNode({
                    name: 'Second Orthographic Camera',
                    camera: secondOrthographicCamera,
                    position: cameraPosition
                }),
                new SceneNode({
                    name: 'Second Oblique Camera',
                    camera: secondObliqueCamera,
                    position: cameraPosition
                })
            ]

            const directionalLight = new DirectionalLight(
                new Color(255, 255, 255),
                40,
                new Vector3(0, 0, 0),
                new Color(0.2 * 255, 0.2 * 255, 0.2 * 255),
                new Color(0.5 * 255, 0.5 * 255, 0.5 * 255),
                new Color(255, 255, 255)
            );

            const lightPosition = new Vector3(0, -50, 50);

            const lightNodes = [
                new SceneNode({
                    name: 'Directional Light',
                    light: directionalLight,
                    position: lightPosition
                })
            ]

            const glRenderer = new GLRenderer(glContainer);
            const secondGlRenderer = new GLRenderer(secondGlContainer);

            glContainerRef.current = glContainer;
            secondGlContainerRef.current = secondGlContainer;
            glRendererRef.current = glRenderer;
            secondGLRendererRef.current = secondGlRenderer;
            cameraNodesRef.current = cameraNodes;
            secondCameraNodesRef.current = secondCameraNodes;
            lightNodesRef.current = lightNodes;

            canvas.addEventListener('wheel', handleScrollEvent);
            canvas.addEventListener('mousedown', handleMouseDownEvent);
            canvas.addEventListener('mouseup', handleMouseUpEvent);
            canvas.addEventListener('mouseout', handleMouseOutEvent);

            secondCanvas.addEventListener('wheel', handleSecondScrollEvent);
            secondCanvas.addEventListener('mousedown', handleSecondMouseDownEvent);
            secondCanvas.addEventListener('mouseup', handleSecondMouseUpEvent);
            secondCanvas.addEventListener('mouseout', handleSecondMouseOutEvent);
        };

        initializeGL();
    }, [canvasRef.current]);

    const handleNextFrame = () => {
        if (isPlaying) return;
        for (const animationRunner of animationRunnersRef.current) {
            animationRunner.nextFrame();
        }
    }

    const handlePrevFrame = () => {
        if (isPlaying) return;
        for (const animationRunner of animationRunnersRef.current) {
            animationRunner.prevFrame();
        }
    }

    const handleFirstFrame = () => {
        if (isPlaying) return;
        for (const animationRunner of animationRunnersRef.current) {
            animationRunner.firstFrame();
        }
    }

    const handleLastFrame = () => {
        if (isPlaying) return;
        for (const animationRunner of animationRunnersRef.current) {
            animationRunner.lastFrame();
        }
    }

    useEffect(() => {
        let animationId: number;

        const animate = () => {
            if (isPlaying) {
                const animationRunners = animationRunnersRef.current;
                for (const animationRunner of animationRunners) {
                    animationRunner.update();
                }
            }
            animationId = requestAnimationFrame(animate);
        }

        animate();

        return () => cancelAnimationFrame(animationId);
    }, [isPlaying]);

    useEffect(()=>{
        const animationRunners = animationRunnersRef.current;
        for (const animationRunner of animationRunners) {
            animationRunner.setEasingFunction(easingMode.type);
            animationRunner.isPlaying = isPlaying;
            animationRunner.isReverse = isReversing;
            animationRunner.isLoop = isLooping;
        }
    }, [isPlaying, isReversing, isLooping, easingMode]);

    const resetCameraPosition = () => {
        const cameraNode = getCurrentCameraNode();

        if (!cameraNode) {
            return;
        }
        
        cameraNode.position = cameraPosition;

        if (currentNodeRef.current)
        {
            cameraNode.lookAt(currentNodeRef.current.position);
        }
    }

    const resetSecondCameraPosition = () => {
        const cameraNode = secondRenderManagerRef.current?.getCustomeCamera();

        if (!cameraNode) {
            return;
        }
        
        cameraNode.position = cameraPosition;

        if (currentNodeRef.current)
        {
            cameraNode.lookAt(currentNodeRef.current.position);
        }
    }

    const handleBasicColorChange = (material: BasicMaterial, color: RgbaColor) => {
        material.color = rgbaToColor(color);
    }

    const handleDiffuseColorChange = (material: PhongMaterial, color: RgbaColor) => {
        material.diffuseColor = rgbaToColor(color);
    }

    const handleSpecularColorChange = (material: PhongMaterial, color: RgbaColor) => {
        material.specularColor = rgbaToColor(color);
    }

    const handleAmbientColorChange = (material: PhongMaterial, color: RgbaColor) => {
        material.ambientColor = rgbaToColor(color);
    }

    const handleShininessChange = (material: PhongMaterial, shininess: number) => {
        material.shininess = shininess;
    }

    return (
        <main className="flex flex-col h-screen w-full bg-[#F2FBFA] overflow-hidden">
            {/* Header Section */}
            <div className="bg-gray-800 w-full h-[8vh] sticky top-0 z-50 text-white flex justify-between">
                {/* Title Section */}
                <div className="flex items-center space-x-10 text-xl font-bold pl-3">⚙️  3D Engine from Scratch</div>

                {/* Save and Load Section */}
                <div className="flex items-center">
                    {/* Separator */}
                    <Separator className="h-full w-[1px]" />

                    {/* Load Button */}
                    <Button onClick={importFile} className="h-full w-full border-none rounded-0">⬆️ Load</Button>

                    {/* Separator */}
                    <Separator className="h-full w-[1px]" />

                    {/* Clear Button */}
                    <Button onClick={exportFile} className="h-full w-full border-none rounded-0">💾 Save</Button>
                </div>
            </div>

            {/* Navigation section */}
            <div className="w-full flex flex-row h-[92vh] justify-between">
                {/* Left controller */}
                <div className="w-[400px] bg-gray-700 h-full text-white overflow-y-auto overflow-x-hidden">
                    {/* Animation */}
                    <div className="w-full p-6 py-4 pt-4 space-y-1">
                        <div className="text-lg font-semibold pb-2">🎞️ Animation Controller</div>
                        <div className="text-base font-semibold pb-1">Animation</div>
                        <div className="flex flex-row w-full pb-1 space-x-2">
                            <Button onClick={togglePlay}>{isPlaying ? '⏸️ Pause' : '▶️ Play'}</Button>
                            <Button onClick={toggleReverse}>{isReversing ? '⏭ Forward' : '⏮ Reverse'}</Button>
                            <Button onClick={toggleLoop}>{isLooping ? '🔂 Stop' : '🔁 Loop'}</Button>
                        </div>
                        <div className="text-base font-semibold py-1">Easing Functions</div>
                        <Select value={easingMode.type} onValueChange={handleEasingModeChange}>
                            <SelectTrigger className="w-full h-10 bg-gray-800 border-none">
                                <SelectValue placeholder="Choose Easing Functions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={AnimationEasingTypeString.LINEAR}>Linear</SelectItem>
                                <SelectItem value={AnimationEasingTypeString.SINE}>Sine</SelectItem>
                                <SelectItem value={AnimationEasingTypeString.QUAD}>Quad</SelectItem>
                                <SelectItem value={AnimationEasingTypeString.CUBIC}>Cubic</SelectItem>
                                <SelectItem value={AnimationEasingTypeString.QUART}>Quart</SelectItem>
                                <SelectItem value={AnimationEasingTypeString.EXPO}>Expo</SelectItem>
                                <SelectItem value={AnimationEasingTypeString.CIRC}>Circ</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className='w-full flex flex-row space-x-4'>
                            <div className='w-full flex-col'>
                                <div className="text-base font-semibold pt-2 py-1">Frame Selector</div>
                                <div className="flex flex-row w-full pb-1 space-x-2">
                                    <div className="flex flex-row justify-center items-center text-center">
                                        <Button onClick={() => handleFirstFrame()}>First</Button>
                                    </div>
                                    <div className="flex flex-row justify-center items-center text-center">
                                        <Button onClick={() => handlePrevFrame()}>Prev</Button>
                                    </div>
                                    <div className="flex flex-row justify-center items-center text-center">
                                        <Button onClick={() => handleNextFrame()}>Next</Button>
                                    </div>
                                    <div className="flex flex-row justify-center items-center text-center">
                                        <Button onClick={() => handleLastFrame()}>Last</Button>
                                    </div>
                                </div>
                            </div>
                            <div className='w-full flex-col'>
                                <div className="text-base font-semibold pt-2 py-1">FPS</div>
                                <div className="flex flex-row w-full pb-1 space-x-2">
                                    <Input
                                        disabled={disableTRS}
                                        className="h-10 bg-gray-800 border-none"
                                        type="number"
                                        placeholder="0"
                                        value={isNaN(fps) ? '' : fps}
                                        onChange={(e) => handleFPSChange(e)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <Separator className="w-full" />

                    {/* Tree */}
                    <div className="w-full h-auto p-6 py-4 pt-4 space-y-1">
                        <div className="text-lg font-semibold pb-2">🌲 Component Tree</div>
                        <div className="flex flex-col w-full h-auto px-3 overflow-x-hidden">
                            {gltfStateRef.current && gltfStateRef.current.CurrentScene && gltfStateRef.current.CurrentScene.roots.map((root, index) => (
                                <NodeView key={index} node={root} selectedNode={currentNode} clickCallback={handleNodeChange} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className='w-auto h-full flex flex-col mx-[1px] gap-[1px]'>
                    <div className='w-full h-1/2'>
                        <canvas ref={canvasRef} className="w-full h-full" />
                    </div>
                    <div className='w-full h-1/2'>
                        <canvas ref={secondCanvasRef} className="w-full h-full" />
                    </div>
                </div>

                {/* Right controller */}
                <div className="w-[400px] bg-gray-700 overflow-y-auto h-full text-white ">
                    {/* TRS */}
                    <div className="w-full p-6 py-4 pt-5 space-y-1">
                        <div className="text-lg font-semibold pb-2">🎯 Translation, Rotation, and Scale</div>
                        <div className="text-base font-semibold pb-1">Translation</div>
                        <div className="flex flex-row w-full pb-1 space-x-2">
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">X</div>
                                <div className="w-3/4">
                                    <Input
                                        disabled={disableTRS}
                                        className="h-10 bg-gray-800 border-none"
                                        type="number"
                                        placeholder="0"
                                        value={isNaN(translation.x) ? '' : translation.x}
                                        onChange={(e) => handleInputChange(e, 'translation', 'x')}
                                    />
                                </div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Y</div>
                                <div className="w-3/4">
                                    <Input
                                        disabled={disableTRS}
                                        className="h-10 bg-gray-800 border-none"
                                        type="number"
                                        placeholder="0"
                                        value={isNaN(translation.y) ? '' : translation.y}
                                        onChange={(e) => handleInputChange(e, 'translation', 'y')}
                                    />
                                </div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Z</div>
                                <div className="w-3/4">
                                    <Input
                                        disabled={disableTRS}
                                        className="h-10 bg-gray-800 border-none"
                                        type="number"
                                        placeholder="0"
                                        value={isNaN(translation.z) ? '' : translation.z}
                                        onChange={(e) => handleInputChange(e, 'translation', 'z')}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="text-base font-semibold pb-1">Rotation</div>
                        <div className="flex flex-row w-full pb-1">
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">X</div>
                                <div className="w-3/4">
                                    <Input
                                        disabled={disableTRS}
                                        className="h-10 bg-gray-800 border-none"
                                        type="number"
                                        placeholder="0"
                                        value={isNaN(rotation.x) ? '' : rotation.x}
                                        onChange={(e) => handleInputChange(e, 'rotation', 'x')}
                                    />
                                </div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Y</div>
                                <div className="w-3/4">
                                    <Input
                                        disabled={disableTRS}
                                        className="h-10 bg-gray-800 border-none"
                                        type="number"
                                        placeholder="0"
                                        value={isNaN(rotation.y) ? '' : rotation.y}
                                        onChange={(e) => handleInputChange(e, 'rotation', 'y')}
                                    />
                                </div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Z</div>
                                <div className="w-3/4">
                                    <Input
                                        disabled={disableTRS}
                                        className="h-10 bg-gray-800 border-none"
                                        type="number"
                                        placeholder="0"
                                        value={isNaN(rotation.z) ? '' : rotation.z}
                                        onChange={(e) => handleInputChange(e, 'rotation', 'z')}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="text-base font-semibold pb-1">Scale</div>
                        <div className="flex flex-row w-full pb-1">
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">X</div>
                                <div className="w-3/4">
                                    <Input
                                        disabled={disableTRS}
                                        className="h-10 bg-gray-800 border-none"
                                        type="number"
                                        placeholder="0"
                                        value={isNaN(scale.x) ? '' : scale.x}
                                        onChange={(e) => handleInputChange(e, 'scale', 'x')}
                                    />
                                </div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Y</div>
                                <div className="w-3/4">
                                    <Input
                                        disabled={disableTRS}
                                        className="h-10 bg-gray-800 border-none"
                                        type="number"
                                        placeholder="0"
                                        value={isNaN(scale.y) ? '' : scale.y}
                                        onChange={(e) => handleInputChange(e, 'scale', 'y')}
                                    />
                                </div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Z</div>
                                <div className="w-3/4">
                                    <Input
                                        disabled={disableTRS}
                                        className="h-10 bg-gray-800 border-none"
                                        type="number"
                                        placeholder="0"
                                        value={isNaN(scale.z) ? '' : scale.z}
                                        onChange={(e) => handleInputChange(e, 'scale', 'z')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <Separator className="w-full" />

                    {/* Camera */}
                    <div className="w-full p-6 py-4 space-y-1">
                        <div className="text-lg font-semibold pb-2">📷 Main Camera</div>
                        <div className="text-base font-semibold pb-1">Camera Mode</div>
                        <Select value={camera.type} onValueChange={handleCameraModeChange}>
                            <SelectTrigger className="w-full h-10 bg-gray-800 border-none">
                                <SelectValue placeholder="Choose Camera Mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={CameraTypeString.ORTHOGRAPHIC}>Orthographic</SelectItem>
                                <SelectItem value={CameraTypeString.OBLIQUE}>Oblique</SelectItem>
                                <SelectItem value={CameraTypeString.PERSPECTIVE}>Perspective</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="text-base font-semibold py-2 flex flex-row w-full">
                            <div className="w-1/3">Zoom</div>
                            <input
                                className="w-2/3"
                                type="range"
                                min={0.001}
                                max={5.000}
                                step={0.001}
                                value={camera.zoom}

                                onChange={handleCameraZoomChange}
                            />
                        </div>

                        {camera.type === CameraTypeString.OBLIQUE && (
                            <div className="text-base font-semibold py-2 flex flex-row w-full">
                                <div className="w-1/3">Horizontal Angle</div>
                                <input
                                    className="w-2/3"
                                    type="range"
                                    min="-90"
                                    max="90"
                                    value={camera.obliqueAngleX}
                                    onChange={handleObliqueHorizontalAngleChange}
                                />
                            </div>
                        )}

                        {camera.type === CameraTypeString.OBLIQUE && (
                            <div className="text-base font-semibold pt-1 pb-2 flex flex-row w-full">
                                <div className="w-1/3">Vertical Angle</div>
                                <input
                                    className="w-2/3"
                                    type="range"
                                    min="-90"
                                    max="90"
                                    value={camera.obliqueAngleY}
                                    onChange={handleObliqueVerticalAngleChange}
                                />
                            </div>
                        )}

                        <div className="text-base font-semibold pb-1">Camera Position</div>
                        <Button onClick={resetCameraPosition} className="h-full w-full border-none rounded-0">↩️ Reset</Button>

                    </div>

                    {/* Separator */}
                    <Separator className="w-full" />

                    {/* Second Camera */}
                    <div className="w-full p-6 py-4 space-y-1">
                        <div className="text-lg font-semibold pb-2">📷 Second Camera</div>
                        <div className="text-base font-semibold pb-1">Camera Mode</div>
                        <Select value={secondCamera.type} onValueChange={handleSecondCameraModeChange}>
                            <SelectTrigger className="w-full h-10 bg-gray-800 border-none">
                                <SelectValue placeholder="Choose Camera Mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={CameraTypeString.ORTHOGRAPHIC}>Orthographic</SelectItem>
                                <SelectItem value={CameraTypeString.OBLIQUE}>Oblique</SelectItem>
                                <SelectItem value={CameraTypeString.PERSPECTIVE}>Perspective</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="text-base font-semibold py-2 flex flex-row w-full">
                            <div className="w-1/3">Zoom</div>
                            <input
                                className="w-2/3"
                                type="range"
                                min={0.001}
                                max={5.000}
                                step={0.001}
                                value={secondCamera.zoom}

                                onChange={handleSecondCameraZoomChange}
                            />
                        </div>

                        {secondCamera.type === CameraTypeString.OBLIQUE && (
                            <div className="text-base font-semibold py-2 flex flex-row w-full">
                                <div className="w-1/3">Horizontal Angle</div>
                                <input
                                    className="w-2/3"
                                    type="range"
                                    min="-90"
                                    max="90"
                                    value={secondCamera.obliqueAngleX}
                                    onChange={handleSecondObliqueHorizontalAngleChange}
                                />
                            </div>
                        )}

                        {secondCamera.type === CameraTypeString.OBLIQUE && (
                            <div className="text-base font-semibold pt-1 pb-2 flex flex-row w-full">
                                <div className="w-1/3">Vertical Angle</div>
                                <input
                                    className="w-2/3"
                                    type="range"
                                    min="-90"
                                    max="90"
                                    value={secondCamera.obliqueAngleY}
                                    onChange={handleSecondObliqueVerticalAngleChange}
                                />
                            </div>
                        )}

                        <div className="text-base font-semibold pb-1">Camera Position</div>
                        <Button onClick={resetSecondCameraPosition} className="h-full w-full border-none rounded-0">↩️ Reset</Button>

                    </div>

                    {/* Separator */}
                    <Separator className="w-full" />

                    {/* Shader */}
                    <div className="w-full p-6 py-4 pb-6 space-y-1">
                        <div className="text-lg font-semibold pb-2">🎨 Shader</div>
                        <div className="flex flex-row justify-between">   
                            <Label htmlFor="shader-switch" className='text-base'>Phong Shader</Label>
                            <Switch
                                id="shader-switch"
                                checked={shader.phongEnabled}
                                className='data-[state=checked]:bg-gray-200 data-[state=unchecked]:bg-gray-800'
                                onCheckedChange={toggleShader}
                            />
                        </div>
                    </div>

                    {/* Separator */}
                    <Separator className="w-full" />

                    {/* Materials */}
                    {currentNodeRef.current && currentNodeRef.current.mesh &&
                        <div className="w-full p-6 py-4">
                            <div className="text-lg font-semibold pb-2">👚 Materials</div>
                            {!shader.phongEnabled && (
                                <div className='flex flex-col items-center'>
                                {!shader.phongEnabled && materialList.basics.map((material, idx) =>
                                    <div key={idx}>
                                        <Label htmlFor='basic-color-picker' className="text-base font-semibold pb-1 text-center">{material.name}</Label>
                                        <RgbaColorPicker
                                            id='basic-color-picker'
                                            className='mt-3' 
                                            color={colorToRgba(material.color)} 
                                            onChange={(color) => handleBasicColorChange(material, color as RgbaColor)} />
                                    </div>
                                )}
                                </div>
                            )}
                            
                            {shader.phongEnabled && (
                                <div className="w-full">  
                                {materialList.phongs.map((material, idx) =>
                                    <div key={idx} className='w-full flex flex-col items-center'>
                                        <div className="text-base font-semibold pb-1 text-center mb-2">[{material.name}]</div>

                                        <Label htmlFor='diffuse-color-picker' className="text-base font-semibold pb-1 text-center">Diffuse Color</Label>
                                        <RgbaColorPicker
                                            id='diffuse-color-picker'
                                            className='mt-3' 
                                            color={colorToRgba(material.diffuseColor)} 
                                            onChange={(color) => handleDiffuseColorChange(material, color as RgbaColor)} />

                                        {/* Separator */}
                                        <Separator className="w-full my-5" />

                                        <Label htmlFor='ambient-color-picker' className="text-base font-semibold pb-1 text-center">Ambient Color</Label>
                                        <RgbaColorPicker
                                            id='ambient-color-picker'
                                            className='mt-3' 
                                            color={colorToRgba(material.ambientColor)} 
                                            onChange={(color) => handleAmbientColorChange(material, color as RgbaColor)} />

                                        {/* Separator */}
                                        <Separator className="w-full my-5" />

                                        <Label htmlFor='specular-color-picker' className="text-base font-semibold pb-1 text-center">Specular Color</Label>
                                        <RgbaColorPicker
                                            id='specular-color-picker'
                                            className='mt-3' 
                                            color={colorToRgba(material.specularColor)} 
                                            onChange={(color) => handleSpecularColorChange(material, color as RgbaColor)} />

                                        {/* Separator */}
                                        <Separator className="w-full my-5" />

                                        <div className='flex flex-row justify-between w-full'>
                                            <Label htmlFor='shininess' className="text-base font-semibold pb-1 w-1/3">Shininess</Label>
                                            <input
                                                className="w-2/3"
                                                type="range"
                                                min="0"
                                                max="200"
                                                defaultValue={material.shininess}
                                                onChange={(e) => handleShininessChange(material, parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                )} 
                            </div>
                        )}
                
                    </div>}
                </div>
            </div>
        </main>
    );
}