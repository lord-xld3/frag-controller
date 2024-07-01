import * as gluu from '../index';
export default function loadBackground() {
    const canvas = document.createElement('canvas');
    const [gl, resizeViewport, resizeCanvas] = gluu.init(canvas, {
        alpha: false,
        antialias: false,
        depth: false,
        powerPreference: 'high-performance',
    });

    const draw = gluu.useSSQ(gl, `#version 300 es
#define A  gl_FragCoord.xy
precision highp float;out vec4 o;uniform z{vec2 B,C;highp float D,E;};void main(){vec2 F=A*C-1.;float G=length(F),H=sin(D),I=length(B),J=radians((H-B.x)*G*90.)-B.x,K=sin(J),L=cos(J),M=.5+.5*H;F=mix(F,F*cos(F)/(.5+.5*G),M+I);F*=mat2(L,K,-K,L)*(2.5+M+B.y);float N=D+abs(F.x*F.y)+sin(cos(D)*dot(F,F)),O=sin(3.*N+3.*I),P=1./fwidth(O),Q=smoothstep(.5,2.,G);o=vec4((.5+.5*cos(N+I+vec3(0,2,4))-Q)*(smoothstep(1.,-1.,(abs(O)-.5)*P)+smoothstep(3.,-3.,abs(O)))+smoothstep(1.,-1.,(O+.95)*P+Q),1.);}`);
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
                base(new Float32Array([e.offsetX*W - 1, -e.offsetY*H + 1]));
            }
            else if (ec.length === 2 && e.isPrimary) {
                const [e1, e2] = ec;
                const d = Math.hypot(e1.offsetX - e2.offsetX, e1.offsetY - e2.offsetY);
                if (pd) {
                    base(new Float32Array([z = Math.max(z + (d - pd) * H * 2, .5)]), 20);
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
        base(new Float32Array([z = Math.max(z - e.deltaY * z*H *.5, .5)]), 20);
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
        // Mouse relies on client size, 
        // canvas is normally client * devicepixelratio
        W = 2/canvas.clientWidth, H = 2/canvas.clientHeight;
        base(new Float32Array([2/w, 2/h]), 8)
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