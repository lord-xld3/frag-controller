export type BufferObject = {
    /** Set data of buffer 
     * @param data - Array to set.
     * @param dstByteOffset - Destination offset in bytes.
     * @param srcOffset - Source offset index.
     * @param length - Source element length.
    */
    (data: ArrayBufferView, dstByteOffset?: number, srcOffset?: number, length?: number): void
    /** WebGLBuffer */
    buf: WebGLBuffer;
    /** Bind buffer */
    bindBuffer: () => void;
}

/**
 * Initializes a new WebGLBuffer.
 * @param gl - GL context
 * @param size - Buffer size in bytes.
 * @param target - GLenum
 * @param usage - GLenum
 */
export function newBuffer(
    gl: WebGL2RenderingContext, 
    size: number,
    target: number, 
    usage: number, 
): BufferObject {
    const buf = gl.createBuffer()!;
    if (!buf) console.warn(`Failed to create BufferObject.`);

    const bindBuffer = () => gl.bindBuffer(target, buf);

    bindBuffer();
    gl.bufferData(target, size, usage);
    
    return Object.assign((
        data: ArrayBufferView, 
        dstByteOffset: number = 0,
        srcOffset: number = 0,
        length?: number
    ) => gl.bufferSubData(target, dstByteOffset, data, srcOffset, length), 
    {
        buf,
        bindBuffer,
    })
};

