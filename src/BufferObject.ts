import { _gl } from "./Context";
import { TypedArray } from "./Types";

export interface BufferObject {
    buf: WebGLBuffer;
    bind: () => void;
    unbind: () => void;
    delete: () => void;
    setBuffer: (data: ArrayBuffer | ArrayBufferView) => void;
    setSubBuffer: (data: TypedArray, dstByteOffset?: number, srcOffset?: number, length?: number) => void;
}

export function newBufferObject(target: number, usage: number) {
    const buf = _gl.createBuffer()!;
    if (!buf) console.warn(`Failed to create BufferObject.`);
    return {
        buf,
        bind: () => _gl.bindBuffer(target, buf),
        unbind: () => _gl.bindBuffer(target, null),
        delete: () => _gl.deleteBuffer(buf),
        setBuffer: (data: ArrayBuffer | ArrayBufferView) => _gl.bufferData(target, data, usage),
        setSubBuffer: (
            data: TypedArray, 
            dstByteOffset: number = 0,
            srcOffset: number = 0,
            length: number = data.length
        ) => _gl.bufferSubData(target, dstByteOffset, data, srcOffset, length),
    };
};