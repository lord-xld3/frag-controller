/**
 * Creates a new Vertex Array Object with methods to use it.
 * @param gl - The WebGL2RenderingContext.
 */
export default function newVAO(gl: WebGL2RenderingContext) {
    const v = gl.createVertexArray()!;
    return {
        bind: () => gl.bindVertexArray(v),
        unbind: () => gl.bindVertexArray(null),
    };
}