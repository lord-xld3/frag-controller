import { _gl } from "./Context";
import { newBufferObject } from "./BufferObject";

// Think of the VBO like an 'ArrayBuffer', and think of the VAO like a 'View' into that buffer.

/**
 * Creates a VertexBufferObject and binds it.
 * @param data - The data to be stored in the buffer.
 * @param usage - The usage pattern of the buffer.
 */
export function newVBO(
    data: ArrayBuffer | ArrayBufferView,
    usage: GLenum = _gl.STATIC_DRAW,
) {
    const buffer = newBufferObject(_gl.ARRAY_BUFFER, usage);

    // Bind VBO and set buffer data.
    buffer.bind();
    buffer.setBuffer(data);

    return buffer;
}

export function mapAttributes(
    program: WebGLProgram,
    attributes: {
        name: string;
        size: number;
        type?: GLenum;
        normalized?: boolean;
        stride?: number;
        offset?: number;
        divisor?: number;
    }[]
): void {
    for (let i = 0; i < attributes.length; i++) {
        const { name, size, type, normalized, stride, offset, divisor } = attributes[i], 
            location = _gl.getAttribLocation(program, name);

        if (location === -1) {
            console.warn(`Attribute: '${name}' not found in program.`);
            continue;
        };

        _gl.enableVertexAttribArray(location);
        _gl.vertexAttribPointer(location, size, type || _gl.FLOAT, normalized || false, stride || 0, offset || 0);
        if (divisor) _gl.vertexAttribDivisor(location, divisor);
    }
}