import { _gl } from "./Context";
import newVAO from "./VertexArrayObject";

function compileShader(type: number, source: string) {
    const shader = _gl.createShader(type)!;
    _gl.shaderSource(shader, source);
    _gl.compileShader(shader);
    if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
        throw new Error(_gl.getShaderInfoLog(shader)!);
    }
    return shader;
};

export function newProgram(vert: string, frag: string) {
    const program = _gl.createProgram()!,
        vs = compileShader(_gl.VERTEX_SHADER, vert),
        fs = compileShader(_gl.FRAGMENT_SHADER, frag);

    _gl.attachShader(program, vs);
    _gl.attachShader(program, fs);
    _gl.linkProgram(program);
    if (!_gl.getProgramParameter(program, _gl.LINK_STATUS)) {
        throw new Error(_gl.getProgramInfoLog(program)!);
    }
    return program;
};

export function useSSQ(frag: string): [WebGLProgram, () => void] {
    const p = newProgram(`#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}`, frag),
        v = newVAO();
    _gl.useProgram(p);
    const l = _gl.getAttribLocation(p, 'a');
    v.bind();
    _gl.bindBuffer(_gl.ARRAY_BUFFER, _gl.createBuffer());
    _gl.bufferData(_gl.ARRAY_BUFFER, 
        new Float32Array([
            -1,-1,
            1,-1,
            -1,1,
            -1,1,
            1,-1,
            1,1
        ]), 
        _gl.STATIC_DRAW
    );
    _gl.enableVertexAttribArray(l);
    _gl.vertexAttribPointer(l, 2, _gl.FLOAT, false, 0, 0);
    return [
        p, 
        function () {
            v.bind();
            _gl.drawArrays(_gl.TRIANGLES, 0, 6); 
        }
    ]
};