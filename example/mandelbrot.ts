import * as gluu from '../index';

export default function main(){
    // Slightly different initialization.
    const canvas = document.getElementById('mandelbrot-canvas') as HTMLCanvasElement;
    const [gl, resizeViewport, resizeCanvas] = gluu.init(canvas);

    const frag = `#version 300 es
    precision highp float;
    precision highp int;

    #define f gl_FragCoord.xy

    uniform I { uvec2 iResolution; vec2 iDelta; float iTime, iZoom; };
    uniform U { uvec2 J; vec2 E; vec3 C; };

    out vec4 o;

    const float Y = 12.;

    void main() {
        vec2 r = vec2(iResolution);
        float W = 1./(exp(iZoom)*r.y), F = E.y * W + E.x, K = float(J.y - J.x);
        vec2 n = (2.*f - r)*W + iDelta, p = n, z = n*n;
        int i = 0, H = int(K * pow(iZoom/Y, 2.)) + int(J.x);
        while (i < H && z.x < F) { n = vec2(z.x - z.y + p.x, 2.*n.x*n.y + p.y); z = n*n; ++i; }
        o = (i < H) ? vec4(.5 + .5 * cos(4. + (float(i) + 1. - log2(log2(dot(n, n)) / log2(F))) * .1 + C), 1) : vec4(0,0,0,1);
    }`;

    // Create program using a screen-space quad vertex shader.
    const [program, draw] = gluu.useSSQ(gl, frag);

    // In this usage, we let the user update the devicePixelRatio, so we don't get the dpr from the "true size".
    let dpr = window.devicePixelRatio;

    // Define control elements.
    const container = document.getElementById('mandelbrot') as HTMLDivElement,
        panel = document.getElementById('panel') as HTMLDivElement,
        controlDPR = gluu.newInputRange(panel, 'Resolution scale', dpr, dpr/8, dpr/2, dpr*2),
        controlZoom = gluu.newInputRange(panel, 'Zoom', 0, 1e-4, 0, 12),
        controlMinIter = gluu.newInputRange(panel, 'Min Iterations', 80, 1, 1, 400),
        controlMaxIter = gluu.newInputRange(panel, 'Max Iterations', 400, 1, 80, 1e3),
        controlEscapeMin = gluu.newInputRange(panel, 'Min Escape Radius', 6, 1e-4, 2, 10),
        controlEscapeMax = gluu.newInputRange(panel, 'Max Escape Radius', 0.5e4, 1e-4, 6, 1e4),
        controlHue = gluu.newInputRange(panel, 'Hue', 0.6, 1e-4, 0, 1);

    // Double tap function.
    container.ondblclick = (e) => {
        e.preventDefault();
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    };

    const [ISize] = gluu.getUniformBlock(gl, program, 'I', 0);
    const base = gluu.newUniformBuffer(gl, ISize, 0, new Uint32Array([
        // Resolution
        canvas.clientWidth, 
        canvas.clientHeight,
    ]));
    base.set(new Float32Array([
        -0.74, 0.18, // Delta
        0, // Time
        0, // Zoom
    ]), 8);

    // Triple press event listener.
    let H = 2/(canvas as HTMLCanvasElement).clientHeight * window.devicePixelRatio,
        ec: PointerEvent[] = [], // event cache
        z = 0, // default zoom level
        dx = -0.74, // delta x
        dy = 0.19, // delta y
        m = Math.exp(-z), // exp(-zoom)
        pd = 0; // previous distance between two pointers


    function setZoom(z: number) {
        m = Math.exp(-z);
        base.bind();
        base.set(new Float32Array([z]), 20);
    }

    gluu.pointerEvents(canvas, {
        down: (e)=>{
            ec.push(e);
            if (ec.length === 1) {
                canvas.setPointerCapture(e.pointerId);
            } else if (ec.length === 3) {
                panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
            }
        },
        move: (e)=>{
            if (ec.length === 1) {
                dx -= e.movementX * m * H,
                dy += e.movementY * m * H;
                base.bind();
                base.set(new Float32Array([dx, dy]), 8);
            }
            requestAnimationFrame(render);
        },
        up: (e)=>{ 
            ec = ec.filter((p)=>p.pointerId !== e.pointerId);
            if (ec.length === 0) {
                canvas.releasePointerCapture(e.pointerId);
            }
        },
        wheel: (e) => {
            e.preventDefault();
            setZoom(z -= e.deltaY * H);
            controlZoom.value = z.toString();
            requestAnimationFrame(render)
        }
    }).bind();

    // Resize listener.
    window.addEventListener('resize', () => {
        const [w, h] = resizeCanvas(dpr);
        resizeViewport(w, h);
        H = 2/canvas.clientHeight;
        base.bind();
        base.set(new Uint32Array([w, h]));
        requestAnimationFrame(render);
    });
    window.dispatchEvent(new Event('resize'));

    // Setup custom uniform block.
    const [USize] = gluu.getUniformBlock(gl, program, 'U', 1);
    const uni = gluu.newUniformBuffer(gl, USize, 1, new Uint32Array([80, 400]));
    uni.set(new Float32Array([
        6, 0.5e4, // min escape, max escape

        // Color hue.
        Math.cos(0.6 * Math.PI * 2),
        Math.cos(0.6 * Math.PI * 2 + 1),
        Math.cos(0.6 * Math.PI * 2 + 2),
    ]), 8);

    // Stream control elements to custom uniform block.
    controlDPR.oninput = () => {
        dpr = controlDPR.valueAsNumber;
        const [w, h] = resizeCanvas(dpr);
        resizeViewport(w, h);
        H = 2/canvas.clientHeight;
        base.bind();
        base.set(new Uint32Array([w, h]));
        requestAnimationFrame(render);
    }

    controlZoom.oninput = () => {
        z = controlZoom.valueAsNumber;
        setZoom(z);
        requestAnimationFrame(render);
    };

    controlMinIter.oninput = () => {
        controlMaxIter.min = controlMinIter.value;
        uni.bind();
        uni.set(new Uint32Array([controlMinIter.valueAsNumber]), 0);
        requestAnimationFrame(render);
    };

    controlMaxIter.oninput = () => {
        controlMinIter.max = controlMaxIter.value;
        uni.bind();
        uni.set(new Uint32Array([controlMaxIter.valueAsNumber]), 4);
        requestAnimationFrame(render);
    };

    controlEscapeMin.oninput = () => {
        controlEscapeMax.min = controlEscapeMin.value;
        uni.bind();
        uni.set(new Float32Array([controlEscapeMin.valueAsNumber]), 8);
        requestAnimationFrame(render);
    };

    controlEscapeMax.oninput = () => {
        uni.bind();
        uni.set(new Float32Array([controlEscapeMax.valueAsNumber]), 12);
        requestAnimationFrame(render);
    };

    controlHue.oninput = () => {
        const h = controlHue.valueAsNumber * Math.PI * 2;
        uni.bind();
        uni.set(new Float32Array([
            Math.cos(h),
            Math.cos(h + 1),
            Math.cos(h + 2),
        ]), 16);
        requestAnimationFrame(render);
    };

    // Fullscreen button.
    const fullscreen = document.getElementById('mb-fullscreen') as HTMLButtonElement;
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

    // Setup render loop.
    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 1);

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Draw a screen-space quad for the fragment shader.
        draw();
    }
    requestAnimationFrame(render);
}