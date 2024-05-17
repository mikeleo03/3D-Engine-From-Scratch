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
import { JojoModel } from '@/lib/data/models/JojoModel';
import { Scene } from '@/lib/data/Scene';
import { GLTFParser } from '@/lib/data/GLTFParser';
import { RenderManager } from '@/lib/rendering/RenderManager';
import { FileUtil } from '@/lib/utils/FileUtil';

type Axis = 'x' | 'y' | 'z';
type TRSType = 'translation' | 'rotation' | 'scale';
interface TRS {
    x: number;
    y: number;
    z: number;
}

interface CameraState {
    mode: string;
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
    const [camera, setCamera] = useState<CameraState>({ mode: "Perspective", distance: 0, angle: 0 });
    const [shader, setShader] = useState<ShaderState>({ enabled: false });
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReversing, setIsReversing] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [easingMode, setEasingMode] = useState({ mode: "Linear" });

    const glContainerRef = useRef<GLContainer>();
    const glRendererRef = useRef<GLRenderer>();
    const renderManagerRef = useRef<RenderManager>();
    const gltfStateRef = useRef<GLTFState>();
    const cameraNodesRef = useRef<SceneNode[]>([]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, type: TRSType, axis: Axis) => {
        const value = parseFloat(e.target.value);
        if (type === 'translation') {
            setTranslation(prevState => ({ ...prevState, [axis]: value }));
        } else if (type === 'rotation') {
            setRotation(prevState => ({ ...prevState, [axis]: value }));
        } else if (type === 'scale') {
            setScale(prevState => ({ ...prevState, [axis]: value }));
        }

        console.log(translation);
        console.log(rotation);
        console.log(scale);
        // Process the value
    };

    const handleCameraModeChange: React.FormEventHandler<HTMLDivElement> = (e) => {
        setCamera(prevState => ({ ...prevState, mode: (e.target as HTMLSelectElement).value }));
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
                new SceneNode(undefined, undefined, undefined, undefined, undefined, orthographicCamera),
                new SceneNode(undefined, undefined, undefined, undefined, undefined, perspectiveCamera),
                new SceneNode(undefined, undefined, undefined, undefined, undefined, obliqueCamera)
            ]
            
            const glRenderer = new GLRenderer(glContainer);

            glContainerRef.current = glContainer;
            glRendererRef.current = glRenderer;
            cameraNodesRef.current = cameraNodes;
        };
    
        initializeGL();
    }, [canvasRef.current]);

    return (
        <main className="flex flex-col min-h-screen w-full bg-[#F2FBFA]">
            {/* Header Section */}
            <div className="bg-gray-800 w-full h-[8vh] sticky top-0 z-50 text-white flex justify-between">
                {/* Title Section */}
                <div className="flex items-center space-x-10 text-xl font-bold pl-3">⚙️  3D Engine from Scratch</div>

                {/* Save and Load Section */}
                <div className="flex items-center">
                    {/* Separator */}
                    <Separator className="h-auto w-[0.5px]"/>

                    {/* Clear Button */}
                    <Button className="h-auto w-full border-none rounded-0">🧹 Clear</Button>

                    {/* Separator */}
                    <Separator className="h-auto w-[0.5px]"/>

                    {/* Load Button */}
                    <Button onClick={importFile} className="h-full w-full border-none rounded-0">⬆️ Load</Button>

                    {/* Separator */}
                    <Separator className="h-auto w-[0.5px]"/>

                    {/* Clear Button */}
                    <Button onClick={exportFile} className="h-full w-full border-none rounded-0">💾 Save</Button>
                </div>
            </div>

            {/* Navigation section */}
            <div className="w-full flex flex-row h-full overlow-y-auto">
                {/* Left controller */}
                <div className="w-1/4 bg-gray-700 h-auto overlow-y-auto text-white">
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
                                <Button>Next</Button>
                            </div>
                            <div className="flex flex-row justify-center items-center text-center">
                                <Button>Prev</Button>
                            </div>
                            <div className="flex flex-row justify-center items-center text-center">
                                <Button>First</Button>
                            </div>
                            <div className="flex flex-row justify-center items-center text-center">
                                <Button>Last</Button>
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <Separator className="w-full"/>

                    {/* Tree */}
                    <div className="w-full h-auto p-6 py-4 pt-4">
                        <div className="text-lg font-semibold pb-2">🌲 Component Tree</div>
                        
                    </div>
                </div>

                {/* Canvas */}
                <canvas ref={canvasRef} className="w-1/2 h-auto"/>

                {/* Right controller */}
                <div className="w-1/4 bg-gray-700 overlow-y-auto text-white h-auto">
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
                                        value={translation.x}
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
                                        value={translation.y}
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
                                        value={translation.z}
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
                                        value={rotation.x}
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
                                        value={rotation.y}
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
                                        value={rotation.z}
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
                                        value={scale.x}
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
                                        value={scale.y}
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
                                        value={scale.z}
                                        onChange={(e) => handleInputChange(e, 'scale', 'z')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <Separator className="w-full"/>

                    {/* Camera */}
                    <div className="w-full p-6 py-4">
                        <div className="text-lg font-semibold pb-2">📷 Camera</div>
                        <div className="text-base font-semibold pb-1">Camera Mode</div>
                        <Select>
                            <SelectTrigger className="w-full h-8 bg-gray-800 border-none">
                                <SelectValue placeholder="Choose Camera Mode" />
                            </SelectTrigger>
                            <SelectContent onChange={handleCameraModeChange}>
                                <SelectItem value="Orthographic">Orthographic</SelectItem>
                                <SelectItem value="Oblique">Oblique</SelectItem>
                                <SelectItem value="Perspective">Perspective</SelectItem>
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
                    <Separator className="w-full"/>

                    {/* Scene */}
                    <div className="text-base font-semibold py-2 flex flex-row justify-between w-full p-6 py-4">
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