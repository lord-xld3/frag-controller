import * as gluu from '../index';

export default async function loadMandelbrot() {
    const canvas = document.createElement('canvas');
    const [gl, resizeViewport, resizeCanvas] = gluu.init(canvas, {
        alpha: false,
        antialias: false,
        depth: false,
        powerPreference: 'high-performance',
    });

    let frag = await fetch('./shaders/mandelbrot.fs').then((res) => res.text());
    let [program, draw] = gluu.useSSQ(gl, frag);

    // In this usage, we let the user update the devicePixelRatio, so we don't get the dpr from the "true size".
    let dpr = window.devicePixelRatio;

    const [ISize] = gluu.getUniformBlock(gl, program, 'U');
    const base = gluu.newUniformBuffer(gl, ISize);
    base(new Uint32Array([80, 400]))
    base(new Float32Array([
        // Escape
        6, 0.5e4,
        // Resolution
        canvas.clientWidth * dpr, canvas.clientHeight * dpr,
        -0.74, 0.18, // Delta
        // Color
        3,4,5,
        0, // Zoom
        0.1 // Color-Scale
    ]), 8);

    function setZoom(z: number) {
        controlZoom.value = z.toString();;
        m = Math.exp(-z);
        base(new Float32Array([z]), 44);
    }

    function setResolution(w: number, h: number) {
        base(new Float32Array([w, h]), 16)
    }

    const controlDPR = gluu.obj(document.createElement('input'), {
        type: 'range',
        id: 'dpr',
        step: (dpr*.25).toString(),
        min: (dpr*.5).toString(),
        max: (dpr*2).toString(),
        value: dpr.toString(),
        oninput: () => {
            dpr = controlDPR.valueAsNumber;
            const [w, h] = resizeCanvas(dpr);
            resizeViewport(w, h);
            H = 2/canvas.clientHeight;
            setResolution(w, h);
            requestAnimationFrame(render);
        }
    });

    const controlZoom = gluu.obj(document.createElement('input'), {
        type: 'range',
        id: 'zoom',
        step: "1e-4",
        min: "0",
        max: "12",
        value: "0",
        oninput: () => {
            z = controlZoom.valueAsNumber;
            setZoom(z);
            requestAnimationFrame(render);
        }
    })

    const controlMinIter = gluu.obj(document.createElement('input'), {
        type: 'range',
        id: 'minIter',
        step: "1",
        min: "0",
        max: "400",
        value: "80",
        oninput: () => {
            controlMaxIter.min = controlMinIter.value.toString();
            base(new Uint32Array([controlMinIter.valueAsNumber]), 0);
            requestAnimationFrame(render);
        }
    })

    const controlMaxIter = gluu.obj(document.createElement('input'), {
        type: 'range',
        id: 'maxIter',
        step: "1",
        min: "80",
        max: "1000",
        value: "400",
        oninput: () => {
            controlMinIter.max = controlMaxIter.value.toString();
            base(new Uint32Array([controlMaxIter.valueAsNumber]), 4);
            requestAnimationFrame(render);
        }
    })

    const controlEscapeMin = gluu.obj(document.createElement('input'), {
        type: 'range',
        id: 'minEscape',
        step: "1e-4",
        min: "0",
        max: "12",
        value: "6",
        oninput: () => {
            controlEscapeMax.min = controlEscapeMin.value.toString();
            base(new Float32Array([controlEscapeMin.valueAsNumber]), 8);
            requestAnimationFrame(render);
        }
    })

    const controlEscapeMax = gluu.obj(document.createElement('input'), {
        type: 'range',
        id: 'maxEscape',
        step: "1e-4",
        min: "6",
        max: "1e4",
        value: "5e3",
        oninput: () => {
            base(new Float32Array([controlEscapeMax.valueAsNumber]), 12);
            requestAnimationFrame(render);
        }
    })

    const controlHue = gluu.obj(document.createElement('input'), {
        type: 'range',
        id: 'hue',
        step: "1e-4",
        min: "0",
        max: "1",
        value: "0",
        oninput: () => {
            base(new Float32Array([
                ...gluu.adjustNonZeroHue(3, 4, 5, controlHue.valueAsNumber)
            ]), 32);
            requestAnimationFrame(render);
        }
    })

    const controlColorScale = gluu.obj(document.createElement('input'), {
        type: 'range',
        id: 'colorScale',
        step: "1e-4",
        min: "0",
        max: ".5",
        value: ".1",
        oninput: () => {
            base(new Float32Array([controlColorScale.valueAsNumber]), 48);
            requestAnimationFrame(render);
        }
    })
    
    let H: number,
        ec: PointerEvent[] = [], // event cache
        z = 0, // default zoom level
        dx = -0.74, // delta x
        dy = 0.18, // delta y
        m = Math.exp(-z), // exp(-zoom)
        pd = 0; // previous distance between two pointers

    let upfunc = (e: PointerEvent) => {
        ec = ec.filter((p)=>p.pointerId !== e.pointerId);
        if (ec.length < 2) pd = 0;
        canvas.releasePointerCapture(e.pointerId);
    };

    gluu.obj(canvas, {
        onpointerdown: (e: PointerEvent) => {
            ec.push(e);
            if (ec.length === 1) {
                canvas.setPointerCapture(e.pointerId)
            }
        },
        onpointermove: (e: PointerEvent) => {
            let f = ec.findIndex(ev => ev.pointerId === e.pointerId);
            ec[f] = e;
            if (ec.length === 1) {
                dx -= e.movementX * m * H,
                dy += e.movementY * m * H;
                base(new Float32Array([dx, dy]), 24);
            }
            if (ec.length === 2 && e.isPrimary) {
                const [e1, e2] = ec;
                const d = Math.hypot(e1.clientX - e2.clientX, e1.clientY - e2.clientY);
                if (pd) {
                    setZoom(z += (d - pd) * H * 2);
                }
                pd = d;
            }
            requestAnimationFrame(render);
        },
        onpointercancel: upfunc,
        onpointerleave: upfunc,
        onpointerout: upfunc,
        onpointerup: upfunc,
    })

    canvas.addEventListener('wheel', (e: WheelEvent) => {
        e.preventDefault();
        setZoom(z -= e.deltaY * H);
        requestAnimationFrame(render)
    }, {passive: false});
    
    document.getElementById('canvas-content')!.append(gluu.canvasTemplate(canvas, "mandelbrot", "Mandelbrot Set Explorer",
        gluu.controlTemplate(controlDPR, "Resolution Scale"),
        gluu.controlTemplate(controlZoom, "Zoom"),
        gluu.controlTemplate(controlMinIter, "Min Iterations"),
        gluu.controlTemplate(controlMaxIter, "Max Iterations"),
        gluu.controlTemplate(controlEscapeMin, "Min Escape"),
        gluu.controlTemplate(controlEscapeMax, "Max Escape"),
        gluu.controlTemplate(controlHue, "Hue"),
        gluu.controlTemplate(controlColorScale, "Color Scale")
    ));

    // Fullscreen button.
    // const fullscreen = document.getElementById('mb-fullscreen') as HTMLButtonElement;
    // fullscreen.onclick = () => {
    //     if (document.fullscreenElement) {
    //         document.exitFullscreen();
    //         fullscreen.value = '🔳';
    //     }
    //     // Target root <html> element.
    //     else {
    //         container.requestFullscreen();
    //         fullscreen.value = '🔲';
    //     }
    // };

    // Resize listener.
    window.addEventListener('resize', () => {
        const [w, h] = resizeCanvas(dpr);
        resizeViewport(w, h);
        H = 2/canvas.clientHeight;
        setResolution(w, h);
        requestAnimationFrame(render);
    });
    window.dispatchEvent(new Event('resize'));

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