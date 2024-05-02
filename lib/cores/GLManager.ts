import { BufferAttribute } from "../data/BufferAttribute";
import { AttributeDataType, AttributeMapSetters, AttributeSetters, AttributeSingleDataType, ProgramInfo, ShaderType } from "./gltypes";

export class GLManager {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private shaderProgram: WebGLProgram;

    constructor(
        canvas: HTMLCanvasElement
    ) {
        this.canvas = canvas;

        this.gl = this.initGL();
        this.adjustCanvas();
        this.observeCanvas();

        this.shaderProgram = this.initProgram();
    }

    private initGL(canvas: HTMLCanvasElement = this.canvas): WebGLRenderingContext {
        const gl = canvas.getContext("webgl");

        if (!gl) {
            throw new Error("WebGL is not supported");
        }

        return gl;
    }

    private adjustCanvas(): void {
        const dw = this.canvas.clientWidth;
        const dh = this.canvas.clientHeight;
        if (this.canvas.width !== dw || this.canvas.height !== dh) {
            this.canvas.width = dw;
            this.canvas.height = dh;
            this.gl.viewport(0, 0, dw, dh);
        }
    }

    private observeCanvas(): void {
        const ro = new ResizeObserver(this.adjustCanvas.bind(this));
        ro.observe(this.canvas, { box: 'content-box' });
    }

    private createShader(source: string, type: GLenum) {
        let shader = this.gl.createShader(type);

        if (!shader) {
            throw new Error("Failed to create shader");
        }

        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);


        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const infoLog = this.gl.getShaderInfoLog(shader)
            this.gl.deleteShader(shader);

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
        const program = this.gl.createProgram();

        if (!program) {
            throw new Error("Failed to create program");
        }

        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const infoLog = this.gl.getProgramInfoLog(program);
            this.gl.deleteProgram(program);
            throw new Error("Failed to link program: " + infoLog);
        }

        return program;
    }

    private getVertexShader(): WebGLShader {
        const vertexSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        return this.createShader(vertexSource, ShaderType.VERTEX);
    }

    private getFragmentShader(): WebGLShader {
        const fragmentSource = `
            void main() {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            }
        `;

        return this.createShader(fragmentSource, ShaderType.FRAGMENT);
    }

    private initProgram(): WebGLProgram {
        const vertexShader = this.getVertexShader();
        const fragmentShader = this.getFragmentShader();

        return this.createProgram(vertexShader, fragmentShader);
    }

    private createAttributeSetter(info: WebGLActiveInfo): AttributeSetters {
        // Initialization Time
        const loc = this.gl.getAttribLocation(this.shaderProgram, info.name);
        const buf = this.gl.createBuffer();
        return (...values) => {
            // Render Time (saat memanggil setAttributes() pada render loop)
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
            const v = values[0];
            if (v instanceof BufferAttribute) {
                if (v.isDirty) {
                    // Data Changed Time (note that buffer is already binded)
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, v.data, this.gl.STATIC_DRAW);
                    v.consume();
                }
                this.gl.enableVertexAttribArray(loc);
                this.gl.vertexAttribPointer(loc, v.size, v.dtype, v.normalize, v.stride, v.offset);
            } else {
                this.gl.disableVertexAttribArray(loc);
                if (v instanceof Float32Array)
                    // @ts-ignore
                    this.gl[`vertexAttrib${v.length}fv`](loc, v);
                else
                    // @ts-ignore
                    this.gl[`vertexAttrib${values.length}f`](loc, ...values);
            }
        }
    }

    private createAttributeSetters(): AttributeMapSetters {
        const attribSetters: AttributeMapSetters = {};
        const numAttribs = this.gl.getProgramParameter(this.shaderProgram, this.gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < numAttribs; i++) {
            const info = this.gl.getActiveAttrib(this.shaderProgram, i);
            if (!info) continue;
            attribSetters[info.name] = this.createAttributeSetter(info);
        }
        return attribSetters;
    }

    private setAttribute(programInfo: ProgramInfo, attributeName: string, ...data: AttributeDataType): void {
        const setters = programInfo.attributeSetters;
        if (attributeName in setters) {
            const shaderName = `a_${attributeName}`;
            setters[shaderName](...data);
        }
    }
    private setAttributes(
        programInfo: ProgramInfo,
        attributes: { [attributeName: string]: AttributeSingleDataType },
    ): void {
        for (let attributeName in attributes)
            this.setAttribute(programInfo, attributeName, attributes[attributeName]);
    }



}