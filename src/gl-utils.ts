export type TypedArray = 
Int8Array | Uint8Array | 
Int16Array | Uint16Array | 
Int32Array | Uint32Array | 
Float32Array // | Float64Array is not supported by WebGL2 with only 32-bit float support.

/**
 * Extended WebGL2 context.
 * @extends {WebGL2RenderingContext}
 */
interface GLContext extends WebGL2RenderingContext {
    resize: {
        /**
         * Resizes the viewport & canvas to match client dimensions.
         */
        (): void;
    
        /**
         * Resizes the viewport & canvas to the specified dimensions.
         * @param width - The new width.
         * @param height - The new height.
         */
        (width?: number, height?: number): void;
    
        /**
         * Resizes the viewport & canvas to the specified dimensions and position.
         * @param width - The new width.
         * @param height - The new height.
         * @param x - The new x position.
         * @param y - The new y position.
         */
        (width?: number, height?: number, x?: number, y?: number): void;
    },

    /**
     * Creates a new shader program from shader sources.
     * @param vert - The vertex shader source.
     * @param frag - The fragment shader source.
     */
    newProgram: (vert: string, frag: string) => WebGLProgram,

    /**
     * Sets up a screen-space quad vertex shader.
     * @param frag - The fragment shader source.
     * @returns The shader program.
     */
    useSSQ: (frag: string) => WebGLProgram,

    /**
     * Draws a screen-space quad.
     */
    drawSSQ: () => void;

    /**
     * Binds a uniform block to the current program and returns a handler.
     * @param program - The shader program.
     * @param block - The name of the uniform block in the shader program.
     * @param data - The data to bind to the uniform block.
     * @param binding - The binding point for the uniform block. (Default: 0)
     * @param usage - The usage pattern of the buffer. (Default: STATIC_DRAW)
     */
    bindUniforms: (
        program: WebGLProgram, 
        block: string,
        data: TypedArray,
        binding?: number, 
        usage?: GLenum
    ) => UniformBlockHandler;
}

/**
 * A WebGL buffer with access methods.
 */
export interface BufferObject {
    /**
     * WebGLBuffer.
    */
    buf: WebGLBuffer;
    /**
     * Binds the WebGLBuffer.
     */
    bind(): void;
    /**
     * Unbinds the WebGLBuffer.
     */
    unbind(): void;
    /**
     * Deletes the WebGLBuffer.
     */
    delete(): void;
    /**
     * Sets the contents of the WebGLBuffer.
     * @param data - The data used to set the buffer contents.
     */
    setBuffer(data: TypedArray): void;
}

/**
 * Manages uniform data.
 * @extends BufferObject
 */
export interface UniformBlockHandler extends BufferObject {
    /**
     * Binds the uniform block to the specified binding point.
     * @param binding - The binding point for the uniform block.
     */
    bindBlock(binding: number): void,
    /**
     * Sets data on CPU buffer.
     * @note Optional params are in elements, not bytes.
     */
    set(data: TypedArray, dstOffset?: number, srcOffset?: number, length?: number): void,
    /**
     * Copies CPU buffer to GPU buffer.
     */
    flush(): void,
}

export default function init(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    options?: WebGLContextAttributes,
): GLContext {
    const gl = canvas.getContext('webgl2', options) as GLContext;
    if (!gl) throw new Error('WebGL2 is not supported');

    function compileShader(type: number, source: string) {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader)!);
        }
        return shader;
    }

    function createBufferObject(target: number, usage: number): BufferObject {
        const buf = gl.createBuffer()!;
        if (!buf) {
            console.warn(
                `Failed to create BufferObject using context: ${gl}
                Target: ${target}
                Usage: ${usage}`
            );
        }
    
        return {
            buf,
            bind() {
                gl.bindBuffer(target, buf);
            },
            unbind() {
                gl.bindBuffer(target, null);
            },
            delete() {
                gl.deleteBuffer(buf);
            },
            setBuffer(data: TypedArray) {
                gl.bufferData(target, data, usage);
            },
        };
    }

    gl.resize = (canvas instanceof HTMLCanvasElement) ?
        function (
            width: number = canvas.clientWidth, 
            height: number = canvas.clientHeight, 
            x: number = 0, 
            y: number = 0
        ) {
            gl.canvas.width = width;
            gl.canvas.height = height;
            gl.viewport(x, y, width, height);
        } 
    : function (
        width: number = canvas.width,
        height: number = canvas.height
    ) {
        gl.canvas.width = width;
        gl.canvas.height = height;
        gl.viewport(0, 0, width, height);
    },
    gl.newProgram = (vert: string, frag: string) => {
        const program = gl.createProgram()!,
            vs = compileShader(gl.VERTEX_SHADER, vert),
            fs = compileShader(gl.FRAGMENT_SHADER, frag);

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(program)!);
        }
        return program;
    },
    gl.useSSQ = (frag: string) => {
        const p = gl.newProgram(`#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}`, frag);
        gl.useProgram(p);
        const l = gl.getAttribLocation(p, 'a');
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(l);
        gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
        return p;
    },
    gl.drawSSQ = () => gl.drawArrays(gl.TRIANGLES, 0, 6),
    gl.bindUniforms = (
        program: WebGLProgram, 
        block: string, 
        data: TypedArray = new Float32Array(0),
        binding: number = 0, 
        usage: GLenum = gl.STATIC_DRAW,
    ): UniformBlockHandler => {
        
        const blockIndex = gl.getUniformBlockIndex(program, block);
        if (blockIndex === gl.INVALID_INDEX) {
            console.warn(`Uniform block "${block}" not found in program: ${program}`);
        }

        const bufferObject = createBufferObject(gl.UNIFORM_BUFFER, usage),
            _buffer = padNBytes(data, 16);

        function bindBlock(binding: number) {
            gl.uniformBlockBinding(program, blockIndex, binding);
        }

        function bind() {
            bufferObject.bind();
            gl.bindBufferBase(gl.UNIFORM_BUFFER, blockIndex, bufferObject.buf);
        }

        function unbind() {
            gl.bindBufferBase(gl.UNIFORM_BUFFER, blockIndex, null);
            bufferObject.unbind();
        }

        function set(data: TypedArray, dstByteOffset: number = 0, srcOffset: number = 0, length: number = data.length) {
            _buffer.set(data.slice(srcOffset, length), dstByteOffset);
        }

        function flush() {
            bufferObject.setBuffer(_buffer);
        }
        
        bind();
        bindBlock(binding);
        set(data);
        flush();

        return {
            ...bufferObject,
            bindBlock,
            bind,
            unbind,
            set,
            flush,
        };
    }

    return gl;
}

/**
 * Pads a TypedArray to the next multiple of n bytes.
 * @param data - An TypedArray to pad.
 * @param n - The number of bytes to pad to.
 * @returns - A new TypedArray with the data padded to n bytes.
 */
function padNBytes(data: TypedArray, n: number): TypedArray {
    
    // (length + n - 1) AND NOT(n - 1) 
    const alignedSize = (data.byteLength + n - 1) & ~(n - 1);
    
    // call the constructor of the TypedArray to create the same type
    const alignedBuffer = new (data.constructor as any)(alignedSize);
    
    // set the data in the newly padded buffer
    alignedBuffer.set(data);
    return alignedBuffer;
}