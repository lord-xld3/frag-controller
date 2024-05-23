import { newInputRange } from '../src/Controls';
import init from '../src/gl-utils';

// Initialize like normal. 
// We can use OffscreenCanvas but it's mostly for web workers and Transform Feedback.
// TODO: Extend stuff to support TFBOs and vertex shaders.
// The uniform streaming is pretty good.
const gl = init(document.getElementById('canvas') as HTMLCanvasElement);
const canvas = gl.canvas as HTMLCanvasElement;

const frag = `#version 300 es
precision highp float;
precision highp int;

#define f gl_FragCoord.xy

uniform I { uvec2 iMouse, iResolution; vec2 iDelta; float iTime, iZoom; };

uniform U { uvec2 J; vec2 E; vec3 C; };

out vec4 o;

const float Y = 12.;

void main() {
    vec2 r = vec2(iResolution);
    float W = 1./(exp(iZoom)*r.y), F = E.y * W + E.x, K = float(J.y - J.x);
    vec2 n = (2.*f - r)*W + iDelta, p = n, z = n*n;
    int i = 0, H = int(K * pow(iZoom/Y, 2.)) + int(J.x);
    while (i < H && z.x < F) { n = vec2(z.x - z.y + p.x, 2.*n.x*n.y + p.y); z = n*n; ++i; }
    o = (i < H) ? vec4(.5 + .5 * cos(4. + (float(i) + 1. - log2(log2(dot(n, n)) / log2(F))) * .1 + C), 1) : vec4(0);
}`;

// Create program using a screen-space quad vertex shader.
const program = gl.useSSQ(frag);

// Define control elements.
const panel = document.getElementById('panel') as HTMLDivElement,
    controlMinIter = newInputRange(panel, 'Min Iterations', 80, 1, 1, 400),
    controlMaxIter = newInputRange(panel, 'Max Iterations', 400, 1, 80, 1e3),
    controlEscapeMin = newInputRange(panel, 'Min Escape Radius', 6, 1e-4, 0, 10),
    controlEscapeMax = newInputRange(panel, 'Max Escape Radius', 0.5e4, 1e-4, 6, 1e4),
    controlHue = newInputRange(panel, 'Hue', 0.6, 1e-4, 0, 1);


// Setup base touch stream.
const [stream, base] = gl.bindTouch(canvas, program, 'I', 0.01, 0, () => {
    // Triple press function.
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
});
stream.bind();
stream.setCoords(-.75,0);
stream.setDelta(-.75,0);

// Double tap function.
canvas.ondblclick = () => {
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
};

// Resize canvas function.
window.onresize = function() { 
    gl.resize();
    stream.setResolution(canvas.width, canvas.height);
};
window.dispatchEvent(new Event('resize'));

// Update base uniforms after resizing, setting coords, and delta.
base.update();

// Setup custom uniform block.
const uni = gl.bindUniforms(program, 'U', 1);
uni.set(new Uint32Array([80, 400]));
uni.set(new Float32Array([
        6, 0.5e4, // min escape, max escape
        Math.cos(0.6 * Math.PI * 2),
        Math.cos(0.6 * Math.PI * 2 + 1),
        Math.cos(0.6 * Math.PI * 2 + 2),
    ]), 8
);
uni.update();

// Stream control elements to uniform block.
controlMinIter.oninput = () => {
    controlMaxIter.min = controlMinIter.value;
    uni.set(new Uint32Array([controlMinIter.valueAsNumber]), 0);
};

controlMaxIter.oninput = () => {
    controlMinIter.max = controlMaxIter.value;
    uni.set(new Uint32Array([controlMaxIter.valueAsNumber]), 4);
};

controlEscapeMin.oninput = () => {
    controlEscapeMax.min = controlEscapeMin.value;
    uni.set(new Float32Array([controlEscapeMin.valueAsNumber]), 8);
};

controlEscapeMax.oninput = () => {
    uni.set(new Float32Array([controlEscapeMax.valueAsNumber]), 12);
};

controlHue.oninput = () => {
    const h = controlHue.valueAsNumber * Math.PI * 2;
    uni.set(new Float32Array([
        Math.cos(h),
        Math.cos(h + 1),
        Math.cos(h + 2),
    ]), 16);
};

// Setup render loop.
gl.useProgram(program);
gl.clearColor(0, 0, 0, 1);

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Update each uniform block once.
    uni.update();
    base.update();

    // Draw a screen-space quad for the fragment shader.
    gl.drawSSQ();
    requestAnimationFrame(render);
}

requestAnimationFrame(render);