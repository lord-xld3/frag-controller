import { StreamHandler, pointerEvents } from "./Controls";

export type TypedArray = 
Int8Array | Uint8Array | 
Int16Array | Uint16Array | 
Int32Array | Uint32Array | 
Float32Array // | Float64Array is not supported by WebGL2 with only 32-bit float support.

//#region Interfaces
/**
 * Utilities that reference the WebGL2 context.
 */
interface Fragger {
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
     * Sets up a WebGLProgram with a vertex shader that just draws 2 triangles to cover the screen.
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
     * @param binding - The binding point for the uniform block. (Default: 0)
     * @param usage - The usage pattern of the buffer. (Default: STATIC_DRAW)
     */
    bindUniformBlock: (
        program: WebGLProgram, 
        block: string,
        binding?: number, 
        usage?: GLenum
    ) => UniformBlockHandler;

    /**
     * Streams canvas [iMouse.xy, iResolution.xy, iDelta.xy, iZoom.x] to a uniform block.
     * @param program - The shader program.
     * @param blockName - The name of the uniform block in the shader program.
     * @param binding - The binding point for the uniform block. (Default: 0)
     * @param zoom - The zoom level. (Default: 1)
     */
    baseStream: (
        program: WebGLProgram,
        blockName: string,
        binding?: number,
        zoom?: number,
    ) => [UniformBlockHandler, BaseStreamHandler];
}

/**
 * A WebGL buffer with access methods.
 */
interface BufferObject {
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
    setBuffer(data: ArrayBuffer): void;
}

/**
 * Manages a uniform block.
 */
export interface UniformBlockHandler extends Pick<BufferObject, 'delete'> {
    /**
     * Binds the uniform block to the current program.
     */
    bind(): void;
    /**
     * Unbinds the uniform block from the current program.
     */
    unbind(): void;
    /**
     * Binds the uniform block to the specified binding point.
     * @param binding - The binding point for the uniform block.
     */
    bindBlock(binding: number): void,
    /**
     * Modify subdata in the array buffer.
     * @param data - The data to update the buffer with.
     * @param dstByteOffset - The offset in bytes to start updating the buffer.
     * @param srcOffset - The offset in elements to start copying from the data.
     * @param length - The number of elements to copy from the data.
     */
    set(data: TypedArray, dstByteOffset?: number, srcOffset?: number, length?: number): void;
    /**
     * Copies the uniform buffer to the GPU.
     * @note - If the uniforms are unlikely to change often, use this on the events that update the uniforms.
     * - Otherwise, use this once per draw call, like updating a time uniform.
     */
    update(): void;
}

interface BaseStreamHandler extends StreamHandler {
    /**
     * Sets the mouse coordinate uniform.
     * @param x - The x-coordinate.
     * @param y - The y-coordinate.
     */
    setCoords: (x: number, y: number) => void,
    /**
     * Sets the resolution uniform.
     * @param width - The width.
     * @param height - The height.
     */
    setResolution: (width: number, height: number) => void,
    /**
     * Sets the delta uniform.
     * @param x - The x-delta.
     * @param y - The y-delta.
     */
    setDelta: (x: number, y: number) => void,
    /**
     * Sets the time uniform.
     * @param time - The time.
     */
    setTime: (time: number) => void,
    /**
     * Sets the zoom uniform.
     * @param zoom - The zoom level.
     */
    setZoom: (zoom: number) => void,

    /**
     * Scales the gl.canvas to the *actual* device resolution unless specified. Also updates resolution in 'baseStream'.
     * - When using an OffscreenCanvas, the width and height must be explicitly set.
     * @param dpr - The device pixel ratio. (Default: window.devicePixelRatio)
     * @param width - The width of the canvas. (Default: canvas.clientWidth)
     * @param height - The height of the canvas. (Default: canvas.clientHeight)
     */
    scaleToDevice: (
        dpr?: number,
        width?: number,
        height?: number,
    ) => void;
}
//#endregion

/**
 * Sets up an extended WebGL2 context.
 * @param canvas - The canvas element.
 * @param options - The WebGL context attributes.
 * @returns WebGL2RenderingContext
 */
