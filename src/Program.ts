import newVAO from "./VertexArrayObject";
import { newBuffer } from "./BufferObject";
import { mapAttributes } from "./Attributes";

/**
 * Creates a new program from a vertex and fragment shader.
 * @param gl - The WebGL2RenderingContext.
 * @param vert - The vertex shader source.
 * @param frag - The fragment shader source.
 * @returns The WebGLProgram.
 */
export function newProgram(gl: WebGL2RenderingContext, vert: string, frag: string) {
    function compileShader(type: number, source: string) {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader)!);
        }
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
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return program;
};

/**
 * Creates a "Screen Space Quad" program. A.K.A. two triangles that cover the entire screen.
 * @param gl - The WebGL2RenderingContext.
 * @param frag - The fragment shader source.
 * @return A draw function() with a program property: p
 */
export function useSSQ(gl: WebGL2RenderingContext, frag: string) {
    let program = newProgram(gl, `#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}`, frag),
        v = newVAO(gl);
    
    // Bind program
    gl.useProgram(program);
    
    // Bind VertexArrayObject
    v();

    // Size 48 bytes, ARRAY_BUFFER, STATIC_DRAW
    newBuffer(gl, 48, 0x8892, 0x88E4)(new Float32Array([
        -1,-1,
        1,-1,
        -1,1,
        -1,1,
        1,-1,
        1,1
    ]))
    mapAttributes(gl, program, 
        [
            { name: 'a', size: 2 }
        ]
    )

    return Object.assign(
        /**
         * Draw the SSQ program.
         */
        () => {
            gl.useProgram(program);
            v();
            gl.drawArrays(0x0004, 0, 6); 
        }, 
        { 
            /** WebGLProgram */
            program
        }
    )
};