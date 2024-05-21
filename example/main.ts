import init from './gl-utils';
import { listener, touchListener } from './Controls';

const gl = init(document.getElementById('canvas') as HTMLCanvasElement);

const frag = `#version 300 es
precision highp float;
precision highp int;

#define f gl_FragCoord.xy
#define P 3.1415926535897932384626433832795

uniform U {
    vec2 R; // resolution
    vec2 D; // mouse delta
    float N; // max iterations - min iterations
    float J; // min iterations
    float L; // max escape radius - min escape radius
    float F; // min escape radius
    float Z; // zoom
    float Y; // max zoom
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


window.addEventListener('resize', () => gl.resize());
gl.resize();

const uni = gl.bindUniforms(program, 'U',
    new Float32Array([
        gl.canvas.width, gl.canvas.height,
        -.8119, .175,
        300,
        80,
        8994,
        6,
        0,
        12,
    ])
);


// Bind mousemove to offset 2 elements in the 'uni' buffer.
touchListener(gl.canvas as HTMLCanvasElement, uni, 2, 8);

uni.bind();
gl.useProgram(program);
gl.clearColor(0, 0, 0, 1);

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    uni.flush();
    gl.drawSSQ();
    requestAnimationFrame(render);
}

requestAnimationFrame(render);