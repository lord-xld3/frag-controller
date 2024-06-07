import { newBufferObject } from "./BufferObject";

// Think of the VBO like an 'ArrayBuffer', and think of the VAO like a 'View' into that buffer.

/**
 * Creates a VertexBufferObject and binds it.
 * @param data - The data to be stored in the buffer.
 * @param usage - The usage pattern of the buffer.
 */
export default function newVBO(
    data: ArrayBuffer | ArrayBufferView,
    usage: GLenum = WebGL2RenderingContext.STATIC_DRAW,
) {
    const buffer = newBufferObject(WebGL2RenderingContext.ARRAY_BUFFER, usage);

    // Bind VBO and set buffer data.
    buffer.bind();
    buffer.setBuffer(data);

    return buffer;
}