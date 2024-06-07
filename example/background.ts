import * as gluu from '../index';

export default function main(){
    const canvas = document.getElementById('background') as HTMLCanvasElement;
    const gl = gluu.init(canvas);
    const frag = `#version 300 es
    precision highp float;
    precision highp int;

    #define f gl_FragCoord.xy

    uniform I { vec2 iResolution; float iTime; };

    out vec4 o;

    void main() {
        vec2 uv = f * iResolution - 1.0;
        vec2 center = uv * 0.5;
        float dist = length(center);
        float angle = atan(center.y, center.x);
        float wave = sin(iTime + dist * 10.0 + angle * 5.0);

        // Define black edges
        float edge = smoothstep(0.4, 0.5, abs(sin(wave * 10.0)));
        vec3 color = 0.5 + 0.5 * cos(2.0 * wave + vec3(0.0, 2.0, 4.0) + iTime);
        color = color * (1.0 - edge); // Apply edges

        o = vec4(color, 1.0);
    }`;
    const [program, draw] = gluu.useSSQ(frag);

    gl.uniformBlockBinding(program, gl.getUniformBlockIndex(program, 'I'), 0);
    const ubo = gluu.newBufferObject(gl.UNIFORM_BUFFER, gl.STATIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, ubo.buf);
    gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array([canvas.width, canvas.height, 0]), gl.STATIC_DRAW);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, ubo.buf);

    // Resize listener.
    window.onresize = () => {
        canvas.width = canvas.clientWidth * window.devicePixelRatio;
        canvas.height = canvas.clientHeight * window.devicePixelRatio;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, new Float32Array(gluu.scaleToDevice()));
        requestAnimationFrame(render);
    };
    window.dispatchEvent(new Event('resize'));
    

    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 1);

    function render(T: number) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 8, new Float32Array([T * 1e-3]));

        draw();
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}