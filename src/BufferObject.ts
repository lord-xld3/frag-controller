import { _gl } from "./Context";

export function newBufferObject(target: number, usage: number) {
    const buf = _gl.createBuffer()!;
    if (!buf) console.warn(`Failed to create BufferObject.`);
    return {
        buf,
        bind: () => _gl.bindBuffer(target, buf),
        unbind: () => _gl.bindBuffer(target, null),
        delete: () => _gl.deleteBuffer(buf),
        setBuffer: (data: ArrayBuffer) => _gl.bufferData(target, data, usage),
    };
};