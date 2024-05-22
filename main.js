(()=>{"use strict";(()=>{const e=document.getElementById("debug");const n=function(e,n){const t=e.getContext("webgl2",n);if(!t)throw new Error("WebGL2 is not supported");function i(e,n){const i=t.createShader(e);if(t.shaderSource(i,n),t.compileShader(i),!t.getShaderParameter(i,t.COMPILE_STATUS))throw new Error(t.getShaderInfoLog(i));return i}return t.resize=e instanceof HTMLCanvasElement?function(n=e.clientWidth,i=e.clientHeight,r=0,o=0){t.canvas.width=n,t.canvas.height=i,t.viewport(r,o,n,i)}:function(n=e.width,i=e.height){t.canvas.width=n,t.canvas.height=i,t.viewport(0,0,n,i)},t.newProgram=(e,n)=>{const r=t.createProgram(),o=i(t.VERTEX_SHADER,e),a=i(t.FRAGMENT_SHADER,n);if(t.attachShader(r,o),t.attachShader(r,a),t.linkProgram(r),!t.getProgramParameter(r,t.LINK_STATUS))throw new Error(t.getProgramInfoLog(r));return r},t.useSSQ=e=>{const n=t.newProgram("#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}",e);t.useProgram(n);const i=t.getAttribLocation(n,"a");return t.bindBuffer(t.ARRAY_BUFFER,t.createBuffer()),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),t.STATIC_DRAW),t.enableVertexAttribArray(i),t.vertexAttribPointer(i,2,t.FLOAT,!1,0,0),n},t.drawSSQ=()=>t.drawArrays(t.TRIANGLES,0,6),t.bindUniforms=(e,n,i=new Float32Array(0),r=0,o=t.STATIC_DRAW)=>{const a=t.getUniformBlockIndex(e,n);a===t.INVALID_INDEX&&console.warn(`Uniform block "${n}" not found in program: ${e}`);const c=function(e,n){const i=t.createBuffer();return i||console.warn(`Failed to create BufferObject using context: ${t}\n                Target: ${e}\n                Usage: ${n}`),{buf:i,bind(){t.bindBuffer(e,i)},unbind(){t.bindBuffer(e,null)},delete(){t.deleteBuffer(i)},setBuffer(i){t.bufferData(e,i,n)}}}(t.UNIFORM_BUFFER,o),s=function(e,n){const t=e.byteLength+n-1&~(n-1),i=new e.constructor(t);return i.set(e),i}(i,16);function l(n){t.uniformBlockBinding(e,a,n)}function d(){c.bind(),t.bindBufferBase(t.UNIFORM_BUFFER,a,c.buf)}function f(e,n=0,t=0,i=e.length){s.set(e.slice(t,i),n)}function u(){c.setBuffer(s)}return d(),l(r),f(i),u(),Object.assign(Object.assign({},c),{bindBlock:l,bind:d,unbind:function(){t.bindBufferBase(t.UNIFORM_BUFFER,a,null),c.unbind()},set:f,flush:u})},t}(document.getElementById("canvas")),t=n.canvas,i=n.useSSQ("#version 300 es\nprecision highp float;\nprecision highp int;\n\n#define f gl_FragCoord.xy\n\nuniform U {\n    vec2 C, // coords\n        D, // mouse delta\n        R; // resolution\n    float Z, // zoom\n        N, // max iterations - min iterations\n        J, // min iterations\n        L, // max escape radius - min escape radius\n        F, // min escape radius\n        Y; // max zoom\n};\n\nout vec4 o;\n\nvoid main() {\n    float m = exp(Z),\n        W = 1./(m*R.y),\n        e = L * W + F;\n\n    int h = int(N * pow(Z/Y, 2.) + J),\n        i = 0;\n        \n    vec2 n = (2.*f - R)*W + D,\n        p = n,\n        z = n*n;\n    \n    while (i < h && z.x < e) {\n        n = vec2(z.x - z.y + p.x, 2.*n.x*n.y + p.y),\n        z = n*n,\n        ++i;\n    }\n    o = (i < h) ? vec4(.5 + .5 * cos(4. + (float(i) + 1. - log2(log2(dot(n, n)) / log2(e))) * .1 + vec3(5, 6, 7)), 1) : vec4(0);\n}"),r=n.bindUniforms(i,"U",new Float32Array([0,0,0,0,t.clientWidth,t.clientHeight,.01,400,80,9e3,6,12]));r.bind(),window.addEventListener("resize",(()=>{n.resize(),r.set(new Float32Array([t.clientWidth,t.clientHeight]),4)})),window.dispatchEvent(new Event("resize")),function(n,t,i,r,o,a){const[c,s]=[1/n.clientWidth,1/n.clientHeight];let l=[],d=.01,f=0,u=0,h=Math.exp(-d),g=0;n.addEventListener("pointerdown",(e=>{let r=l.findIndex((n=>n.pointerId===e.pointerId));-1===r?l.push(e):l[r]=e,1===l.length&&n.setPointerCapture(e.pointerId),3===l.length&&a(),t.set(new Float32Array([e.clientX,e.clientY]),i)})),n.addEventListener("pointermove",(n=>{let a=l.findIndex((e=>e.pointerId===n.pointerId));if(l[a]=n,1===l.length&&(t.set(new Float32Array([f-=n.movementX*s*2,u+=n.movementY*s*2]),r),t.set(new Float32Array([n.clientX,n.clientY]),i)),2===l.length){const[n,i]=l,r=Math.hypot(i.clientX-n.clientX,i.clientY-n.clientY);if(e.textContent="pinch started",0!==g){const a=r-g;d+=1*a,h=Math.exp(-d),e.textContent=`pinchDelta: ${a}, z: ${d}, m: ${h}, prevDiff: ${g}, curDiff: ${r},\n                ev1.clientX: ${n.clientX}, ev1.clientY: ${n.clientY}, ev2.clientX: ${i.clientX}, ev2.clientY: ${i.clientY}`,t.set(new Float32Array([d]),o)}g=r}}));const p=e=>{l=l.filter((n=>n.pointerId!==e.pointerId)),l.length<2&&(g=0),n.releasePointerCapture(e.pointerId)};n.addEventListener("pointercancel",p),n.addEventListener("pointerup",p),n.addEventListener("pointerout",p),n.addEventListener("pointerleave",p),n.addEventListener("wheel",(e=>{d-=e.deltaY*s*2,h=Math.exp(-d),t.set(new Float32Array([d]),o)}),{passive:!0})}(t,r,0,2,6,(()=>{console.log("Triple tap!"),window.dispatchEvent(new Event("resize")),r.set(new Float32Array([.01]),6)})),n.useProgram(i),n.clearColor(0,0,0,1),requestAnimationFrame((function e(){n.clear(n.COLOR_BUFFER_BIT),r.flush(),n.drawSSQ(),requestAnimationFrame(e)}))})()})();