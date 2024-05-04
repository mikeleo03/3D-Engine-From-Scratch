
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-1/4 bg-gray-800 text-white p-4">
        <h1 className="text-lg font-bold">WebGL 3D Engine</h1>
        <div className="mt-4">
          <h2 className="font-semibold">Projection</h2>
          <select id="projection-type" name="projection-type"
            className="block appearance-none w-30 bg-white border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight cursor-pointer focus:outline focus:border-black">
            <option>Orthographic</option>
            <option>Perspective</option>
            <option>Oblique</option>
          </select>
        </div>
        <div className="mt-4">
          <h2 className="font-semibold">Load Model</h2>
          <input type="file" className="mt-2 text-sm text-gray-800" />
        </div>
        <div className="mt-4">
          <h2 className="font-semibold">Camera Controls</h2>
          <button className="mt-2 px-4 py-2 bg-blue-500 rounded hover:bg-blue-700">Reset Camera</button>
        </div>
        <div className="mt-4">
          <h2 className="font-semibold">Animation Controls</h2>
          <button className="mt-2 px-4 py-2 bg-green-500 rounded hover:bg-green-700">Play</button>
          <button className="mt-2 px-4 py-2 bg-red-500 rounded hover:bg-red-700">Pause</button>
        </div>
      </aside>
      <main className="flex-grow p-4">
        <canvas id="webgl-canvas" className="bg-white outline w-full h-full"></canvas>
      </main>
    </div>
  )
}
