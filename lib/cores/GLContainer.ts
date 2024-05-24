import { GLBufferAttribute } from "../data/buffers/GLBufferAttribute";
import { Texture } from "../data/components/materials/textures/Texture";
import { MathUtil } from "../utils/MathUtil";
import { AttributeDataType, AttributeMapSetters, AttributeSetters, AttributeSingleDataType, ProgramInfo, ShaderType, UniformDataType, UniformMapSetters, UniformSetterWebGLType, UniformSetters, UniformSingleDataType, WebGLType } from "./gltypes";

type TypedArray = Float32Array | Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array;

export class GLContainer {
    private _canvas: HTMLCanvasElement;
    private _gl: WebGLRenderingContext;

    private _textureUnit: number = 0;

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

    resetGL(): void {
        this._gl.clearColor(0, 0, 0, 0.9);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

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
            this.resetGL();
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

        return (value: UniformSingleDataType) => {
            if (type == WebGLType.SAMPLER_2D) {
                if (info.size > 1) {
                    throw new Error("Array of texture is not supported");
                }

                if (!(value instanceof Texture)) {
                    throw new Error("Uniform type mismatch");
                }

                const unit = this._textureUnit;
                const gl = this._gl;

                const setupTexture = (v: Texture) => {
                    let webglTexture = v.texture;

                    if (!webglTexture) {
                        webglTexture = gl.createTexture();
                        v.texture = webglTexture;
                    }

                    gl.bindTexture(gl.TEXTURE_2D, webglTexture); // bind tekstur sementara
                    const isPOT = (
                        MathUtil.isPowerOf2(v.width)
                        && MathUtil.isPowerOf2(v.height)
                    );

                    if (v.needUpload) {
                        // Jika butuh upload data, lakukan upload
                        v.needUpload = false;
                        if (v.isLoaded) {
                            // Sudah load, gaskan upload
                            const param = [
                                gl.TEXTURE_2D,
                                0,
                                v.source.format,
                                v.source.format,
                                v.source.type,
                                v.source.image ?? v.source.arrayData!.bytes
                            ];
                            
                            if (v.source.arrayData) {
                                param.splice(3, 0, v.source.arrayData.width, v.source.arrayData.height, 0);
                            }

                            // @ts-ignore: agak curang but hey less code it is :)
                            gl.texImage2D(...param);
                            if (isPOT) gl.generateMipmap(gl.TEXTURE_2D);

                        } else {
                            // Belum load / gak ada data
                            gl.texImage2D(
                                gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
                                gl.RGBA, gl.UNSIGNED_BYTE,
                                new Uint8Array(v.defaultColor)
                            );
                        }
                    }
                    if (v.parameterChanged) {
                        // Jika parameter berubah, lakukan set parameter
                        v.parameterChanged = false;
                        if (!isPOT) {
                            v.sampler.wrapS = v.sampler.wrapT = gl.CLAMP_TO_EDGE;
                            v.sampler.minFilter = gl.LINEAR;
                            console.log("image is not POT, fallback params", v);
                        }
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, v.sampler.wrapS);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, v.sampler.wrapT);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, v.sampler.minFilter);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, v.sampler.magFilter);
                    }
                    gl.bindTexture(gl.TEXTURE_2D, null); // balikkan bind ke null
                }

                const renderTexture = (v: Texture) => {
                    // Pilih tekstur unit, bind tekstur ke unit, set uniform sampler ke unit.
                    gl.activeTexture(gl.TEXTURE0 + unit);
                    gl.bindTexture(gl.TEXTURE_2D, v.texture);
                }

                const render = (v: Texture) => {
                    setupTexture(v); renderTexture(v);
                }

                // == Render Time
                render(value);
                gl.uniform1i(loc, unit);
            }

            else {
                const typeString = UniformSetterWebGLType[type];
                const setter = `uniform${typeString}`;

                if (typeString.startsWith("Matrix")) {
                    // @ts-ignore
                    this._gl[setter](loc, false, value);
                }

                else if (typeString == '1f') {
                    // @ts-ignore
                    this._gl[setter](loc, value);
                }

                else {
                    // @ts-ignore
                    this._gl[setter](loc, ...value);
                }
            }
        }
    }

    private createUniformSetters(program: WebGLProgram): UniformMapSetters {
        this._textureUnit = 0;

        const uniformSetters: UniformMapSetters = {};
        const numUniforms = this._gl.getProgramParameter(program, this._gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < numUniforms; i++) {
            const info = this._gl.getActiveUniform(program, i);
            if (!info) continue;
            uniformSetters[info.name] = this.createUniformSetter(info, program);

            if (info.type == WebGLType.SAMPLER_2D) {
                this._textureUnit += info.size;
            }
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
                if (v.accessor.bufferView.target !== this._gl.ARRAY_BUFFER) {
                    throw new Error("BufferView target must be ARRAY_BUFFER");
                }

                this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buf);
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

    setIndices(indicesAttribute: GLBufferAttribute): void {
        if (indicesAttribute.accessor.componentType !== WebGLType.UNSIGNED_SHORT) {
            throw new Error("Indices must be of type UNSIGNED_SHORT");
        }

        const gl = this._gl;

        const indexBuffer = gl.createBuffer();

        // make this buffer the current 'ELEMENT_ARRAY_BUFFER'
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            indicesAttribute.data as Uint16Array,
            gl.STATIC_DRAW
        );
    }

    setUniforms(
        programInfo: ProgramInfo,
        uniforms: { [uniformName: string]: UniformSingleDataType },
    ): void {
        for (let uniformName in uniforms) {
            if (uniforms[uniformName] == undefined) continue;
            this.setUniform(programInfo, uniformName, uniforms[uniformName]);
        }
    }

}