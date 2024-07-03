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

    const oMouse = 0, oResolution = 8, oTime = 16, oZoom = 20;

    base(new Float32Array([
        0, 0, // mouse [0]
        0, 0, // resolution [8]
        0, // time [16]
        1 // zoom [20]
    ]))
    
    let twoOverCanvasWidth: number,
        twoOverCanvasHeight: number,
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
        onpointercancel: upfunc,
        onpointerleave: upfunc,
        onpointerout: upfunc,
        onpointerup: upfunc,
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
                // Set mouse coords
                // offset 0,0 is top-left
                // normalize to -1, 1
                base(new Float32Array([
                    e.offsetX*twoOverCanvasWidth - 1, 
                    -e.offsetY*twoOverCanvasHeight + 1
                ]));
            }
            else if (ec.length === 2 && e.isPrimary) {
                const [e1, e2] = ec;
                const d = Math.hypot(e1.offsetX - e2.offsetX, e1.offsetY - e2.offsetY);
                if (pd) {
                    z = Math.max(z + (d - pd) * twoOverCanvasHeight * 2, .1);
                    base(new Float32Array([1/z]), oZoom);
                }
                pd = d;
            }
        },
    });
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        z = Math.max(z - e.deltaY * z*twoOverCanvasHeight *.5, .1);
        base(new Float32Array([1/z]), oZoom);
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
        textContent: '🔳',
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
        twoOverCanvasWidth = 2/canvas.clientWidth;
        twoOverCanvasHeight = 2/canvas.clientHeight;
        base(new Float32Array([2/w, 2/h]), oResolution)
    });
    window.dispatchEvent(new Event('resize'));

    // Setup render loop.
    gl.clearColor(0, 0, 0, 1);

    function render(T: number) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        base(new Float32Array([T*5e-5]), oTime)
        draw();
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}