export default function init(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    options?: WebGLContextAttributes,
): [WebGL2RenderingContext, Fragger] {
    const gl = canvas.getContext('webgl2', options)!;
    if (!gl) throw new Error('WebGL2 is not supported');

    const resize = (canvas instanceof HTMLCanvasElement) ?
        function (
            width: number = canvas.clientWidth, 
            height: number = canvas.clientHeight, 
            x: number = 0, 
            y: number = 0
        ) {
            canvas.width = width;
            canvas.height = height;
            gl.viewport(x, y, width, height);
        } 
    : function (
        width: number = canvas.width,
        height: number = canvas.height,
    ) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
    };

    return [gl, {
        resize,
        newProgram,
        useSSQ,
        drawSSQ,
        bindUniformBlock,
        baseStream,
    }];
    // End of init().

    function compileShader(type: number, source: string) {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader)!);
        }
        return shader;
    };
    
    function createBufferObject(target: number, usage: number): BufferObject {
        const buf = gl.createBuffer()!;
        if (!buf) console.warn(`Failed to create BufferObject.`);
        return {
            buf,
            bind: () => gl.bindBuffer(target, buf),
            unbind: () => gl.bindBuffer(target, null),
            delete: () => gl.deleteBuffer(buf),
            setBuffer: (data: ArrayBuffer) => gl.bufferData(target, data, usage),
        };
    };

    function newProgram(vert: string, frag: string) {
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
    };

    function useSSQ(frag: string) {
        const p = newProgram(`#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}`, frag);
        gl.useProgram(p);
        const l = gl.getAttribLocation(p, 'a');
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(l);
        gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
        return p;
    };

    function drawSSQ() { gl.drawArrays(gl.TRIANGLES, 0, 6); };

    function bindUniformBlock(
        program: WebGLProgram, 
        block: string, 
        binding: number = 0, 
        usage: GLenum = gl.STATIC_DRAW,
    ): UniformBlockHandler {
        
        const blockIndex = gl.getUniformBlockIndex(program, block);
        if (blockIndex === gl.INVALID_INDEX) console.warn(`Uniform block `, block, ` not found in program:` , program);
        bindBlock(binding);
        const bufferObject = createBufferObject(gl.UNIFORM_BUFFER, usage),
            _buffer = new ArrayBuffer(gl.getActiveUniformBlockParameter(program, blockIndex, gl.UNIFORM_BLOCK_DATA_SIZE));
        update(); // Initialize the buffer with the correct size.

        return {
            delete: bufferObject.delete,
            bindBlock,
            bind,
            unbind,
            set,
            update,
        };
        // End of bindUniformBlock().

        function bindBlock(binding: number) {
            gl.uniformBlockBinding(program, blockIndex, binding);
        };

        function bind() {
            bufferObject.bind();
            gl.bindBufferBase(gl.UNIFORM_BUFFER, blockIndex, bufferObject.buf);
        };

        function unbind() {
            gl.bindBufferBase(gl.UNIFORM_BUFFER, blockIndex, null);
            bufferObject.unbind();
        };

        // We're using an ArrayBuffer for the "CPU buffer" to avoid multiple GPU writes.
        function set(data: TypedArray, dstStartByte: number = 0, srcStartByte: number = 0, length: number = data.length) {
            // 1. Construct a slice of the buffer using data's constructor.
            // 2. Set a slice of data to the buffer.
            new (data.constructor as any)(_buffer, dstStartByte, length).set(data, srcStartByte);
        };

        function update() {
            bind();
            bufferObject.setBuffer(_buffer);
        };
    };

    function baseStream(
        program: WebGLProgram,
        blockName: string,
        binding: number = 0,
        zoom: number = 1,
    ): [UniformBlockHandler, BaseStreamHandler] {
        const handler = bindUniformBlock(program, blockName, binding);
        let H = 1/(canvas as HTMLCanvasElement).clientHeight,
            ec: PointerEvent[] = [], // event cache
            z = zoom, // default zoom level
            dx = 0, // delta x
            dy = 0, // delta y
            m = Math.exp(-z), // exp(-zoom)
            pd = 0; // previous distance between two pointers

        function setCoords(x: number, y: number) { handler.set(new Uint32Array([x, y]), 0); }
        function setResolution(width: number, height: number) { handler.set(new Uint32Array([width, height]), 8); }
        function setDelta(x: number, y: number) {
            dx = x, dy = y;
            handler.set(new Float32Array([x, y]), 16);
        }
        function setTime(time: number) { handler.set(new Float32Array([time]), 24); }
        function setZoom(zoom: number) {
            z = zoom,
            m = Math.exp(-zoom);
            handler.set(new Float32Array([zoom]), 28);
        }

        return [
            handler,
            {
                ...pointerEvents(
                    (canvas as HTMLCanvasElement),
                    // Down
                    (e: PointerEvent) => {
                        ec.push(e);
                        if (ec.length === 1) (canvas as HTMLCanvasElement).setPointerCapture(e.pointerId);
                        setCoords(e.clientX, e.clientY);
                    },
                    // Up
                    (e: PointerEvent) => {
                        ec = ec.filter(ev => ev.pointerId !== e.pointerId);
                        if (ec.length < 2) pd = 0;
                        (canvas as HTMLCanvasElement).releasePointerCapture(e.pointerId);
                    },
                    // Move
                    (e: PointerEvent) => {
                        let f = ec.findIndex(ev => ev.pointerId === e.pointerId);
                        ec[f] = e;
            
                        if (ec.length === 1) { // Pan
                            setCoords(e.clientX, e.clientY);
                            setDelta(dx -= e.movementX * H * m * 2, dy += e.movementY * H * m * 2); 
                            // 2 is a magic number, feels right.
                        }
            
                        // && e.isPrimary only fires on the primary pointer.
                        if (ec.length === 2 && e.isPrimary) { // Pinch
                            const [e1, e2] = ec;
                            const d = Math.hypot(e1.clientX - e2.clientX, e1.clientY - e2.clientY);
                            if (pd) setZoom(z += (d - pd) * H * 4);
                            pd = d;
                        }
                    },
                    // Wheel
                    (e: WheelEvent) => setZoom(z -= e.deltaY * H),
                ),
                setCoords,
                setResolution,
                setDelta,
                setTime,
                setZoom,
                scaleToDevice: (
                    dpr: number = window.devicePixelRatio, 
                    width: number = (canvas as HTMLElement).clientWidth, 
                    height: number = (canvas as HTMLElement).clientHeight, 
                ) => {
                    // CSS will stretch it anyway but it needs to be an integer.
                    width = Math.round(width * dpr);
                    height = Math.round(height * dpr);
                    resize(width, height); // Update the canvas/viewport.
                    setResolution(width, height); // Update the uniform block holding the resolution.
                }, 
            },
        ];
    }
}