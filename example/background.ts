import * as gluu from '../index';

export default async function loadBackground() {
    const canvas = document.createElement('canvas');
    const [gl, resizeViewport, resizeCanvas] = gluu.init(canvas, {
        alpha: false,
        antialias: false,
        depth: false,
        powerPreference: 'high-performance',
    });

    let frag = await fetch('./shaders/background.fs').then((res) => res.text());
    let [program, draw] = gluu.useSSQ(gl, frag);

    const [ISize] = gluu.getUniformBlock(gl, program, 'U');
    const base = gluu.newUniformBuffer(gl, ISize);
    base(new Float32Array([
        0, 0, // mouse
        0, 0, // resolution
        0, // time
        1 // zoom
    ]))

    function setZoom(z: number) {
        m = Math.exp(-z);
        base(new Float32Array([z]), 20);
    }

    function setResolution(w: number, h: number) {
        [W, H] = [2/w, 2/h];
        base(new Float32Array([W, H]), 8)
    }
    
    let W: number,
        H: number,
        ec: PointerEvent[] = [], // event cache
        z = 1, // default zoom level
        m = Math.exp(-z), // exp(-zoom)
        pd = 0; // previous distance between two pointers

    let upfunc = (e: PointerEvent) => {
        ec = ec.filter((p)=>p.pointerId !== e.pointerId);
        if (ec.length < 2) pd = 0;
        canvas.releasePointerCapture(e.pointerId);
    };

    gluu.obj(canvas, {
        className: 'canvas-element fixed-canvas',
        id: 'canvas-background',
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
                base(new Float32Array([e.clientX*W - 1, e.clientY*H - 1,]));
            }
            if (ec.length === 2 && e.isPrimary) {
                const [e1, e2] = ec;
                const d = Math.hypot(e1.clientX - e2.clientX, e1.clientY - e2.clientY);
                if (pd) {
                    setZoom(z = Math.max(z + (d - pd) * z*H*m * 2, .5));
                }
                pd = d;
            }
        },
        onpointercancel: upfunc,
        onpointerleave: upfunc,
        onpointerout: upfunc,
        onpointerup: upfunc,
    });
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        setZoom(z = Math.max(z - e.deltaY * z*H*m *.5, .5));
    }, { passive: false });

    const box = gluu.obj(document.createElement('div'), {
        className: 'canvas-box',
        id: `background-box`,
        ondblclick: () => {
            fs.style.display = fs.style.display === 'none' ? 'flex' : 'none';
        }
    });

    
    const fs = gluu.obj(document.createElement('button'), {
        className: 'fullscreen-button',
        id: `background-fullscreen`,
        textContent: 'Fullscreen',
        onclick: () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                box.requestFullscreen();
            }
        },
    });

    box.append(canvas, fs);
    document.body.prepend(box);
  
    // Resize listener.
    window.addEventListener('resize', () => {
        const [w, h] = resizeCanvas();
        resizeViewport(w, h);
        setResolution(w, h);
    });
    window.dispatchEvent(new Event('resize'));

    // Setup render loop.
    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 1);

    function render(T: number) {
        gl.clear(gl.COLOR_BUFFER_BIT);

        base(new Float32Array([T*5e-5]), 16)

        // Draw a screen-space quad for the fragment shader.
        draw();
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}