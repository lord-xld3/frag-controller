/**
 * Maps vertex attributes to a program.
 * @param gl - WebGL2Context
 * @param program - WebGLProgram
 * @param attributes - Attributes to map.
 * @example mapAttributes(gl, program, [
 * { name: 'a_position', size: 2 },
 * { name: 'a_uv', size: 2 },
 * ]);
 */
export function mapAttributes(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    attributes: {
        name: string;
        size: number;
        type?: GLenum;
        normalized?: boolean;
        stride?: number;
        offset?: number;
        divisor?: number;
    }[]
): void {
    let i = 0, len = attributes.length;
    for (; i < len; i++) {
        const { name, size, type, normalized, stride, offset, divisor } = attributes[i], 
            location = gl.getAttribLocation(program, name);

        if (location === -1) {
            console.warn(`Attribute: '${name}' not found in program.`);
            continue;
        };

        gl.enableVertexAttribArray(location);
        //                                   gl.float == 5126
        gl.vertexAttribPointer(location, size, type || 5126, normalized || false, stride || 0, offset || 0);
        if (divisor) gl.vertexAttribDivisor(location, divisor);
    }
}