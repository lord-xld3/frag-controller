#version 300 es
#define F gl_FragCoord.xy
precision highp float;
out vec3 color;

uniform z {
    vec2 iMouse, iResolution;
    float iTime, iZoom;
    
    uvec2 iterations;
    vec2 escape, delta;      
    vec3 hue;
    float scale;
};

void main() {
    float zoom = 1./(exp(iZoom)*iResolution.y),
        maxescape = escape.y*zoom + escape.x;
    
    vec2 n = (F+F - iResolution)*zoom + delta,
        p = n,
        z = n * n;
    
    int i = 0,
        scalediter = int(float(iterations.y - iterations.x) * pow(iZoom/12., 2.)) 
        + int(iterations.x);
    
    while (i < scalediter && z.x < maxescape) {
        n = vec2(z.x - z.y + p.x, 2.*n.x*n.y + p.y);
        z = n*n;
        ++i;
    }

    color = (i < scalediter) ? 
        vec3(.5 + .5*cos((float(i) + 1. - log2(log2(dot(n, n)) / log2(maxescape)))*scale + hue))
    : vec3(0);
}