#version 300 es

precision highp float;

out vec4 o;

uniform I {
    vec2 M, R;
    highp float T, Z;
};

void main() {
    vec2 f = gl_FragCoord.xy*R-1.;

    float G = length(f),
        N = dot(M,M),
        A = radians((cos(T)-M.x)*G*90.)-M.x,
        B = sin(A),
        C = cos(A);

    f *= mat2(C,B,-B,C)*(4.+cos(T)+M.y)/Z;

    float W = T+abs(f.x*f.y)+sin(sin(T)*dot(f,f)),
        v = sin(3.*W+9.*N),
        V = 1./fwidth(v);

    o = vec4(
    (.5+.5*cos(W+N+vec3(0,2,4))) 
    * smoothstep(1.,-1.,(abs(v)-.5)*V)
    + (
        smoothstep(-2.,6.,-abs(v))
        +smoothstep(1.,-1.,(v+.95)*V)
        -smoothstep(.5,2.,G)
    ),
    1);
}