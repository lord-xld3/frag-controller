import { _gl } from "./Context";
import { TypedArray } from "./Types";
import { newBufferObject } from "./BufferObject";

export interface UniformBufferObject {
    /**
     * The WebGL buffer.
     */
    buf: WebGLBuffer;
    /**
     * Binds the buffer to the UNIFORM_BUFFER target.
     */
    bind: () => void;
    /**
     * Binds the uniform buffer to a binding point.
     * @param binding - The binding point.
     * @note This does not bind the buffer to the UNIFORM_BUFFER target.
     * @note This does not bind uniform blocks to the binding point.
     */
    bindUniformBuffer: (binding?: number) => void;
    /**
     * Deletes the WebGL buffer.
     */
    delete: () => void;
    /**
     * Sets the CPU buffer data.
     * @param data - The data to set.
     * @param dstByteOffset - The byte offset to start writing to.
     * @param srcOffset - The index offset to start reading from.
     * @param length - The number of elements to read.
     */
    set: (data: TypedArray, dstByteOffset?: number, srcOffset?: number, length?: number) => void;
    /**
     * Sets data directly on the WebGL buffer.
     * @param data - The data to set.
     * @param dstByteOffset - The byte offset to start writing to.
     * @param srcOffset - The index offset to start reading from.
     * @param length - The number of elements to read.
     */
    setSubBuffer: (data: TypedArray, dstByteOffset?: number, srcOffset?: number, length?: number) => void;
    /**
     * Unbinds the buffer from the UNIFORM_BUFFER target.
     */
    unbind: () => void;
    /**
     * Copies the entire CPU buffer to the WebGL buffer.
     */
    update: () => void;
}

/**
 * Returns the max size of all uniform blocks and a function to bind them to a binding point. Also binds on call.
 * @param blocks - Array of [WebGLProgram, blockNames[]].
 * @param binding - The binding point to bind the uniform blocks to. (Default: 0)
 * @note The purpose of this function is to allow binding multiple uniform blocks to the same binding point.
 * The blocks can have different sizes, extra data is ignored in the shader program.
 * We need the max size to create buffer(s) that can hold all the blocks.
 */
export function getUniformBlocks(
    blocks: [WebGLProgram, string[]][],
    binding: number = 0,
): [number, (binding?: number) => void] {
    let maxSize = 0,
        blockInfo:[WebGLProgram, number[]][] = [];

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i],
            blockProgram = block[0],
            indices: number[] = [];
        for (let j = 0; j < block[1].length; j++) {
            const blockIndex = _gl.getUniformBlockIndex(blockProgram, block[1][j]);
            if (blockIndex === -1) {
                console.warn(`Uniform block ${block[1][j]} not found in program.`);
                continue;
            }
            maxSize = Math.max(maxSize, _gl.getActiveUniformBlockParameter(blockProgram, blockIndex, _gl.UNIFORM_BLOCK_DATA_SIZE));
            indices.push(blockIndex);
        }
        blockInfo.push([
            blockProgram,
            indices,
        ]);
    }

    function bindUniformBlocks(binding: number = 0) {
        for (let i = 0; i < blockInfo.length; i++) {
            const block = blockInfo[i],
                blockProgram = block[0],
                indices = block[1];
            for (let j = 0; j < indices.length; j++) {
                _gl.uniformBlockBinding(blockProgram, indices[j], binding);
            }
        }
    }

    bindUniformBlocks(binding);
    return [maxSize, bindUniformBlocks]
}

/**
 * Creates, binds, and initializes a new uniform buffer object.
 * @param maxSize - The max size of the buffer which should be retrieved from getUniformBlocks().
 * @param data - Data to initialize the buffer with.
 * @param binding - The binding point to bind the uniform buffer to. (Default: 0)
 */
export function newUniformBuffer(maxSize: number, data: TypedArray, binding: number = 0): UniformBufferObject {
    const _buffer = new ArrayBuffer(maxSize),
        bufferObject = newBufferObject(_gl.UNIFORM_BUFFER, _gl.STATIC_DRAW);


    function set(data: TypedArray, dstByteOffset: number = 0, srcOffset: number = 0, length: number = data.length) {
        new (data.constructor as any)(_buffer).set(data, dstByteOffset, srcOffset, length);
    }

    function update () {
        bufferObject.setBuffer(_buffer);
    }

    function bindUniformBuffer(binding: number = 0) {
        _gl.bindBufferBase(_gl.UNIFORM_BUFFER, binding, bufferObject.buf);
    }

    set(data);
    bindUniformBuffer(binding);
    bufferObject.bind();
    update();

    return {
        buf: bufferObject.buf,
        bind: bufferObject.bind,
        bindUniformBuffer,
        delete: bufferObject.delete,
        set,
        setSubBuffer: bufferObject.setSubBuffer,
        unbind: bufferObject.unbind,
        update,
    }
}

/* We provide a solution for binding unique buffers, but not buffer ranges:

Binding a "bufferRange" is unsafe, the "maxSize" of the uniform block can vary between platforms!
To bind a range of the buffer, you would need to add padding which is the (maxSize - dataSize).
If done properly this may allow for better data packing on platforms where uniform blocks are not aligned to 4 bytes.
*/