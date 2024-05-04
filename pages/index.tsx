
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
          <h2 className="font-semibold">Shape</h2>
          <select id="projection-type" name="projection-type"
            className="block appearance-none w-30 bg-white border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight cursor-pointer focus:outline focus:border-black">
            <option>Shape1</option>
            <option>Shape2</option>
            <option>Shape3</option>
          </select>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold">Transformation</h2>
          {/* Translate Sliders */}
          {['X', 'Y', 'Z'].map(axis => (
            <div key={`translate-${axis}`} className="flex items-center justify-between my-2">
              <label>Translate {axis}</label>
              <input type="range" min="-1000" max="1000" defaultValue="0" className="w-2/3" />
            </div>
          ))}
          {/* Angle Sliders */}
          {['X', 'Y', 'Z'].map(axis => (
            <div key={`angle-${axis}`} className="flex items-center justify-between my-2">
              <label>Angle {axis}</label>
              <input type="range" min="0" max="360" defaultValue="0" className="w-2/3" />
            </div>
          ))}
          {/* Scale Sliders */}
          {['X', 'Y', 'Z'].map(axis => (
            <div key={`scale-${axis}`} className="flex items-center justify-between my-2">
              <label>Scale {axis}</label>
              <input type="range" min="0" max="10" defaultValue="1" step="0.1" className="w-2/3" />
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h2 className="font-semibold">Camera Controls</h2>
          <div className="flex items-center justify-between my-2">
            <label>Angle</label>
            <input type="range" min="0" max="360" defaultValue="0" step="0.1" className="w-2/3" />
          </div>
          <div className="flex items-center justify-between my-2">
            <label>Radius</label>
            <input type="range" min="0" max="1000" defaultValue="0" step="0.1" className="w-2/3" />
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <div className="mt-4">
            <h2 className="font-semibold">Animation</h2>
            <button className="mt-2 px-4 py-2 bg-green-500 rounded hover:bg-green-700">On</button>
            <button className="mt-2 px-4 py-2 bg-red-500 rounded hover:bg-red-700">Off</button>
          </div>

          <div className="mt-4">
            <h2 className="font-semibold">Shading</h2>
            <button className="mt-2 px-4 py-2 bg-green-500 rounded hover:bg-green-700">On</button>
            <button className="mt-2 px-4 py-2 bg-red-500 rounded hover:bg-red-700">Off</button>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold">Load Model</h2>
          <input type="file" className="mt-2 text-sm text-gray-800" />
        </div>

      </aside>

      <main className="flex-grow p-4">
        <canvas id="webgl-canvas" className="bg-white outline w-full h-full"></canvas>
      </main>

    </div>
  )
}
