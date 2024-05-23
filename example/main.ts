import init from '../src/gl-utils';

const gl = init(document.getElementById('canvas') as HTMLCanvasElement);
const canvas = gl.canvas as HTMLCanvasElement;

const frag = `#version 300 es
precision highp float;
precision highp int;

#define f gl_FragCoord.xy

uniform I {
    uvec2 iMouse, iResolution;
    vec2 iDelta;
    float iTime, iZoom;
};

uniform U {
    uvec2 J; // iteration range
    vec2 E; // escape radius range
};

out vec4 o;

const float Y = 12.; // Max zoom

void main() {
    vec2 r = vec2(iResolution);

    float W = 1./(exp(iZoom)*r.y),
        F = E.y * W + E.x,
        K = float(J.y - J.x);

    vec2 n = (2.*f - r)*W + iDelta,
        p = n,
        z = n*n;

    int i = 0,
        H = int(K * pow(iZoom/Y, 2.)) + int(J.x);
    
    while (i < H && z.x < F) {
        n = vec2(z.x - z.y + p.x, 2.*n.x*n.y + p.y),
        z = n*n,
        ++i;
    }
    o = (i < H) ? vec4(.5 + .5 * cos(4. + (float(i) + 1. - log2(log2(dot(n, n)) / log2(F))) * .1 + vec3(5, 6, 7)), 1) : vec4(0);
}`;

const program = gl.useSSQ(frag);

const [stream, base] = gl.bindTouch(canvas, program, 'I', 0.01, 0);
stream.bind();
stream.setDelta(-.75,0);
base.flush();

const uni = gl.bindUniforms(program, 'U', 1);
uni.set(new Uint32Array([80, 300]));
uni.set(new Float32Array([6, 1e3]), 8);
uni.flush();


const panel = document.getElementById('panel') as HTMLDivElement;

canvas.onclick = () => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

window.onresize = function() { 
    gl.resize();
    stream.setResolution(canvas.width, canvas.height);
};

window.dispatchEvent(new Event('resize'));

gl.useProgram(program);
gl.clearColor(0, 0, 0, 1);

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    base.flush();
    gl.drawSSQ();
    requestAnimationFrame(render);
}

requestAnimationFrame(render);