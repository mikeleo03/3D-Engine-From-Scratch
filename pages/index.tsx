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

export default function Home() {
    return (
        <main className="flex flex-col w-auto h-screen items-center justify-between">
            {/* Title */}
            <div className="h-[7vh] bg-gray-800 w-full text-white">
                Hai
            </div>

            {/* Navigation section */}
            <div className="h-[93vh] w-full flex flex-row">
                {/* Left controller */}
                <div className="w-[30vw] bg-gray-700 h-full">

                </div>

                {/* Canvas */}
                <canvas className="h-full w-auto"/>

                {/* Right controller */}
                <div className="w-[40vw] bg-gray-700 h-[93vh] overlow-y-auto text-white">
                    {/* TRS */}
                    <div className="w-full p-6 py-4 pt-5">
                        <div className="text-lg font-semibold pb-2">🎯 Position, Rotation, and Scale</div>
                        <div className="text-base font-semibold pb-1">Position</div>
                        <div className="flex flex-row w-full pb-1 space-x-2">
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">X</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number" placeholder="0"/></div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Y</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number" placeholder="0"/></div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Z</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number" placeholder="0"/></div>
                            </div>
                        </div>
                        <div className="text-base font-semibold pb-1">Rotation</div>
                        <div className="flex flex-row w-full pb-1">
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">X</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number" placeholder="0"/></div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Y</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number" placeholder="0"/></div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Z</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number" placeholder="0"/></div>
                            </div>
                        </div>
                        <div className="text-base font-semibold pb-1">Scale</div>
                        <div className="flex flex-row w-full pb-1">
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">X</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number" placeholder="0"/></div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Y</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number" placeholder="0"/></div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Z</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number" placeholder="0"/></div>
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
                            <SelectContent>
                                <SelectItem value="Orthographic">Orthographic</SelectItem>
                                <SelectItem value="Oblique">Oblique</SelectItem>
                                <SelectItem value="Perspective">Perspective</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="text-base font-semibold py-2 flex flex-row w-full">
                            <div className="w-1/3">Distance</div>
                            <input className="w-2/3" type="range" id="x" step="5" />
                        </div>
                        <div className="text-base font-semibold pt-1 pb-2 flex flex-row w-full">
                            <div className="w-1/3">Angle</div>
                            <input className="w-2/3" type="range" id="x" step="5" />
                        </div>
                    </div>

                    {/* Separator */}
                    <Separator className="w-full"/>

                    {/* Scene */}
                    <div className="w-full p-6 py-4">
                    <div className="text-base font-semibold py-2 flex flex-col w-full">
                        <div className="w-full justify-between flex flex-row">
                            <div className="text-lg font-semibold pb-2">🖼️ Scene</div>
                            <div className="flex items-center space-x-3">
                                <Switch className="w-10" id="airplane-mode" />
                                <Label htmlFor="airplane-mode">Shader</Label>
                            </div>
                        </div>
                        {/* <div className="text-base font-semibold py-2 flex flex-row w-full">
                            <div className="w-1/3">Color</div>
                            <input type="color" className="color-option w-2/3" id="color-option" value="#000000"/>
                        </div> */}
                    </div>
                </div>
            </div>
            </div>
        </main>
    );
}