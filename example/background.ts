import * as gluu from '../index';
export default function main(){
    const canvas = document.getElementById('background') as HTMLCanvasElement;
    const [gl, resizeViewport, resizeCanvas] = gluu.init(canvas);
    const frag = `#version 300 es
    precision highp float;
    precision highp int;

    // Rainbow Reciprocals by Kyle Simmons.

    #define f gl_FragCoord.xy

    uniform I { vec2 iMouse, iResolution; float iTime, iZoom; };

    out vec4 o;

    void main() {
        // Normalized pixel coordinates
        vec2 uv = iResolution * f - 1. - iMouse;

        // 1.0 / distance from center
        float dist = length(1./uv*iZoom);

        // Generate wave pattern
        float wave = iTime + dist;
        
        vec3 color = (0.5 + 0.5 * cos(2.0 * wave + vec3(0.0, 2.0, 4.0))) // RGB waves
            * (1.0 -smoothstep(0.4, 0.6, abs(sin(wave * 9.0)))); // Edge smoothing

        o = vec4(color, 1.0);
    }`;
    const [program, draw] = gluu.useSSQ(gl, frag);
    gluu.shaderCache.clear();
    //                                                Binding point 0.
    const [maxSize] = gluu.getUniformBlock(gl, program, 'I', 0);
    const uniformBuffer = gluu.newUniformBuffer(gl, maxSize, 0, new Float32Array([
        0, 0, // iMouse
        canvas.clientWidth, canvas.clientHeight, // iResolution
        0, // iTime
        0.1, // iZoom
    ]));

    let eCache: PointerEvent[] = [];
    let zoom = 0.1;
    gluu.pointerEvents(canvas, {
        down: (e) => {
            eCache.push(e);
            if (eCache.length === 1) canvas.setPointerCapture(e.pointerId);
        },
        move: (e) => {
            if (eCache.length === 0) return;
            uniformBuffer.set(new Float32Array([
                2.*e.offsetX / canvas.clientWidth - 1.0, 
                2.*-e.offsetY / canvas.clientHeight + 1.0
            ]), 0); 
        },
        up: (e) => {
            eCache = eCache.filter((ev) => ev.pointerId !== e.pointerId);
            canvas.releasePointerCapture(e.pointerId);
        },
        wheel: (e) => {
            uniformBuffer.set(new Float32Array([
                zoom = Math.min(
                    Math.max(
                        //TODO: We can probably improve the "scaling" of the zoom.
                        zoom - e.deltaY * 2e-4 * Math.exp(zoom), 
                        0.01
                    ), 
                    3.
                )
            ]), 20);
        }
    }).bind();

    // Resize listener.
    window.addEventListener('resize', () => {
        const [w, h] = resizeCanvas();
        resizeViewport(w, h);
        // Usually we would use uniformBuffer.bind(), but its the only buffer bound to UNIFORM_BUFFER.
        uniformBuffer.set(new Float32Array([2/w, 2/h]), 8);
    });
    window.dispatchEvent(new Event('resize'));

    // Fullscreen button.
    const fullscreen = document.getElementById('bg-fullscreen') as HTMLButtonElement;
    const container = document.getElementById('bg-container') as HTMLElement;
    fullscreen.onclick = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            fullscreen.value = '🔳';
        }
        // Target root <html> element.
        else {
            container.requestFullscreen();
            fullscreen.value = '🔲';
        }
    };
    

    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 1);

    function render(T: number) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        // Usually we would use uniformBuffer.bind(), but its the only buffer bound to UNIFORM_BUFFER.
        uniformBuffer.set(new Float32Array([T*2e-5]), 16); // Offset 8 bytes to iTime.

        draw();
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}