import { _gl } from "./Context";

export default function newVAO() {
    const v = _gl.createVertexArray()!;
    if (!v) console.warn(`Failed to create VertexArrayObject.`);
    return {
        bind: () => _gl.bindVertexArray(v),
        unbind: () => _gl.bindVertexArray(null),
        delete: () => _gl.deleteVertexArray(v),
    };
}