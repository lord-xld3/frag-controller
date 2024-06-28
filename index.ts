import init from './src/Context';
import { controlTemplate, canvasTemplate } from './src/Controls';
import { newBuffer } from './src/BufferObject';
import { newProgram, useSSQ } from './src/Program';
import { getUniformBlock, getUniformBlocks, newUniformBuffer } from './src/UniformBlockHandler';
import { mapAttributes } from './src/Attributes';
import { adjustHue, adjustNonZeroHue } from './src/Hue'

import { obj } from './src/Types';

export {
    adjustHue,
    adjustNonZeroHue,
    canvasTemplate,
    controlTemplate,
    getUniformBlock,
    getUniformBlocks,
    init,
    mapAttributes,
    newBuffer,
    newProgram,
    newUniformBuffer,
    obj,
    useSSQ,
};