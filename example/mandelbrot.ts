import * as gluu from '../index';
export default function loadMandelbrot() {
    const canvas = document.createElement('canvas');
    const [gl, resizeViewport, resizeCanvas] = gluu.init(canvas, {
        alpha: false,
        antialias: false,
        depth: false,
        powerPreference: 'high-performance',
    });

    const draw = gluu.useSSQ(gl, document.getElementById('mandelbrot-shader')!.textContent!);

    // In this usage, we let the user update the devicePixelRatio, so we don't get the dpr from the "true size".
    let dpr = window.devicePixelRatio;

    const uniformBlock = gluu.getUniformBlock(gl, draw.program, 'z')
    uniformBlock(0)
    const base = gluu.newUniformBuffer(gl, uniformBlock.size);
    base.bufferIndex(0)

    // Define uniform offsets in shader
    const oResolution = 8,
        oZoom = 20,
        oMinIter = 24,
        oMaxIter = 28,
        oMinEsc = 32,
        oMaxEsc = 36,
        oDelta = 40,
        oHue = 48,
        oScale = 60;
    
    base(new Float32Array([
        canvas.clientWidth * dpr, canvas.clientHeight * dpr, //[8]
        0, // Time //[16]
        0, // Zoom //[20]
    ]), oResolution)
    base(new Uint32Array([
        80, // min iter //[24]
        400] // max iter //[28]
    ), oMinIter)
    base(new Float32Array([
        6, 0.5e4, // Escape //[32]
        -0.74, 0.18, // Delta //[40]
        3,4,5, // Color //[48]
        0.1 // Color-Scale //[60]
    ]), oMinEsc);

    function setZoom(z: number) {
        controlZoom.value = z.toString();;
        m = Math.exp(-z);
        base(new Float32Array([z]), oZoom);
    }

    function setResolution(w: number, h: number) {
        H = 2/canvas.clientHeight;
        base(new Float32Array([w, h]), oResolution)
    }

    const controlDPR = Object.assign(document.createElement('input'), {
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
            setResolution(w, h);
            requestAnimationFrame(render);
        }
    });

    const controlZoom = Object.assign(document.createElement('input'), {
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

    const controlMinIter = Object.assign(document.createElement('input'), {
        type: 'range',
        id: 'minIter',
        step: "1",
        min: "0",
        max: "400",
        value: "80",
        oninput: () => {
            controlMaxIter.min = controlMinIter.value.toString();
            base(new Uint32Array([controlMinIter.valueAsNumber]), oMinIter);
            requestAnimationFrame(render);
        }
    })

    const controlMaxIter = Object.assign(document.createElement('input'), {
        type: 'range',
        id: 'maxIter',
        step: "1",
        min: "80",
        max: "1000",
        value: "400",
        oninput: () => {
            controlMinIter.max = controlMaxIter.value.toString();
            base(new Uint32Array([controlMaxIter.valueAsNumber]), oMaxIter);
            requestAnimationFrame(render);
        }
    })

    const controlEscapeMin = Object.assign(document.createElement('input'), {
        type: 'range',
        id: 'minEscape',
        step: "1e-4",
        min: "0",
        max: "12",
        value: "6",
        oninput: () => {
            controlEscapeMax.min = controlEscapeMin.value.toString();
            base(new Float32Array([controlEscapeMin.valueAsNumber]), oMinEsc);
            requestAnimationFrame(render);
        }
    })

    const controlEscapeMax = Object.assign(document.createElement('input'), {
        type: 'range',
        id: 'maxEscape',
        step: "1e-4",
        min: "6",
        max: "1e4",
        value: "5e3",
        oninput: () => {
            base(new Float32Array([controlEscapeMax.valueAsNumber]), oMaxEsc);
            requestAnimationFrame(render);
        }
    })

    const controlHue = Object.assign(document.createElement('input'), {
        type: 'range',
        id: 'hue',
        step: "1e-4",
        min: "0",
        max: "1",
        value: "0",
        oninput: () => {
            base(new Float32Array([
                ...gluu.adjustNonZeroHue(3, 4, 5, controlHue.valueAsNumber)
            ]), oHue);
            requestAnimationFrame(render);
        }
    })

    const controlColorScale = Object.assign(document.createElement('input'), {
        type: 'range',
        id: 'colorScale',
        step: "1e-4",
        min: "0",
        max: ".5",
        value: ".1",
        oninput: () => {
            base(new Float32Array([controlColorScale.valueAsNumber]), oScale);
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

    Object.assign(canvas, {
        onpointerdown: (e: PointerEvent) => {
            ec.push(e);
            if (ec.length === 1) {
                canvas.setPointerCapture(e.pointerId)
            }
        },
        onpointermove: (e: PointerEvent) => {
            ec[ec.findIndex(ev => ev.pointerId === e.pointerId)] = e;
            if (ec.length === 1) {
                dx -= e.movementX * m * H,
                dy += e.movementY * m * H;
                base(new Float32Array([dx, dy]), oDelta);
            }
            else if (ec.length === 2 && e.isPrimary) {
                const [e1, e2] = ec;
                const d = Math.hypot(e1.offsetX - e2.offsetX, e1.offsetY - e2.offsetY);
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
        document.createElement('div'),
        gluu.controlTemplate(controlDPR, "Resolution"),
        gluu.controlTemplate(controlZoom, "Zoom"),
        gluu.controlTemplate(controlMinIter, "Min Iterations"),
        gluu.controlTemplate(controlMaxIter, "Max Iterations"),
        gluu.controlTemplate(controlEscapeMin, "Min Escape"),
        gluu.controlTemplate(controlEscapeMax, "Max Escape"),
        gluu.controlTemplate(controlHue, "Hue"),
        gluu.controlTemplate(controlColorScale, "Color Scale")
    ));

    // Resize listener.
    window.addEventListener('resize', () => {
        const [w, h] = resizeCanvas(dpr);
        resizeViewport(w, h);
        setResolution(w, h);
        requestAnimationFrame(render);
    });
    window.dispatchEvent(new Event('resize'));

    // Setup render loop.
    gl.clearColor(0, 0, 0, 1);

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        draw();
    }
    requestAnimationFrame(render);
}