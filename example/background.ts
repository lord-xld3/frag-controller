import * as gluu from '../index';
export default function loadBackground() {
    const canvas = document.createElement('canvas');
    const [gl, resizeViewport, resizeCanvas] = gluu.init(canvas, {
        alpha: false,
        antialias: false,
        depth: false,
        powerPreference: 'high-performance',
    });

    const draw = gluu.useSSQ(gl, document.getElementById('background-shader')!.textContent!);
    const uniformBlock = gluu.getUniformBlock(gl, draw.program, 'z')
    uniformBlock(0)
    const base = gluu.newUniformBuffer(gl, uniformBlock.size);
    base.bufferIndex(0)

    base(new Float32Array([
        0, 0, // mouse [0]
        0, 0, // resolution [8]
        0, // time [16]
        1 // zoom [20]
    ]))
    
    let W: number, H: number,
        ec: PointerEvent[] = [], // event cache
        z = 1, // default zoom level
        pd = 0; // previous distance between two pointers

    const upfunc = (e: PointerEvent) => {
        ec = ec.filter((p)=>p.pointerId !== e.pointerId);
        canvas.releasePointerCapture(e.pointerId);
        if (ec.length < 2) pd = 0;
    };

    // Background does not have a panel or content
    Object.assign(canvas, {
        className: 'canvas-element fixed-canvas',
        id: 'canvas-background',
        onpointerdown: (e: PointerEvent) => {
            ec.push(e);
            if (ec.length === 1) {
                canvas.setPointerCapture(e.pointerId)
            } else if (ec.length === 3) {
                fs.style.display = fs.style.display === 'none' ? 'flex' : 'none';
            }
        },
        onpointermove: (e: PointerEvent) => {
            ec[ec.findIndex(p => p.pointerId === e.pointerId)] = e;
            if (ec.length === 1) {
                // offset 0,0 is top-left
                // normalize to -1, 1
                base(new Float32Array([(e.offsetX+e.offsetX)/canvas.clientWidth - 1, -(e.offsetY+e.offsetY)/canvas.clientHeight + 1]));
            }
            else if (ec.length === 2 && e.isPrimary) {
                const [e1, e2] = ec;
                const d = Math.hypot(e1.offsetX - e2.offsetX, e1.offsetY - e2.offsetY);
                if (pd) {
                    base(new Float32Array([z = Math.max(z + (d - pd) / canvas.clientHeight * 2, .5)]), 20);
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
        base(new Float32Array([z = Math.max(z - e.deltaY * z/canvas.clientHeight *.5, .5)]), 20);
    }, { passive: false });

    const box = Object.assign(document.createElement('div'), {
        className: 'canvas-box',
        id: `background-box`,
        ondblclick: () => {
            fs.style.display = fs.style.display === 'none' ? 'flex' : 'none';
        }
    });

    const fs = Object.assign(document.createElement('button'), {
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
        base(new Float32Array([w, h]), 8)
    });
    window.dispatchEvent(new Event('resize'));

    // Setup render loop.
    gl.clearColor(0, 0, 0, 1);

    function render(T: number) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        base(new Float32Array([T*5e-5]), 16)
        draw();
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}