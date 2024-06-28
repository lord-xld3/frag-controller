import init from './src/Context';
import { controlTemplate, canvasTemplate } from './src/Controls';
import { newBuffer } from './src/BufferObject';
import { newProgram, useSSQ } from './src/Program';
import { getUniformBlock, newUniformBuffer } from './src/UniformBlockHandler';
import { mapAttributes } from './src/Attributes';
import { adjustHue, adjustNonZeroHue } from './src/Hue'



export {
    adjustHue,
    adjustNonZeroHue,
    canvasTemplate,
    controlTemplate,
    getUniformBlock,

    init,
    mapAttributes,
    newBuffer,
    newProgram,
    newUniformBuffer,

    useSSQ,
};