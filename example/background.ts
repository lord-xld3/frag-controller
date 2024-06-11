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
            * (1.0 - smoothstep(0.4, 0.6, abs(sin(wave * 9.0)))); // Edge smoothing

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

    // Fullscreen button.
    const fullscreen = document.getElementById('bg-fullscreen') as HTMLButtonElement;
    const container = document.getElementById('bg-container') as HTMLElement;
    const fscontainer = document.getElementById('bg-fullscreen-container') as HTMLElement;
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

    canvas.ondblclick = (e) => {
        e.preventDefault();
        fscontainer.style.display = fscontainer.style.display === 'none' ? 'block' : 'none';
    };

    let H = 2/canvas.clientHeight * window.devicePixelRatio;
    let eCache: PointerEvent[] = [];
    let z = 0.1;
    let pd = 0;
    gluu.pointerEvents(canvas, {
        down: (e) => {
            eCache.push(e);
            if (eCache.length === 1) canvas.setPointerCapture(e.pointerId);
            if (eCache.length === 3) fscontainer.style.display = fscontainer.style.display === 'none' ? 'block' : 'none';
        },
        move: (e) => {
            let f = eCache.findIndex(ev => ev.pointerId === e.pointerId);
            eCache[f] = e;
            if (eCache.length === 1) {
                uniformBuffer.set(new Float32Array([
                    2.*e.offsetX / canvas.clientWidth - 1.0, 
                    2.*-e.offsetY / canvas.clientHeight + 1.0
                ]), 0); 
            }
            else if (eCache.length === 2 && e.isPrimary) {
                const [e1, e2] = eCache;
                const d = Math.hypot(e1.clientX - e2.clientX, e1.clientY - e2.clientY);
                if (pd === 0) return pd = d;
                uniformBuffer.set(new Float32Array([z = Math.max(z + (d - pd) * z * H * 4, .01)]), 20);
                pd = d;
            }
        },
        up: (e) => {
            eCache = eCache.filter((ev) => ev.pointerId !== e.pointerId);
            if (eCache.length < 2) pd = 0;
            canvas.releasePointerCapture(e.pointerId);
        },
        wheel: (e) => {
            e.preventDefault();
            uniformBuffer.set(new Float32Array([
                z = Math.max(z - e.deltaY * z * H, .01),
            ]), 20);
        }
    }).bind();

    // Resize listener.
    window.addEventListener('resize', () => {
        const [w, h] = resizeCanvas();
        resizeViewport(w, h);
        H = 2/h;
        // Usually we would use uniformBuffer.bind(), but its the only buffer bound to UNIFORM_BUFFER.
        uniformBuffer.set(new Float32Array([2/w, H]), 8);
        
    });
    window.dispatchEvent(new Event('resize'));
    
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