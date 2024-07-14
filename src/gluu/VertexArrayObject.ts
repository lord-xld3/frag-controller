/**
 * Creates a new Vertex Array Object with methods to use it.
 * @param gl - The WebGL2RenderingContext.
 */
export default function newVAO(gl: WebGL2RenderingContext): VertexArrayObject {
    const v = gl.createVertexArray()!;
    return Object.assign(
        () => gl.bindVertexArray(v),
        {
            unbind: () => gl.bindVertexArray(null),
        }
    );
}

interface VertexArrayObject {
    /** Bind VertexArrayObject target */
    (): void;
    /** Unbind VertexArrayObject target */
    unbind: () => void;
}