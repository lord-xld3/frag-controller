(()=>{"use strict";(()=>{const e=function(e,n){const t=e.getContext("webgl2",n);if(!t)throw new Error("WebGL2 is not supported");function r(e,n){const r=t.createShader(e);if(t.shaderSource(r,n),t.compileShader(r),!t.getShaderParameter(r,t.COMPILE_STATUS))throw new Error(t.getShaderInfoLog(r));return r}return t.resize=e instanceof HTMLCanvasElement?function(n=e.clientWidth,r=e.clientHeight,i=0,o=0){t.canvas.width=n,t.canvas.height=r,t.viewport(i,o,n,r)}:function(n=e.width,r=e.height){t.canvas.width=n,t.canvas.height=r,t.viewport(0,0,n,r)},t.newProgram=(e,n)=>{const i=t.createProgram(),o=r(t.VERTEX_SHADER,e),a=r(t.FRAGMENT_SHADER,n);if(t.attachShader(i,o),t.attachShader(i,a),t.linkProgram(i),!t.getProgramParameter(i,t.LINK_STATUS))throw new Error(t.getProgramInfoLog(i));return i},t.useSSQ=e=>{const n=t.newProgram("#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}",e);t.useProgram(n);const r=t.getAttribLocation(n,"a");return t.bindBuffer(t.ARRAY_BUFFER,t.createBuffer()),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),t.STATIC_DRAW),t.enableVertexAttribArray(r),t.vertexAttribPointer(r,2,t.FLOAT,!1,0,0),n},t.drawSSQ=()=>t.drawArrays(t.TRIANGLES,0,6),t.bindUniforms=(e,n,r=new Float32Array(0),i=0,o=t.STATIC_DRAW)=>{const a=t.getUniformBlockIndex(e,n);a===t.INVALID_INDEX&&console.warn(`Uniform block "${n}" not found in program: ${e}`);const s=function(e,n){const r=t.createBuffer();return r||console.warn(`Failed to create BufferObject using context: ${t}\n                Target: ${e}\n                Usage: ${n}`),{buf:r,bind(){t.bindBuffer(e,r)},unbind(){t.bindBuffer(e,null)},delete(){t.deleteBuffer(r)},setBuffer(r){t.bufferData(e,r,n)}}}(t.UNIFORM_BUFFER,o),c=function(e,n){const t=e.byteLength+n-1&~(n-1),r=new e.constructor(t);return r.set(e),r}(r,16);function d(n){t.uniformBlockBinding(e,a,n)}function l(){s.bind(),t.bindBufferBase(t.UNIFORM_BUFFER,a,s.buf)}function f(e,n=0,t=0,r=e.length){c.set(e.slice(t,r),n)}function u(){s.setBuffer(c)}return l(),d(i),f(r),u(),Object.assign(Object.assign({},s),{bindBlock:d,bind:l,unbind:function(){t.bindBufferBase(t.UNIFORM_BUFFER,a,null),s.unbind()},set:f,flush:u})},t}(document.getElementById("canvas")),n=e.canvas,t=e.useSSQ("#version 300 es\nprecision highp float;\nprecision highp int;\n\n#define f gl_FragCoord.xy\n\nuniform U {\n    vec2 C, // coords\n        D, // mouse delta\n        R; // resolution\n    float Z, // zoom\n        N, // max iterations - min iterations\n        J, // min iterations\n        L, // max escape radius - min escape radius\n        F, // min escape radius\n        Y; // max zoom\n};\n\nout vec4 o;\n\nvoid main() {\n    float m = exp(Z),\n        W = 1./(m*R.y),\n        e = L * W + F;\n\n    int h = int(N * pow(Z/Y, 2.) + J),\n        i = 0;\n        \n    vec2 n = (2.*f - R)*W + D,\n        p = n,\n        z = n*n;\n    \n    while (i < h && z.x < e) {\n        n = vec2(z.x - z.y + p.x, 2.*n.x*n.y + p.y),\n        z = n*n,\n        ++i;\n    }\n    o = (i < h) ? vec4(.5 + .5 * cos(4. + (float(i) + 1. - log2(log2(dot(n, n)) / log2(e))) * .1 + vec3(5, 6, 7)), 1) : vec4(0);\n}"),r=e.bindUniforms(t,"U",new Float32Array([0,0,0,0,n.clientWidth,n.clientHeight,.01,400,80,9e3,6,12]));r.bind(),window.addEventListener("resize",(()=>{e.resize(),r.set(new Float32Array([n.clientWidth,n.clientHeight]),4)})),window.dispatchEvent(new Event("resize")),function(e,n,t,r,i,o){const[a,s]=[1/e.clientWidth,1/e.clientHeight];let c=[],d=.01,l=0,f=0,u=Math.exp(-d),h=0;e.addEventListener("pointerdown",(r=>{let i=c.findIndex((e=>e.pointerId===r.pointerId));-1===i?c.push(r):c[i]=r,1===c.length&&e.setPointerCapture(r.pointerId),3===c.length&&o(),n.set(new Float32Array([r.clientX*a,r.clientY*s]),t)})),e.addEventListener("pointermove",(e=>{let o=c.findIndex((n=>n.pointerId===e.pointerId));if(c[o]=e,1===c.length&&(n.set(new Float32Array([l-=e.movementX*s*2,f+=e.movementY*s*2]),r),n.set(new Float32Array([e.clientX,e.clientY]),t)),2===c.length){const[e,t]=c,r=Math.hypot(t.clientX-e.clientX,t.clientY-e.clientY);if(0!==h){d+=1e3*(r-h),u=Math.exp(-d),n.set(new Float32Array([d]),i)}h=r}}));const g=n=>{c=c.filter((e=>e.pointerId!==n.pointerId)),c.length<2&&(h=0),e.releasePointerCapture(n.pointerId)};e.addEventListener("pointercancel",g),e.addEventListener("pointerup",g),e.addEventListener("pointerout",g),e.addEventListener("pointerleave",g),e.addEventListener("wheel",(e=>{d-=e.deltaY*s*2,u=Math.exp(-d),n.set(new Float32Array([d]),i)}),{passive:!0})}(n,r,0,2,6,(()=>{console.log("Triple tap!"),window.dispatchEvent(new Event("resize")),r.set(new Float32Array([.01]),6)})),e.useProgram(t),e.clearColor(0,0,0,1),requestAnimationFrame((function n(){e.clear(e.COLOR_BUFFER_BIT),r.flush(),e.drawSSQ(),requestAnimationFrame(n)}))})()})();