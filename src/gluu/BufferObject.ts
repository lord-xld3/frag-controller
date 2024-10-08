

/**
 * Returns a function to set the buffer.
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
) {
    const buf = gl.createBuffer()!;
    if (!buf) console.warn(`Failed to create BufferObject.`);

    const bindBuffer = () => gl.bindBuffer(target, buf);

    bindBuffer();
    gl.bufferData(target, size, usage);
    
    return Object.assign(
        /** Set the contents of the WebGLBuffer */
        (
        /** A typed array or ArrayBuffer */
        data: ArrayBuffer | ArrayBufferView, 
        /** Destination offset in bytes */
        dstByteOffset: number = 0,
    ) => gl.bufferSubData(target, dstByteOffset, data), 
    {
        bindBuffer,
        buf,
    })
};



