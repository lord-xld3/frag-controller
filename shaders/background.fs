#version 300 es
#define A  gl_FragCoord.xy
precision highp float;out vec4 o;uniform z{vec2 B,C;highp float D,E;};void main(){vec2 F=A*C-1.;float G=length(F),H=dot(B,B),I=radians((sin(D)-B.x)*G*90.)-B.x,J=sin(I),K=cos(I);F=mix(F,F*cos(fract(abs(F)))/(.5+(.5*G)),.5+.5*sin(D)+H)*mat2(K,J,-J,K)*(3.+.5*sin(D)+B.y)/E;float L=D+abs(F.x*F.y)+sin(cos(D)*dot(F,F)),M=sin(3.*L+3.*H),N=1./fwidth(M),O=smoothstep(.5,2.,G);o=vec4((.5+.5*cos(L+H+vec3(0,2,4))-O)*(smoothstep(1.,-1.,(abs(M)-.5)*N)+smoothstep(3.,-3.,abs(M)))+smoothstep(1.,-1.,(M+.95)*N+O),1.);}