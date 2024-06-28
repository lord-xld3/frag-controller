import { obj } from "./Types";

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
) {
    const buf = gl.createBuffer()!;
    if (!buf) console.warn(`Failed to create BufferObject.`);

    const bind = () => gl.bindBuffer(target, buf);

    bind();
    gl.bufferData(target, size, usage);
    
    return obj((
        /**doc test */
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