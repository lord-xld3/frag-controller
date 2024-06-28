
/**
 * 
 * @param gl 
 * @param target 
 * @param usage 
 * @param data 
 */
export function newBuffer(
    gl: WebGL2RenderingContext, 
    size: number,
    target: number, 
    usage: number, 
): BufferObject {
    const buf = gl.createBuffer()!;
    if (!buf) console.warn(`Failed to create BufferObject.`);

    const bind = () => gl.bindBuffer(target, buf);

    bind();
    gl.bufferData(target, size, usage);
    
    return Object.assign((
        data: ArrayBufferView, 
        dstByteOffset: number = 0,
        srcOffset: number = 0,
        length?: number
    ) => gl.bufferSubData(target, dstByteOffset, data, srcOffset, length), 
    {
        buf,
        bind,
    })
};

export interface BufferObject {
    /** Set data of buffer 
     * @param data
     * @param dstByteOffset
     * @param srcOffset
     * @param length
    */
    (data: ArrayBufferView, dstByteOffset?: number, srcOffset?: number, length?: number): void
    /** WebGLBuffer */
    buf: WebGLBuffer;
    /** Bind buffer */
    bind: () => void;
}