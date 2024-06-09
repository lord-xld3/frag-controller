import { _gl } from "./Context";

export default function newVAO() {
    const v = _gl.createVertexArray()!;
    return {
        bind: () => _gl.bindVertexArray(v),
        unbind: () => _gl.bindVertexArray(null),
        delete: () => _gl.deleteVertexArray(v),
    };
}