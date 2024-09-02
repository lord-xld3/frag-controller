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
    const oHue = 0,
        oTime = 12,
        oZoom = 16,
        oEsc = 20,
        oScale = 24,
        oDark = 28,
        oResolution = 32,
        oDelta = 40,
        oMinIter = 48,
        oMaxIter = 52;

        let H: number,
        ec: PointerEvent[] = [], // event cache
        z = 9, // default zoom level
        dx = -0.74, // delta x
        dy = 0.18, // delta y
        m = Math.exp(-z), // exp(-zoom)
        pd = 0; // previous distance between two pointers
    
    base(new Float32Array([
        3,4,5, // Color
        0, // Time
        z, // Zoom
        250, // Escape
        .2, // Color-Scale
        .5, // dark
        0, 0, // resolution
        -0.74, 0.18, // Delta
    ]))
    base(new Uint32Array([
        80, // min iter
        400 // max iter
    ]), oMinIter)

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
        }
    });

    const controlZoom = Object.assign(document.createElement('input'), {
        type: 'range',
        id: 'zoom',
        step: "1e-4",
        min: "0",
        max: "12",
        value: z.toString(),
        oninput: () => {
            z = controlZoom.valueAsNumber;
            setZoom(z);
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
        }
    })

    const controlMaxIter = Object.assign(document.createElement('input'), {
        type: 'range',
        id: 'maxIter',
        step: "1",
        min: "80",
        max: "1000",
        value: "300",
        oninput: () => {
            controlMinIter.max = controlMaxIter.value.toString();
            base(new Uint32Array([controlMaxIter.valueAsNumber]), oMaxIter);
        }
    })

    const controlEsc = Object.assign(document.createElement('input'), {
        type: 'range',
        id: 'maxEscape',
        step: "1e-4",
        min: "4",
        max: "500",
        value: "250",
        oninput: () => {
            base(new Float32Array([controlEsc.valueAsNumber]), oEsc);
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
        }
    })

    const controlColorScale = Object.assign(document.createElement('input'), {
        type: 'range',
        id: 'colorScale',
        step: "1e-4",
        min: "0",
        max: "1",
        value: ".2",
        oninput: () => {
            base(new Float32Array([controlColorScale.valueAsNumber]), oScale);
        }
    })
    
    const controlDark = Object.assign(document.createElement('input'), {
        type: 'range',
        id: 'colorDark',
        step: "1e-4",
        min: "0",
        max: "3",
        value: ".5",
        oninput: () => {
            base(new Float32Array([controlDark.valueAsNumber]), oDark);
        }
    })

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
        },
        onpointercancel: upfunc,
        onpointerleave: upfunc,
        onpointerout: upfunc,
        onpointerup: upfunc,
    })

    canvas.addEventListener('wheel', (e: WheelEvent) => {
        e.preventDefault();
        setZoom(z -= e.deltaY * H);
    }, {passive: false});
    
    document.getElementById('canvas-content')!.append(gluu.canvasTemplate(canvas, "mandelbrot", "Mandelbrot Set Explorer",
        document.createElement('div'),
        gluu.controlTemplate(controlDPR, "Resolution"),
        gluu.controlTemplate(controlZoom, "Zoom"),
        gluu.controlTemplate(controlMinIter, "Min Iterations"),
        gluu.controlTemplate(controlMaxIter, "Max Iterations"),
        gluu.controlTemplate(controlEsc, "Escape"),
        gluu.controlTemplate(controlHue, "Hue"),
        gluu.controlTemplate(controlColorScale, "Color Scale"),
        gluu.controlTemplate(controlDark, "Darken"),
    ));

    // Resize listener.
    window.addEventListener('resize', () => {
        const [w, h] = resizeCanvas(dpr);
        resizeViewport(w, h);
        setResolution(w, h);
    });
    window.dispatchEvent(new Event('resize'));

    // Setup render loop.
    gl.clearColor(0, 0, 0, 1);

    function render(T: number) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        base(new Float32Array([T]), oTime)
        draw();
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}