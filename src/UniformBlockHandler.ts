import { newBuffer } from "./BufferObject";

/**
 * Returns a binding function with a size property.
 * @param gl - The WebGL2RenderingContext.
 * @param program - The WebGLProgram.
 * @param blockName - The name of the uniform block.
 */
export function getUniformBlock(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    blockName: string,
) {
    const blockIndex = gl.getUniformBlockIndex(program, blockName);
    if (blockIndex === -1) {
        console.warn(`Uniform block ${blockName} not found in program.`);
    }

    return Object.assign(
        /**
         * Bind the uniform block to a specified index
         * @param binding - U32. Default 0.
         */
        (binding: number = 0) => {
            gl.uniformBlockBinding(program, blockIndex, binding);
        }, 
        {size: gl.getActiveUniformBlockParameter(program, blockIndex, gl.UNIFORM_BLOCK_DATA_SIZE) as number}
    )
}

/**
 * Returns a function to set the contents of the uniform buffer, 
 * includes a bufferIndex() method to bind the uniform buffer to a specified index.
 * @param gl - WebGL2Context
 * @param maxSize - The max size of the buffer which should be retrieved from getUniformBlock().size.
 */
export function newUniformBuffer(
    gl: WebGL2RenderingContext,
    maxSize: number,
) {
    const bufferObject = newBuffer(
        gl,
        maxSize,
        gl.UNIFORM_BUFFER, 
        gl.STATIC_DRAW,
    );

    return Object.assign(bufferObject, {
        /**
         * Binds the uniform buffer to a specified index.
         * @param binding - U32. Default 0.
         */
        bufferIndex: (binding: number = 0) => {
            gl.bindBufferBase(gl.UNIFORM_BUFFER, binding, bufferObject.buf);
    }})
}

/**
 * Returns the max size of all uniform blocks and a function to bind them to a binding point. Also binds on call.
 * @param gl - WebGLContext
 * @param blocks - Array of [WebGLProgram, blockNames[]].
 * @param binding - The binding point to bind the uniform blocks to. (Default: 0)
 * @note The purpose of this function is to allow binding multiple uniform blocks to the same binding point.
 * The blocks can have different sizes, extra data is ignored in the shader program.
 * We need the max size to create buffer(s) that can hold all the blocks.
 */
export function getUniformBlocks(
    gl: WebGL2RenderingContext,
    blocks: [WebGLProgram, string[]][],
    binding: number = 0,
) {
    let maxSize = 0,
        blockInfo:[WebGLProgram, number[]][] = [],
        i = 0,
        j = 0;

    for (; i < blocks.length; i++) {
        const block = blocks[i],
            blockProgram = block[0],
            blockIndices: number[] = [];
        for (; j < block[1].length; j++) {
            const blockIndex = gl.getUniformBlockIndex(blockProgram, block[1][j]);
            if (blockIndex === -1) {
                console.warn(`Uniform block ${block[1][j]} not found in program.`);
                continue;
            }
            maxSize = Math.max(maxSize, gl.getActiveUniformBlockParameter(blockProgram, blockIndex, gl.UNIFORM_BLOCK_DATA_SIZE));
            blockIndices.push(blockIndex);
        }
        blockInfo.push([
            blockProgram,
            blockIndices,
        ]);
    }

    const bindBlock = (binding: number = 0) => {
        for (i = 0; i < blockInfo.length; i++) {
            const block = blockInfo[i],
                blockProgram = block[0],
                blockIndices = block[1];
            for (j = 0; j < blockIndices.length; j++) {
                gl.uniformBlockBinding(blockProgram, blockIndices[j], binding);
            }
        }
    }

    bindBlock(binding);
    return Object.assign(bindBlock, {size: maxSize})
}