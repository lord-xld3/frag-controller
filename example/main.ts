import { newInputRange } from '../src/Controls';
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

const panel = document.getElementById('panel') as HTMLDivElement,
    controlMinIter = newInputRange(panel, 'Min Iterations', 80, 1, 1, 400),
    controlMaxIter = newInputRange(panel, 'Max Iterations', 400, 1, 80, 1e3),
    controlEscapeMin = newInputRange(panel, 'Min Escape Radius', 6, 1e-9, 0, 10),
    controlEscapeMax = newInputRange(panel, 'Max Escape Radius', 0.5e4, 1e-9, 6, 1e4)


const [stream, base] = gl.bindTouch(canvas, program, 'I', 0.01, 0, () => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
});
stream.bind();
stream.setCoords(-.75,0);
stream.setDelta(-.75,0);
canvas.ondblclick = () => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
};
window.onresize = function() { 
    gl.resize();
    stream.setResolution(canvas.width, canvas.height);
};
window.dispatchEvent(new Event('resize'));
base.flush();

const uni = gl.bindUniforms(program, 'U', 1);
uni.set(new Uint32Array([80, 400]));
uni.set(new Float32Array([6, 0.5e4]), 8);
uni.flush();

controlMinIter.addEventListener('input', () => {
    controlMaxIter.min = controlMinIter.value;
    uni.set(new Uint32Array([controlMinIter.valueAsNumber]), 0);
});

controlMaxIter.addEventListener('input', () => {
    controlMinIter.max = controlMaxIter.value;
    uni.set(new Uint32Array([controlMaxIter.valueAsNumber]), 4);
});

controlEscapeMin.addEventListener('input', () => {
    controlEscapeMax.min = controlEscapeMin.value;
    uni.set(new Float32Array([controlEscapeMin.valueAsNumber]), 8);
});

controlEscapeMax.addEventListener('input', () => {
    uni.set(new Float32Array([controlEscapeMax.valueAsNumber]), 12);
});

gl.useProgram(program);
gl.clearColor(0, 0, 0, 1);

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    uni.flush();
    base.flush();
    gl.drawSSQ();
    requestAnimationFrame(render);
}

requestAnimationFrame(render);