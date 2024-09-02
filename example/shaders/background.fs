#version 300 es
#define F gl_FragCoord.xy
precision highp float;
out vec3 color;
uniform z {
    vec2 iMouse, // NDC
        iResolution; // 2 / resolution
    float iTime, iZoom;
};

void main() {
    vec2 f = F*iResolution - 1.; // NDC (-1.0 -> 1.0)
    
    float lF = length(f),
        sT = sin(iTime),
        lM = length(iMouse),
        A = radians((sT - iMouse.x) * lF * 90. ) - iMouse.x, // rotation angle
        B = sin(A),
        C = cos(A),
        nT = .5+.5*sT; // ( 0 -> 1) 
        
    // this transform is pretty cool
    //                  (0 -> 1), 0->1 + dist of mouse from center 0,0
    f = mix(f, f*cos(f)/(.5+.5*lF), nT + lM);
    
    // rotate, zoom +- mouse.y
    f *= mat2(C, B, -B, C) * (2.5 + nT + iMouse.y)/iZoom;
    
    // wave
    float wave = iTime + abs(f.x * f.y) + sin(cos(iTime) * dot(f, f)),
        // edge
        edge = sin(3.*wave + 3.*lM),
        d = 1./fwidth(edge),
        // vignette
        v = smoothstep(.5, 2., lF);
        
    /* 
    the vignette is applied to color and white edges separately...
    white edge isn't true vignette, it subtracts thickness.
    looking for a better way to do this.
    */
        
    color = vec3(
    // rgb waves - vignette
    (.5 + .5*cos(wave + lM + vec3(0, 2, 4)) - v)
    // black edges
    * (smoothstep(1., -1., (abs(edge) - .5) * d)
        // edge glow
        + smoothstep(3., -3., abs(edge)))
    // white edges - vignette
    + smoothstep(1., -1., (edge +.95) * d + v));
}