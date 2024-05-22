import init from '../src/gl-utils';
import { touchStream } from '../src/Controls';

const gl = init(document.getElementById('canvas') as HTMLCanvasElement);
const canvas = gl.canvas as HTMLCanvasElement;

const frag = `#version 300 es
precision highp float;
precision highp int;

#define f gl_FragCoord.xy

uniform U {
    vec2 C, // coords
        D, // mouse delta
        R; // resolution
    float Z, // zoom
        N, // max iterations - min iterations
        J, // min iterations
        L, // max escape radius - min escape radius
        F, // min escape radius
        Y; // max zoom
};

out vec4 o;

void main() {
    float m = exp(Z),
        W = 1./(m*R.y),
        e = L * W + F;

    int h = int(N * pow(Z/Y, 2.) + J),
        i = 0;
        
    vec2 n = (2.*f - R)*W + D,
        p = n,
        z = n*n;
    
    while (i < h && z.x < e) {
        n = vec2(z.x - z.y + p.x, 2.*n.x*n.y + p.y),
        z = n*n,
        ++i;
    }
    o = (i < h) ? vec4(.5 + .5 * cos(4. + (float(i) + 1. - log2(log2(dot(n, n)) / log2(e))) * .1 + vec3(5, 6, 7)), 1) : vec4(0);
}`;

const program = gl.useSSQ(frag);

const uni = gl.bindUniforms(program, 'U',
    new Float32Array([
        0, 0, // coords
        0, 0, // delta
        canvas.clientWidth, canvas.clientHeight, // resolution
        0.01, // zoom
        400, // max iterations
        80, // min iterations
        9000, // max escape radius
        6, // min escape radius
        12 // max zoom
    ])
);
uni.bind();

window.addEventListener('resize', () => {
    gl.resize();
    uni.set(new Float32Array([canvas.clientWidth, canvas.clientHeight]), 4);  
});

window.dispatchEvent(new Event('resize'));

// Bind touchstream to coords, delta, zoom.
touchStream(canvas, uni, 0, 2, 6, () => {
    console.log('Triple tap!');
    window.dispatchEvent(new Event('resize'));
    uni.set(new Float32Array([0.01]), 6);
});

gl.useProgram(program);
gl.clearColor(0, 0, 0, 1);

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    uni.flush();
    gl.drawSSQ();
    requestAnimationFrame(render);
}

requestAnimationFrame(render);