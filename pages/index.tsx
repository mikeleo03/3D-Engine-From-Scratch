import { useState } from 'react';
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [translation, setTranslation] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });

  const handleRotationChange = (axis, value) => {
    setRotation(prev => ({ ...prev, [axis]: parseInt(value) }));
    updateWebGLTransform();
  };

  const handleTranslationChange = (axis, value) => {
    setTranslation(prev => ({ ...prev, [axis]: parseInt(value) }));
    updateWebGLTransform();
  };

  const handleScaleChange = (axis, value) => {
    setScale(prev => ({ ...prev, [axis]: parseFloat(value) }));
    updateWebGLTransform();
  };

  const updateWebGLTransform = () => {
    console.log('Updating WebGL with:', { rotation, translation, scale });
  };

  const handleLoad = (event) => {
    // Implementasi untuk load data
    console.log("Load data...");
  };

  const handleSave = () => {
    // Implementasi untuk save data
    console.log("Save data...");
  };

  const handleReset = () => {
    setRotation({ x: 0, y: 0, z: 0 });
    setTranslation({ x: 0, y: 0, z: 0 });
    setScale({ x: 1, y: 1, z: 1 });
    updateWebGLTransform();
  };

  return (
    <div className="app-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "stretch" }}>
      <div className="sidebar left-sidebar w-[90%] bg-gray-800 text-white p-4" style={{ flex: 1, margin: 10 }}>
        <h1 className="text-lg font-bold">WebGL 3D Engine</h1>

        <div className="flex justify-between mt-4">
          <div className="mt-4">
            <h2 className="font-semibold">Projection</h2>
            <select id="projection-type" className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight cursor-pointer focus:outline-none focus:border-black">
              <option value="orthographic">Orthographic</option>
              <option value="perspective">Perspective</option>
              <option value="oblique">Oblique</option>
            </select>
          </div>

          <div className="ml-10 mt-4">
            <h2 className="font-semibold">Shape</h2>
            <select id="projection-type" name="projection-type"
              className="block appearance-none w-30 bg-white border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight cursor-pointer focus:outline focus:border-black">
              <option>Shape1</option>
              <option>Shape2</option>
              <option>Shape3</option>
              <option>Shape4</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold">Transformation</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label>Rotate</label>
              <div>
                <input type="range" min="-1000" max="1000" value={rotation.x} onChange={e => handleRotationChange('x', e.target.value)} className="w-full mt-1" />
                <input type="range" min="-1000" max="1000" value={rotation.y} onChange={e => handleRotationChange('y', e.target.value)} className="w-full mt-1" />
                <input type="range" min="-1000" max="1000" value={rotation.z} onChange={e => handleRotationChange('z', e.target.value)} className="w-full mt-1" />
              </div>
            </div>

            <div>
              <label>Translate</label>
              <div>
                <input type="range" min="0" max="360" value={translation.x} onChange={e => handleTranslationChange('x', e.target.value)} className="w-full mt-1" />
                <input type="range" min="0" max="360" value={translation.y} onChange={e => handleTranslationChange('y', e.target.value)} className="w-full mt-1" />
                <input type="range" min="0" max="360" value={translation.z} onChange={e => handleTranslationChange('z', e.target.value)} className="w-full mt-1" />
              </div>
            </div>

            <div>
              <label>Scale</label>
              <div>
                <input type="range" min="0" max="10" step="0.1" value={scale.x} onChange={e => handleScaleChange('x', e.target.value)} className="w-full mt-1" />
                <input type="range" min="0" max="10" step="0.1" value={scale.y} onChange={e => handleScaleChange('y', e.target.value)} className="w-full mt-1" />
                <input type="range" min="0" max="10" step="0.1" value={scale.z} onChange={e => handleScaleChange('z', e.target.value)} className="w-full mt-1" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold">Camera Controls</h2>
          <div className="flex items-center justify-between my-2">
            <label>Angle</label>
            <input type="range" min="0" max="360" defaultValue="0" className="w-2/3" />
          </div>
          <div className="flex items-center justify-between my-2">
            <label>Radius</label>
            <input type="range" min="0" max="1000" defaultValue="0" className="w-2/3" />
          </div>
        </div>

        <div className="flex mt-4">
          <div className="mt-4">
            <h2 className="font-semibold">Animation</h2>
            <input type="radio" name="animation" id="play" /> <label htmlFor="play">Play</label><br />
            <input type="radio" name="animation" id="pause" /> <label htmlFor="pause">Pause</label><br />
            <input type="radio" name="animation" id="reverse" /> <label htmlFor="reverse">Reverse</label><br />
            <input type="radio" name="animation" id="autoReplay" /> <label htmlFor="autoReplay">Auto-replay</label><br />
          </div>

          <div className="ml-20 mt-4">
            <h2 className="font-semibold">Frame</h2>
            <input type="radio" name="frame" id="next" /> <label htmlFor="next">Next</label><br />
            <input type="radio" name="frame" id="previous" /> <label htmlFor="previous">Previous</label><br />
            <input type="radio" name="frame" id="first" /> <label htmlFor="first">First</label><br />
            <input type="radio" name="frame" id="last" /> <label htmlFor="last">Last</label><br />
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold">Option</h2>
          <div className="flex flex-col space-y-2">
            <button onClick={handleLoad} className="px-2 py-1 bg-white text-gray-800 border border-gray-300 rounded shadow hover:bg-gray-100">Load</button>
            <button onClick={handleSave} className="px-2 py-1 bg-white text-gray-800 border border-gray-300 rounded shadow hover:bg-gray-100">Save</button>
            <button onClick={handleReset} className="px-2 py-1 bg-red-500 rounded shadow hover:bg-red-700">Reset</button>
          </div>
        </div>
      </div>

      <div className="canvas flex-grow p-4 " style={{ flex: 3, margin: 10, backgroundColor: "#fff" }}>
        <canvas id="webgl-canvas" className=" outline w-[95%] h-[70%]"></canvas>
      </div>

      <div className="sidebar right-sidebar w-1/4 bg-gray-800 text-white p-4 overflow-y-auto" style={{ flex: 1, margin: 10 }}>
        <div className="mt-4">
          <h2 className="font-semibold">Component Tree</h2>
          <div className="flex flex-col space-y-2">
            <button className="bg-white text-gray-800 border border-gray-300 rounded shadow hover:bg-gray-100">RBody</button>
            <button className="bg-white text-gray-800 border border-gray-300 rounded shadow hover:bg-gray-100">PBody</button>
            <button className="bg-white text-gray-800 border border-gray-300 rounded shadow hover:bg-gray-100">RHead</button>
            <button className="bg-white text-gray-800 border border-gray-300 rounded shadow hover:bg-gray-100">PHead</button>
            <button className="bg-white text-gray-800 border border-gray-300 rounded shadow hover:bg-gray-100">RArmL</button>
            <button className="bg-white text-gray-800 border border-gray-300 rounded shadow hover:bg-gray-100">PArmL</button>
            <button className="bg-white text-gray-800 border border-gray-300 rounded shadow hover:bg-gray-100">RArmR</button>
            <button className="bg-white text-gray-800 border border-gray-300 rounded shadow hover:bg-gray-100">PArmR</button>
            <button className="bg-white text-gray-800 border border-gray-300 rounded shadow hover:bg-gray-100">RLegL</button>
            <button className="bg-white text-gray-800 border border-gray-300 rounded shadow hover:bg-gray-100">PLegL</button>
            <button className="bg-white text-gray-800 border border-gray-300 rounded shadow hover:bg-gray-100">RLegR</button>
            <button className="bg-white text-gray-800 border border-gray-300 rounded shadow hover:bg-gray-100">PLegR</button>
          </div>
        </div>
      </div>
    </div>
  )
}
