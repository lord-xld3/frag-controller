export interface BufferObject {
    buf: WebGLBuffer;
    bind: () => void;
    initBuffer: (data: ArrayBuffer | ArrayBufferView) => void;
    set: (data: ArrayBufferView, dstByteOffset?: number, srcOffset?: number, length?: number) => void;
}

/**
 * Creates a new BufferObject.
 * @param gl - The WebGL2RenderingContext.
 * @param target - The buffer target. (e.g. gl.ARRAY_BUFFER)
 * @param usage - The buffer usage. (e.g. gl.STATIC_DRAW)
 * @param data - The buffer data. (Optional)
 * 
 * @example const buffer = newBufferObject(
 * gl, 
 * gl.ARRAY_BUFFER, 
 * gl.STATIC_DRAW, 
 * new Float32Array([1, 2, 3, 4])
 * );
 */
export function newBufferObject(
    gl: WebGL2RenderingContext, 
    target: number, 
    usage: number, 
    data?: ArrayBuffer | ArrayBufferView
): BufferObject {
    const buf = gl.createBuffer()!;
    if (!buf) console.warn(`Failed to create BufferObject.`);

    function bind() {
        gl.bindBuffer(target, buf);
    }

    function initBuffer(data: ArrayBuffer | ArrayBufferView) {
        gl.bufferData(target, data, usage);
    }

    function set(
        data: ArrayBufferView, 
        dstByteOffset: number = 0,
        srcOffset: number = 0,
        length?: number
    ) {
        gl.bufferSubData(target, dstByteOffset, data, srcOffset, length);
    }

    if (data) {
        bind();
        initBuffer(data);
    }
    
    return {
        buf,
        bind,
        initBuffer,
        set,
    };
};