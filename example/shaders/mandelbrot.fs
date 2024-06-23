#version 300 es

#define f gl_FragCoord.xy
precision highp float;
out vec4 o;

uniform I {
    vec2 R, D;
    // force time to be highp float
    highp float T, Z;
};

uniform U {
    uvec2 J;
    vec2 E;
    vec3 C;
};

void main() {
    float W = 1./(exp(Z)*R.y),
        F = E.y*W + E.x,
        K = float(J.y - J.x);
    
    vec2 n = (f+f - R)*W + D,
        p = n,
        z = n * n;
    
    int i = 0,
        H = int(K * pow(Z/12., 2.)) + int(J.x);
    
    while (i < H && z.x < F) {
        n = vec2(z.x - z.y + p.x, 2.*n.x*n.y + p.y);
        z = n*n;
        ++i;
    }

    o = (i < H) ? 
        vec4(.5 + .5*cos(4. + (float(i) + 1. - log2(log2(dot(n, n)) / log2(F)))*.1 + C), 1)
    : vec4(0, 0, 0, 1);
}