export class ShaderMaterial {
    static idCounter: number = 0;

    private _name: string;
    private _id: string = "M" + (ShaderMaterial.idCounter++).toString();
    private _vertexShader: string;
    private _fragmentShader: string;
    private _uniforms: { [key: string]: any } = {};

    constructor(options: { name?: string, vertexShader?: string, fragmentShader?: string, uniforms?: object } = {}) {
        const { name, vertexShader, fragmentShader, uniforms } = options;
        this._name = name || "Shader Material";
        this._vertexShader = vertexShader || '';
        this._fragmentShader = fragmentShader || '';
        this._uniforms = uniforms || {};
    }

    get id() {
        return this._id;
    }

    get vertexShader() {
        return this._vertexShader;
    }

    get fragmentShader() {
        return this._fragmentShader;
    }

    get uniforms() {
        return this._uniforms;
    }

    equals(material: ShaderMaterial): boolean {
        return this._id == material._id;
    }
}
