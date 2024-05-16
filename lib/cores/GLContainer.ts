import { GLBufferAttribute } from "../data/buffers/GLBufferAttribute";
import { AttributeDataType, AttributeMapSetters, AttributeSetters, AttributeSingleDataType, ProgramInfo, ShaderType, UniformDataType, UniformMapSetters, UniformSetterWebGLType, UniformSetters, UniformSingleDataType } from "./gltypes";

type TypedArray = Float32Array | Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array;

export class GLContainer {
    private _canvas: HTMLCanvasElement;
    private _gl: WebGLRenderingContext;

    constructor(
        canvas: HTMLCanvasElement
    ) {
        this._canvas = canvas;

        this._gl = this.initGL();
        this.adjustCanvas();
        this.observeCanvas();
    }

    get glContext(): WebGLRenderingContext {
        return this._gl;
    }

    get canvasElement(): HTMLCanvasElement {
        return this._canvas;
    }

    private initGL(canvas: HTMLCanvasElement = this._canvas): WebGLRenderingContext {
        const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

        if (!gl) {
            throw new Error("WebGL is not supported");
        }

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        
        
        return gl;
    }

    private adjustCanvas(): void {
        const dw = this._canvas.clientWidth;
        const dh = this._canvas.clientHeight;
        if (this._canvas.width !== dw || this._canvas.height !== dh) {
            this._canvas.width = dw;
            this._canvas.height = dh;
            this._gl.viewport(0, 0, dw, dh);
        }
    }

    private observeCanvas(): void {
        const ro = new ResizeObserver(this.adjustCanvas.bind(this));
        ro.observe(this._canvas, { box: 'content-box' });
    }

    private createShader(source: string, type: GLenum) {
        let shader = this._gl.createShader(type);

        if (!shader) {
            throw new Error("Failed to create shader");
        }

        this._gl.shaderSource(shader, source);
        this._gl.compileShader(shader);


        if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
            const infoLog = this._gl.getShaderInfoLog(shader)
            this._gl.deleteShader(shader);

            throw new Error("Failed to compile shader: " + infoLog);
        }

        return shader;
    }

    /**
     * Create a new program from two shaders.
     *
     * @param {WebGLShader} vertexShader The vertex shader.
     * @param {WebGLShader} fragmentShader The fragment shader.
     * @return {WebGLProgram?}
     */
    private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        const program = this._gl.createProgram();

        if (!program) {
            throw new Error("Failed to create program");
        }

        this._gl.attachShader(program, vertexShader);
        this._gl.attachShader(program, fragmentShader);
        this._gl.linkProgram(program);

        if (!this._gl.getProgramParameter(program, this._gl.LINK_STATUS)) {
            const infoLog = this._gl.getProgramInfoLog(program);
            this._gl.deleteProgram(program);
            throw new Error("Failed to link program: " + infoLog);
        }

        return program;
    }

    getProgramInfo(vertexSource: string, fragmentSource: string): ProgramInfo {
        const vertexShader = this.createShader(vertexSource, ShaderType.VERTEX);
        const fragmentShader = this.createShader(fragmentSource, ShaderType.FRAGMENT);

        const program = this.createProgram(vertexShader, fragmentShader);

        return {
            program: program,
            uniformSetters: this.createUniformSetters(program),
            attributeSetters: this.createAttributeSetters(program),
        };
    }

    setProgram(programInfo: ProgramInfo): void {
        this._gl.useProgram(programInfo.program);
    }

    private createUniformSetter(info: WebGLActiveInfo, program: WebGLProgram): UniformSetters {
        const loc = this._gl.getUniformLocation(program, info.name);

        if (!loc) {
            throw new Error("Failed to get uniform location");
        }

        const type = info.type;

        return (values: UniformSingleDataType) => {
            const typeString = UniformSetterWebGLType[type];
            const setter = `uniform${typeString}`;
            
            if (typeString.startsWith("Matrix")) {
                // @ts-ignore
                this._gl[setter](loc, false, values);
            }

            else if (typeString == '1f') {
                // @ts-ignore
                this._gl[setter](loc, values);
            }

            else {
                // @ts-ignore
                this._gl[setter](loc, ...values);
            }
        }
    }

    private createUniformSetters(program: WebGLProgram): UniformMapSetters {
        const uniformSetters: UniformMapSetters = {};
        const numUniforms = this._gl.getProgramParameter(program, this._gl.ACTIVE_UNIFORMS);
 
        for (let i = 0; i < numUniforms; i++) {
            const info = this._gl.getActiveUniform(program, i);
            if (!info) continue;
            uniformSetters[info.name] = this.createUniformSetter(info, program);
        }

        return uniformSetters;
    }

    private createAttributeSetter(info: WebGLActiveInfo, program: WebGLProgram): AttributeSetters {
        // Initialization Time
        const loc = this._gl.getAttribLocation(program, info.name);
        const buf = this._gl.createBuffer();
        return (...values) => {
            // Render Time (saat memanggil setAttributes() pada render loop)
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buf);
            const v = values[0];

            if (v instanceof GLBufferAttribute) {
                this._gl.bufferData(this._gl.ARRAY_BUFFER, v.data as TypedArray, this._gl.STATIC_DRAW);

                this._gl.enableVertexAttribArray(loc);
                this._gl.vertexAttribPointer(loc, v.size, v.dtype, v.normalize, v.stride, v.offset);
            } else {
                this._gl.disableVertexAttribArray(loc);
                if (v instanceof Float32Array)
                    // @ts-ignore
                    this._gl[`vertexAttrib${v.length}fv`](loc, v);
                else
                    // @ts-ignore
                    this._gl[`vertexAttrib${values.length}f`](loc, ...values);
            }
        }
    }

    private createAttributeSetters(program: WebGLProgram): AttributeMapSetters {
        const attribSetters: AttributeMapSetters = {};
        const numAttribs = this._gl.getProgramParameter(program, this._gl.ACTIVE_ATTRIBUTES);

        for (let i = 0; i < numAttribs; i++) {
            const info = this._gl.getActiveAttrib(program, i);
            if (!info) continue;
            attribSetters[info.name] = this.createAttributeSetter(info, program);
        }
        return attribSetters;
    }

    private setAttribute(programInfo: ProgramInfo, attributeName: string, ...data: AttributeDataType): void {
        const setters = programInfo.attributeSetters!!;

        if (!attributeName.startsWith('a_')) {
            attributeName = `a_${attributeName}`;
        }

        if (attributeName in setters) {
            setters[attributeName](...data);
        }
    }
    setAttributes(
        programInfo: ProgramInfo,
        attributes: { [attributeName: string]: AttributeSingleDataType },
    ): void {
        for (let attributeName in attributes)
            this.setAttribute(programInfo, attributeName, attributes[attributeName]);
    }

    private setUniform(programInfo: ProgramInfo, uniformName: string, data: UniformSingleDataType): void {
        const setters = programInfo.uniformSetters!!;

        if (!uniformName.startsWith('u_')) {
            uniformName = `u_${uniformName}`;
        }

        if (uniformName in setters) {
            setters[uniformName](data);
        }
    }

    setUniforms(
        programInfo: ProgramInfo,
        uniforms: { [uniformName: string]: UniformSingleDataType },
    ): void {
        for (let uniformName in uniforms)
        {
            this.setUniform(programInfo, uniformName, uniforms[uniformName]); 
        }
    }

}