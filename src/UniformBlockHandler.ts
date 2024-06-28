import { newBuffer, BufferObject } from "./BufferObject";

interface UniformBlock {
    /**
     * Binds the uniform block index to a binding point. Default: 0
     */
    (binding?: number): void;
    /**
     * Returned size of the uniform block in the program.
     */
    size: number;
}

/**
 * Returns the size of a uniform block and a function to bind it to a binding point. Also binds on call.
 * @param gl - The WebGL2RenderingContext.
 * @param program - The WebGLProgram.
 * @param blockName - The name of the uniform block.
 * @param binding - The binding point to bind the uniform block to. (Default: 0)
 * @note We need the size of the uniform block to create a buffer that can hold the block.
 * @example const size = getUniformBlock(gl, program, 'BlockName').size;
 */
export function getUniformBlock(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    blockName: string,
    binding: number = 0,
): UniformBlock {
    const blockIndex = gl.getUniformBlockIndex(program, blockName);
    if (blockIndex === -1) {
        console.warn(`Uniform block ${blockName} not found in program.`);
    }

    const bindBlock = (binding: number = 0) => {
        gl.uniformBlockBinding(program, blockIndex, binding);
    }

    bindBlock(binding);

    return Object.assign(
        bindBlock, 
        {size: gl.getActiveUniformBlockParameter(program, blockIndex, gl.UNIFORM_BLOCK_DATA_SIZE) as number}
    )
}

/**
 * Returns the max size of all uniform blocks and a function to bind them to a binding point. Also binds on call.
 * @param blocks - Array of [WebGLProgram, blockNames[]].
 * @param binding - The binding point to bind the uniform blocks to. (Default: 0)
 * @note The purpose of this function is to allow binding multiple uniform blocks to the same binding point.
 * The blocks can have different sizes, extra data is ignored in the shader program.
 * We need the max size to create buffer(s) that can hold all the blocks.
 * @example const [maxSize, bindUniformBlocks] = getUniformBlocks(
 * gl, 
 * [
 * [program1, ['BlockName1', 'BlockName2']], 
 * [program2, ['BlockName3']]
 * ]);
 */
export function getUniformBlocks(
    gl: WebGL2RenderingContext,
    blocks: [WebGLProgram, string[]][],
    binding: number = 0,
) {
    let maxSize = 0,
        blockInfo:[WebGLProgram, number[]][] = [];

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i],
            blockProgram = block[0],
            indices: number[] = [];
        for (let j = 0; j < block[1].length; j++) {
            const blockIndex = gl.getUniformBlockIndex(blockProgram, block[1][j]);
            if (blockIndex === -1) {
                console.warn(`Uniform block ${block[1][j]} not found in program.`);
                continue;
            }
            maxSize = Math.max(maxSize, gl.getActiveUniformBlockParameter(blockProgram, blockIndex, gl.UNIFORM_BLOCK_DATA_SIZE));
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
                gl.uniformBlockBinding(blockProgram, indices[j], binding);
            }
        }
    }

    bindUniformBlocks(binding);
    return [maxSize, bindUniformBlocks]
}

interface UniformBufferObject extends BufferObject {
    /** Binds the buffer to a specified binding point. Default: 0 */
    bufferBinding: (binding?: number) => void;
}

/**
 * Creates, binds, and initializes a new uniform buffer object.
 * @param maxSize - The max size of the buffer which should be retrieved from getUniformBlock().
 * @param binding - The binding point to bind the uniform buffer to. (Default: 0)
 * @param data - Data to initialize the buffer with.
 * @example const buffer = newUniformBuffer(gl, maxSize, new Uint32Array([1, 2, 3, 4]), 0);
 */
export function newUniformBuffer(
    gl: WebGL2RenderingContext,
    maxSize: number, 
    binding: number = 0,
): UniformBufferObject {
    const bufferObject = newBuffer(
        gl,
        maxSize,
        gl.UNIFORM_BUFFER, 
        gl.STATIC_DRAW,
    );

    const bufferBinding = function(binding: number = 0)  {
        gl.bindBufferBase(gl.UNIFORM_BUFFER, binding, bufferObject.buf);
    }

    bufferBinding(binding);

    return Object.assign(bufferObject, {bufferBinding: bufferBinding})
}