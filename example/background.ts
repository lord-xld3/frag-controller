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
    gluu.clearShaderCache();

    const [maxSize] = gluu.getUniformBlocks([[program, ['I']]]);
    const uniformBuffer = gluu.newUniformBuffer(maxSize, new Float32Array([...gluu.scaleToDevice(), 0]));

    // Resize listener.
    window.onresize = () => {
        gluu.resizeViewportToCanvas();
        // Usually we would use uniformBuffer.bind(), but its the only buffer bound to UNIFORM_BUFFER.
        uniformBuffer.setSubBuffer(new Float32Array(gluu.scaleToDevice()));
        requestAnimationFrame(render);
    };
    window.dispatchEvent(new Event('resize'));
    

    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 1);

    function render(T: number) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Usually we would use uniformBuffer.bind(), but its the only buffer bound to UNIFORM_BUFFER.
        // We could also use .set() and .update(), but we don't need to update the whole buffer.

        uniformBuffer.setSubBuffer(new Float32Array([T * 1e-3]), 8); // Offset 8 bytes to iTime.

        draw();
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}