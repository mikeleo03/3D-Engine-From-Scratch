import { GLTFRawState } from "./GLTFRawState";
import { GLTFState } from "./GLTFState";
import { GLTFType } from "./types/gltftypes";

export class GLTFParser {
    public static readonly DEFAULT_FILENAME = 'scene.gltf';
    constructor() {
    }

    // Method to parse GLTF JSON data and create GLTFState object
    private parseGLTF(data: GLTFType): GLTFState {
        // Implementation to parse GLTF JSON data and create GLTFState object
        const raw = new GLTFRawState(
            data.buffers,
            data.bufferViews,
            data.accessors,
            data.materials,
            data.meshes,
            data.cameras,
            data.lights,
            data.nodes,
            data.scenes,
            data.animations,
            data.scene
        );

        return raw.toGLTFState();
    }

    parse(file: File): Promise<GLTFState>  {
        return new Promise<GLTFState>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result as string);
                    const gltfState = this.parseGLTF(data);
                    resolve(gltfState);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsText(file);
        });
    }

    // Write method to convert GLTFState object to a File
    write(state: GLTFState): File {
        // Implementation of write method
        // Convert GLTFState to JSON string
        const raw = GLTFRawState.fromGLTFState(state)
        const jsonObject: GLTFType = {
            buffers: raw.buffers,
            bufferViews: raw.bufferViews,
            accessors: raw.accessors,
            materials: raw.materials,
            meshes: raw.meshes,
            cameras: raw.cameras,
            lights: raw.lights,
            nodes: raw.nodes,
            scenes: raw.scenes,
            animations: raw.animations,
            scene: raw.scene
        }

        const jsonContent = JSON.stringify(jsonObject);

        // Create a new Blob with the JSON content
        const blob = new Blob([jsonContent], { type: 'application/json' });

        // Create a new File object with the Blob and desired filename
        const fileName = GLTFParser.DEFAULT_FILENAME; // You can set any desired filename here
        const file = new File([blob], fileName, { type: 'application/json' });

        return file;
    }
}
