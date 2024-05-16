import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export default function Home() {
    return (
        <main className="flex flex-col w-screen h-screen items-center justify-between">
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
                <div className="w-[40vw] bg-gray-700 h-full text-white">
                    {/* TRS */}
                    <div className="w-full p-6 py-5">
                        <div className="text-lg font-semibold pb-2">Position, Rotation, and Scale</div>
                        <div className="text-base font-semibold pb-1">Position</div>
                        <div className="flex flex-row w-full pb-2 space-x-2">
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">X</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number"/></div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Y</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number"/></div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Z</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number"/></div>
                            </div>
                        </div>
                        <div className="text-base font-semibold pb-1">Rotation</div>
                        <div className="flex flex-row w-full pb-2">
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">X</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number"/></div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Y</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number"/></div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Z</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number"/></div>
                            </div>
                        </div>
                        <div className="text-base font-semibold pb-1">Scale</div>
                        <div className="flex flex-row w-full pb-2">
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">X</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number"/></div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Y</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number"/></div>
                            </div>
                            <div className="w-1/3 flex flex-row justify-center items-center text-center">
                                <div className="w-1/4">Z</div>
                                <div className="w-3/4"><Input className="h-8 bg-gray-800 border-none" type="number"/></div>
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <Separator className="w-full"/>

                    
                </div>
            </div>
        </main>
    );
}