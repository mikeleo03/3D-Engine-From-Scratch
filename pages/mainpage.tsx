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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GLTFState } from '@/lib/data/GLTFState';
import { GLContainer } from '@/lib/cores';
import { ObliqueCamera, OrthographicCamera, PerspectiveCamera } from '@/lib/data/components/cameras';
import { SceneNode } from '@/lib/data/SceneNode';
import { GLRenderer } from '@/lib/rendering/GLRenderer';
import { GLTFParser } from '@/lib/data/GLTFParser';
import { RenderManager } from '@/lib/rendering/RenderManager';
import { FileUtil } from '@/lib/utils/FileUtil';
import { AnimationRunner } from "@/lib/data/components/animations";
import { Quaternion, Vector3 } from '@/lib/data/math';
import { CameraTypeString } from '@/lib/data/types/gltftypes';
import NodeView from '@/components/NodeView';

type Axis = 'x' | 'y' | 'z';
type TRSType = 'translation' | 'rotation' | 'scale';
interface TRS {
    x: number;
    y: number;
    z: number;
}

interface CameraState {
    type: CameraTypeString;
    distance: number;
    angle: number;
}

interface ShaderState {
    enabled: boolean;
}

const gltfParser = new GLTFParser();

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [translation, setTranslation] = useState<TRS>({ x: 0, y: 0, z: 0 });
    const [rotation, setRotation] = useState<TRS>({ x: 0, y: 0, z: 0 });
    const [scale, setScale] = useState<TRS>({ x: 1, y: 1, z: 1 });
    const [camera, setCamera] = useState<CameraState>({ type: CameraTypeString.PERSPECTIVE, distance: 0, angle: 0 });
    const [shader, setShader] = useState<ShaderState>({ enabled: false });
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReversing, setIsReversing] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [easingMode, setEasingMode] = useState({ mode: "Linear" });
    const [currentNode, setCurrentNode] = useState<SceneNode>();

    const glContainerRef = useRef<GLContainer>();
    const glRendererRef = useRef<GLRenderer>();
    const renderManagerRef = useRef<RenderManager>();
    const gltfStateRef = useRef<GLTFState>();
    const cameraNodesRef = useRef<SceneNode[]>([]);
    const animationRunnersRef = useRef<AnimationRunner[]>([]);
    const currentNodeRef = useRef<SceneNode>();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, type: TRSType, axis: Axis) => {
        if (e.target.value !== null && e.target.value !== undefined) {
            let value = parseFloat(e.target.value);

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

            if (isNaN(value))
            {
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

    const changeCurrentCamera = (type: CameraTypeString) => {
        const currentScene = gltfStateRef.current?.CurrentScene;

        if (!currentScene) {
            return;
        }

        const cameras = currentScene.cameras;

        for (const cameraNode of cameras) {
            if (cameraNode.camera && cameraNode.camera.type === type) {
                currentScene.setActiveCameraNode(cameraNode);
                break;
            }
        }

        console.log(currentScene.getActiveCameraNode()?.camera)
    }

    const handleCameraModeChange = (type: string) => {
       
        const value = type as CameraTypeString;

        setCamera(prevState => ({ ...prevState, type: value }));

        changeCurrentCamera(value);
    };

    const handleDistanceChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCamera(prevState => ({ ...prevState, distance: parseInt(e.target.value) }));
    };

    const handleAngleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCamera(prevState => ({ ...prevState, angle: parseInt(e.target.value) }));
    };

    const toggleShader = () => {
        setShader(prevState => ({ enabled: !prevState.enabled }));
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

    const handleEasingModeChange: React.FormEventHandler<HTMLDivElement> = (e) => {
        setEasingMode({ mode: (e.target as HTMLSelectElement).value });
    };

    const handleNodeChange = (node: SceneNode) => {
        if (node.camera) {
            return;
        }

        currentNodeRef.current = node;
        setCurrentTRS();
    }

    const setCurrentTRS = () => {
        if (!currentNodeRef.current) {
            return;
        }

        setTranslation({
            x: currentNodeRef.current.position.X,
            y: currentNodeRef.current.position.Y,
            z: currentNodeRef.current.position.Z
        });

        const degrees = currentNodeRef.current.rotation.toDegrees();
       
        setRotation({
            x: degrees.X,
            y: degrees.Y,
            z: degrees.Z
        });

        setScale({
            x: currentNodeRef.current.scale.X,
            y: currentNodeRef.current.scale.Y,
            z: currentNodeRef.current.scale.Z
        });
    }

    const setCurrentCamera = () => {
        const currentScene = gltfStateRef.current?.CurrentScene;

        if (!currentScene) {
            return;
        }

        const cameraNode = currentScene.getActiveCameraNode();

        if (!cameraNode) {
            return;
        }

        const camera = cameraNode.camera;

        if (!camera) {
            return;
        }

        // todo: UPDATE distance dan angle
        setCamera(prevState => ({ ...prevState, type: camera.type }));
    }

    const setNewState = (newState: GLTFState) => {
        gltfStateRef.current = newState;

        console.log(newState);

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

        setCurrentCamera();

        for (const root of currentScene.roots) {
            if (!root.camera) {
                currentNodeRef.current = root;
                setCurrentTRS();
                break;
            }
        }

        if (renderManagerRef.current) {
            renderManagerRef.current.stop();
        }

        renderManagerRef.current = new RenderManager(newState, glRendererRef.current!!);
        renderManagerRef.current.loop();

        const animations = newState.animations;

        for (const animation of animations) {
            const animationRunner = new AnimationRunner();
            animationRunnersRef.current.push(animationRunner);
            animationRunner.setAnimation(animation);
        }

        console.log(currentScene.nodes)
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

                renderManagerRef.current = new RenderManager(gltfState, glRendererRef.current!!);
                renderManagerRef.current.loop();

                await setNewState(gltfState);
            }
        }

        input.click();
    }

    const exportFile = async () => {
        const gltfState = gltfStateRef.current;
        if (!gltfState) {
            return;
        }

        const gltf = gltfParser.write(gltfState);

        FileUtil.downloadFile(gltf);
    }

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const initializeGL = async () => {
            const glContainer = new GLContainer(canvas);

            const orthographicCamera = new OrthographicCamera(
                1,
                -1,
                -1,
                1,
                0.01,
                1000
            );

            const perspectiveCamera = new PerspectiveCamera(
                canvas.width / canvas.height,
                60,
                0.01,
                1000
            );

            const obliqueCamera = new ObliqueCamera(
                1,
                -1,
                -1,
                1,
                0.01,
                100,
                20
            );

            const cameraNodes = [
                new SceneNode({camera: orthographicCamera}),
                new SceneNode({camera: perspectiveCamera}),
                new SceneNode({camera: obliqueCamera})
            ]

            const glRenderer = new GLRenderer(glContainer);
            const animationRunner = new AnimationRunner();

            glContainerRef.current = glContainer;
            glRendererRef.current = glRenderer;
            cameraNodesRef.current = cameraNodes;
        };

        initializeGL();
    }, [canvasRef.current]);

    useEffect(() => {
        setCurrentNode(currentNodeRef.current);
    }, [currentNodeRef.current]);

    const handleNextFrame = () => {
        for (const animationRunner of animationRunnersRef.current) {
            animationRunner.nextFrame();
        }
    }

    const handlePrevFrame = () => {
        for (const animationRunner of animationRunnersRef.current) {
            animationRunner.prevFrame();
        }
    }

    const handleFirstFrame = () => {
        for (const animationRunner of animationRunnersRef.current) {
            animationRunner.firstFrame();
        }
    }

    const handleLastFrame = () => {
        for (const animationRunner of animationRunnersRef.current) {
            animationRunner.lastFrame();
        }
    }

    return (
        <main className="flex flex-col h-screen w-full bg-[#F2FBFA]">
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
                    <div className="w-full p-6 py-4 pt-4">
                        <div className="text-lg font-semibold pb-2">🎞️ Animation Controller</div>
                        <div className="text-base font-semibold pb-1">Animation</div>
                        <div className="flex flex-row w-full pb-1 space-x-2">
                            <Button onClick={togglePlay}>{isPlaying ? '⏸️ Pause' : '▶️ Play'}</Button>
                            <Button onClick={toggleReverse}>{isReversing ? '⏭ Forward' : '⏮ Reverse'}</Button>
                            <Button onClick={toggleLoop}>{isLooping ? '🔂 Stop' : '🔁 Loop'}</Button>
                        </div>
                        <div className="text-base font-semibold py-1">Easing Functions</div>
                        <Select>
                            <SelectTrigger className="w-full h-8 bg-gray-800 border-none">
                                <SelectValue placeholder="Choose Easing Functions" />
                            </SelectTrigger>
                            <SelectContent onChange={handleEasingModeChange}>
                                <SelectItem value="Linear">Linear</SelectItem>
                                <SelectItem value="Sine">Sine</SelectItem>
                                <SelectItem value="Quad">Quad</SelectItem>
                                <SelectItem value="Cubic">Cubic</SelectItem>
                                <SelectItem value="Quart">Quart</SelectItem>
                                <SelectItem value="Expo">Expo</SelectItem>
                                <SelectItem value="Circ">Circ</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="text-base font-semibold pt-2 py-1">Frame Selector</div>
                        <div className="flex flex-row w-full pb-1 space-x-2">
                            <div className="flex flex-row justify-center items-center text-center">
                                <Button onClick={() => handleNextFrame()}>Next</Button>
                            </div>
                            <div className="flex flex-row justify-center items-center text-center">
                                <Button onClick={() => handlePrevFrame()}>Prev</Button>
                            </div>
                            <div className="flex flex-row justify-center items-center text-center">
                                <Button onClick={() => handleFirstFrame()}>First</Button>
                            </div>
                            <div className="flex flex-row justify-center items-center text-center">
                                <Button onClick={() => handleLastFrame()}>Last</Button>
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <Separator className="w-full" />

                    {/* Tree */}
                    <div className="w-full h-auto p-6 py-4 pt-4">
                        <div className="text-lg font-semibold pb-2">🌲 Component Tree</div>
                        <div className="flex flex-col w-full h-auto px-3 overflow-x-hidden">
                            {gltfStateRef.current && gltfStateRef.current.CurrentScene && gltfStateRef.current.CurrentScene.roots.map((root, index) => (
                                !root.camera && <NodeView key={index} node={root} selectedNode={currentNode} clickCallback={handleNodeChange} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className='w-auto h-full'>
                    <canvas ref={canvasRef} className="h-full w-full" />
                </div>

                {/* Right controller */}
                <div className="w-[390px] bg-gray-700 overflow-y-auto h-full text-white ">
                    {/* TRS */}
                    <div className="w-full p-6 py-4 pt-5">
                        <div className="text-lg font-semibold pb-2">🎯 Translation, Rotation, and Scale</div>
                        <div className="text-base font-semibold pb-1">Translation</div>
                        <div className="flex flex-row w-full pb-1 space-x-2">
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">X</div>
                                <div className="w-3/4">
                                    <Input
                                        className="h-8 bg-gray-800 border-none"
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
                                        className="h-8 bg-gray-800 border-none"
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
                                        className="h-8 bg-gray-800 border-none"
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
                                        className="h-8 bg-gray-800 border-none"
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
                                        className="h-8 bg-gray-800 border-none"
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
                                        className="h-8 bg-gray-800 border-none"
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
                                        className="h-8 bg-gray-800 border-none"
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
                                        className="h-8 bg-gray-800 border-none"
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
                                        className="h-8 bg-gray-800 border-none"
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
                    <div className="w-full p-6 py-4">
                        <div className="text-lg font-semibold pb-2">📷 Camera</div>
                        <div className="text-base font-semibold pb-1">Camera Mode</div>
                        <Select value={camera.type} onValueChange={handleCameraModeChange}>
                            <SelectTrigger className="w-full h-8 bg-gray-800 border-none">
                                <SelectValue placeholder="Choose Camera Mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={CameraTypeString.ORTHOGRAPHIC}>Orthographic</SelectItem>
                                <SelectItem value={CameraTypeString.OBLIQUE}>Oblique</SelectItem>
                                <SelectItem value={CameraTypeString.PERSPECTIVE}>Perspective</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="text-base font-semibold py-2 flex flex-row w-full">
                            <div className="w-1/3">Distance</div>
                            <input
                                className="w-2/3"
                                type="range"
                                min="0"
                                max="100"
                                value={camera.distance}
                                onChange={handleDistanceChange}
                            />
                        </div>
                        <div className="text-base font-semibold pt-1 pb-2 flex flex-row w-full">
                            <div className="w-1/3">Angle</div>
                            <input
                                className="w-2/3"
                                type="range"
                                min="0"
                                max="360"
                                value={camera.angle}
                                onChange={handleAngleChange}
                            />
                        </div>
                    </div>

                    {/* Separator */}
                    <Separator className="w-full" />

                    {/* Scene */}
                    <div className="text-base font-semibold flex flex-row justify-between w-full p-6 py-4">
                        <div className="text-lg font-semibold pb-2">🖼️ Scene</div>
                        <div className="flex items-center space-x-3">
                            <Switch
                                id="shader-switch"
                                checked={shader.enabled}
                                onChange={toggleShader}
                            />
                            {/* <Switch
                                id="shader-switch"
                                className="w-10"
                                checked={shader.enabled}
                                onChange={toggleShader}
                            /> */}
                            <input
                                type="checkbox"
                                id="shader-switch"
                                checked={shader.enabled}
                                onChange={toggleShader}
                            />
                            <Label htmlFor="shader-switch">Shader</Label>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}