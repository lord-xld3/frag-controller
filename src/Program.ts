import { _gl } from "./Context";
import newVAO from "./VertexArrayObject";
import { newVBO, mapAttributes } from "./VertexBufferObject";

const _shaderCache = new Map<string, WebGLShader>();

export function clearShaderCache() { _shaderCache.clear(); }

function compileShader(type: number, source: string) {
    if (_shaderCache.has(source)) return _shaderCache.get(source)!;

    const shader = _gl.createShader(type)!;
    _gl.shaderSource(shader, source);
    _gl.compileShader(shader);
    if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
        throw new Error(_gl.getShaderInfoLog(shader)!);
    }

    _shaderCache.set(source, shader);
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

/**
 * Creates a "Screen Space Quad" program. A.K.A. two triangles that cover the entire screen.
 * @param frag - The fragment shader source.
 * @returns [Program, draw function()]
 */
export function useSSQ(frag: string): [WebGLProgram, () => void] {
    const p = newProgram(`#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}`, frag),
        v = newVAO();
    
    _gl.useProgram(p);
    

    v.bind();
    newVBO(new Float32Array([
        -1,-1,
        1,-1,
        -1,1,
        -1,1,
        1,-1,
        1,1
    ]));
    mapAttributes(p, 
        [
            { name: 'a', size: 2 }
        ]
    )
    v.unbind();

    return [
        p, 
        function () {
            _gl.useProgram(p);
            v.bind();
            _gl.drawArrays(_gl.TRIANGLES, 0, 6); 
        }
    ]
};