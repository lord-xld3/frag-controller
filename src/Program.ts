
import newVAO from "./VertexArrayObject";
import { newBufferObject } from "./BufferObject";
import { mapAttributes } from "./Attributes";

export const shaderCache = new Map<string, WebGLShader>();

/**
 * Creates a new program from a vertex and fragment shader.
 * @param gl - The WebGL2RenderingContext.
 * @param vert - The vertex shader source.
 * @param frag - The fragment shader source.
 * @returns The WebGLProgram.
 */
export function newProgram(gl: WebGL2RenderingContext, vert: string, frag: string) {
    function compileShader(type: number, source: string) {
        if (shaderCache.has(source)) return shaderCache.get(source)!;
    
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader)!);
        }
    
        shaderCache.set(source, shader);
        return shader;
    };

    const program = gl.createProgram()!,
        vs = compileShader(gl.VERTEX_SHADER, vert),
        fs = compileShader(gl.FRAGMENT_SHADER, frag);

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program)!);
    }
    return program;
};

/**
 * Creates a "Screen Space Quad" program. A.K.A. two triangles that cover the entire screen.
 * @param gl - The WebGL2RenderingContext.
 * @param frag - The fragment shader source.
 * @returns [Program, draw function()]
 * @example const [program, draw] = useSSQ(gl, `#version 300...`)
 */
export function useSSQ(gl: WebGL2RenderingContext, frag: string): [WebGLProgram, DrawFunction] {
    const p = newProgram(gl, `#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}`, frag),
        v = newVAO(gl);
    
    gl.useProgram(p);
    
    v.bind();
    newBufferObject(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array([
        -1,-1,
        1,-1,
        -1,1,
        -1,1,
        1,-1,
        1,1
    ]));
    mapAttributes(gl, p, 
        [
            { name: 'a', size: 2 }
        ]
    )
    v.unbind();

    return [
        p, 
        function () {
            gl.useProgram(p);
            v.bind();
            gl.drawArrays(gl.TRIANGLES, 0, 6); 
        }
    ]
};

type DrawFunction = () => void;