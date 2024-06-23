#version 300 es

#define F gl_FragCoord.xy

precision highp float;

out vec4 o;

uniform I {
    vec2 M, R;
    // force time to be highp float
    highp float T, Z;
};

void main() {
    vec2 f = F*R - 1.; // NDC
    
    float G = length(f),
        N = dot(M, M), // dot(mouse) used for wave offset
        A = radians((sin(T) - M.x) * G * 90. ) - M.x, // rotation angle
        B = sin(A),
        C = cos(A);
        
    // rotate, zoom +- mouse.y
    f *= mat2(C, B, -B, C) * (3. + .5*sin(T) + M.y)/Z;
    
    // wave
    float W = T + abs(f.x * f.y) + sin(cos(T) * dot(f, f)),
        // edge
        e = sin(3.*W + 3.*N),
        d = 1./fwidth(e),
        // vignette
        v = smoothstep(.5, 2., G);
        
    /* 
    the vignette is applied to color and white edges separately...
    white edge isn't true vignette, it subtracts thickness.
    looking for a better way to do this.
    */
        
    o = vec4(
    // rgb waves - vignette
    (.5 + .5*cos(W + N + vec3(0, 2, 4)) - v)
    // black edges
    * (smoothstep(1., -1., (abs(e) - .5) * d)
        // edge glow
        + smoothstep(3., -3., abs(e)))
    // white edges - vignette
    + smoothstep(1., -1., (e +.95) * d + v), 
    1.); // alpha
}