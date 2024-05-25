(()=>{"use strict";(()=>{function e(e,n,t,o){const i=1/e.clientHeight;let r=[],a=t,c=0,l=0,u=Math.exp(-a),s=0;return Object.assign(Object.assign({},function(e,n=(()=>{}),t=(()=>{}),o=(()=>{}),i=(()=>{})){return{bind:()=>{e.onpointerdown=n,e.onpointermove=t,e.onpointerup=o,e.onpointercancel=o,e.onpointerout=o,e.onpointerleave=o,e.addEventListener("wheel",i,{passive:!0})},unbind:()=>{e.onpointerdown=null,e.onpointermove=null,e.onpointerup=null,e.onpointercancel=null,e.onpointerout=null,e.onpointerleave=null,e.removeEventListener("wheel",i)}}}(e,(function(n){r.push(n),1===r.length&&e.setPointerCapture(n.pointerId);3===r.length&&o(n);d(n.clientX,n.clientY)}),(function(e){let n=r.findIndex((n=>n.pointerId===e.pointerId));r[n]=e,1===r.length&&(d(e.clientX,e.clientY),f(c-=e.movementX*i*u*2,l+=e.movementY*i*u*2));if(2===r.length){const[e,n]=r,t=Math.hypot(e.clientX-n.clientX,e.clientY-n.clientY);s&&m(a+=(t-s)*i*4),s=t}}),(function(n){r=r.filter((e=>e.pointerId!==n.pointerId)),r.length<2&&(s=0);e.releasePointerCapture(n.pointerId)}),(function(e){m(a-=e.deltaY*i)}))),{setCoords:d,setResolution:function(e,t){n.set(new Uint32Array([e,t]),8)},setDelta:f,setTime:function(e){n.set(new Float32Array([e]),24)},setZoom:m});function d(e,t){n.set(new Uint32Array([e,t]),0)}function f(e,t){c=e,l=t,n.set(new Float32Array([e,t]),16)}function m(e){u=Math.exp(-e),n.set(new Float32Array([e]),28)}}function n(e,n,t=0,o=1,i=0,r=1,a="control"){const c=Object.assign(document.createElement("div"),{className:a}),l=Object.assign(document.createElement("label"),{textContent:n}),u=Object.assign(document.createElement("input"),{type:"range",id:n,name:n,step:o.toString(),min:i.toString(),max:r.toString(),value:t.toString()}),s=Object.assign(document.createElement("span"),{className:"tooltip",id:`${n}-tooltip`,textContent:t.toString()});return l.setAttribute("for",n),u.addEventListener("input",(()=>{s.textContent=u.value})),c.append(l,u,s),e.appendChild(c),u}const t=document.getElementById("canvas"),[o,i]=function(n,t){const o=n.getContext("webgl2",t);if(!o)throw new Error("WebGL2 is not supported");const i=n instanceof HTMLCanvasElement?function(e=n.clientWidth,t=n.clientHeight,i=0,r=0){n.width=e,n.height=t,o.viewport(i,r,e,t)}:function(e=n.width,t=n.height){n.width=e,n.height=t,o.viewport(0,0,e,t)};return[o,{resize:i,newProgram:a,useSSQ:function(e){const n=a("#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}",e);o.useProgram(n);const t=o.getAttribLocation(n,"a");return o.bindBuffer(o.ARRAY_BUFFER,o.createBuffer()),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),o.STATIC_DRAW),o.enableVertexAttribArray(t),o.vertexAttribPointer(t,2,o.FLOAT,!1,0,0),n},drawSSQ:function(){o.drawArrays(o.TRIANGLES,0,6)},bindUniformBlock:c,bindTouch:function(n,t,o,i=1,r=0,a=(()=>{})){const l=c(t,o,r);return[e(n,l,i,a),l]},scaleToDevice:function(e,t=window.devicePixelRatio,o=n.clientWidth,r=n.clientHeight){o=Math.round(o*t),r=Math.round(r*t),i(o,r),e.setResolution(o,r)}}];function r(e,n){const t=o.createShader(e);if(o.shaderSource(t,n),o.compileShader(t),!o.getShaderParameter(t,o.COMPILE_STATUS))throw new Error(o.getShaderInfoLog(t));return t}function a(e,n){const t=o.createProgram(),i=r(o.VERTEX_SHADER,e),a=r(o.FRAGMENT_SHADER,n);if(o.attachShader(t,i),o.attachShader(t,a),o.linkProgram(t),!o.getProgramParameter(t,o.LINK_STATUS))throw new Error(o.getProgramInfoLog(t));return t}function c(e,n,t=0,i=o.STATIC_DRAW){const r=o.getUniformBlockIndex(e,n);r===o.INVALID_INDEX&&console.warn("Uniform block ",n," not found in program:",e),l(t);const a=function(e,n){const t=o.createBuffer();return t||console.warn("Failed to create BufferObject."),{buf:t,bind:()=>o.bindBuffer(e,t),unbind:()=>o.bindBuffer(e,null),delete:()=>o.deleteBuffer(t),setBuffer:t=>o.bufferData(e,t,n)}}(o.UNIFORM_BUFFER,i),c=new ArrayBuffer(o.getActiveUniformBlockParameter(e,r,o.UNIFORM_BLOCK_DATA_SIZE));return s(),{delete:a.delete,bindBlock:l,bind:u,unbind:function(){o.bindBufferBase(o.UNIFORM_BUFFER,r,null),a.unbind()},set:function(e,n=0,t=0,o=e.length){new e.constructor(c,n,o).set(e,t)},update:s};function l(n){o.uniformBlockBinding(e,r,n)}function u(){a.bind(),o.bindBufferBase(o.UNIFORM_BUFFER,r,a.buf)}function s(){u(),a.setBuffer(c)}}}(t),r=i.useSSQ("#version 300 es\nprecision highp float;\nprecision highp int;\n\n#define f gl_FragCoord.xy\n\nuniform I { uvec2 iMouse, iResolution; vec2 iDelta; float iTime, iZoom; };\n\nuniform U { uvec2 J; vec2 E; vec3 C; };\n\nout vec4 o;\n\nconst float Y = 12.;\n\nvoid main() {\n    vec2 r = vec2(iResolution);\n    float W = 1./(exp(iZoom)*r.y), F = E.y * W + E.x, K = float(J.y - J.x);\n    vec2 n = (2.*f - r)*W + iDelta, p = n, z = n*n;\n    int i = 0, H = int(K * pow(iZoom/Y, 2.)) + int(J.x);\n    while (i < H && z.x < F) { n = vec2(z.x - z.y + p.x, 2.*n.x*n.y + p.y); z = n*n; ++i; }\n    o = (i < H) ? vec4(.5 + .5 * cos(4. + (float(i) + 1. - log2(log2(dot(n, n)) / log2(F))) * .1 + C), 1) : vec4(0);\n}");let a=window.devicePixelRatio;(function(e,n){const t=new ResizeObserver((e=>{!function(e,n){for(const t of e){const[e,o,i]=t.devicePixelContentBoxSize?[t.devicePixelContentBoxSize[0].inlineSize,t.devicePixelContentBoxSize[0].blockSize,1]:[t.contentBoxSize[0].inlineSize,t.contentBoxSize[0].blockSize,window.devicePixelRatio];n(e,o,i)}}(e,n)}));return{unobserve:()=>{t.disconnect()},observe:()=>{for(let n=0;n<e.length;n++)t.observe(e[n])}}})([t],(()=>{i.scaleToDevice(v,a)})).observe(),t.dispatchEvent(new Event("resize"));const c=document.getElementById("panel"),l=n(c,"Resolution scale",a,a/4,a/4,2*a),u=n(c,"Zoom",.01,1e-4,-1,12),s=n(c,"Min Iterations",80,1,1,400),d=n(c,"Max Iterations",400,1,80,1e3),f=n(c,"Min Escape Radius",6,1e-4,0,10),m=n(c,"Max Escape Radius",5e3,1e-4,6,1e4),p=n(c,"Hue",.6,1e-4,0,1);t.ondblclick=()=>{c.style.display="none"===c.style.display?"flex":"none"};const[v,h]=i.bindTouch(t,r,"I",.01,0,(()=>{c.style.display="none"===c.style.display?"flex":"none"}));v.bind(),v.setCoords(-.75,0),v.setDelta(-.75,0),h.update();const g=i.bindUniformBlock(r,"U",1);g.set(new Uint32Array([80,400])),g.set(new Float32Array([6,5e3,Math.cos(.6*Math.PI*2),Math.cos(.6*Math.PI*2+1),Math.cos(.6*Math.PI*2+2)]),8),g.update(),l.oninput=()=>{a=l.valueAsNumber,i.scaleToDevice(v,a)},u.oninput=()=>{v.setZoom(u.valueAsNumber)},s.oninput=()=>{d.min=s.value,g.set(new Uint32Array([s.valueAsNumber]),0)},d.oninput=()=>{s.max=d.value,g.set(new Uint32Array([d.valueAsNumber]),4)},f.oninput=()=>{m.min=f.value,g.set(new Float32Array([f.valueAsNumber]),8)},m.oninput=()=>{g.set(new Float32Array([m.valueAsNumber]),12)},p.oninput=()=>{const e=p.valueAsNumber*Math.PI*2;g.set(new Float32Array([Math.cos(e),Math.cos(e+1),Math.cos(e+2)]),16)};const b=document.getElementById("fullscreen");b.onclick=()=>{document.fullscreenElement?(document.exitFullscreen(),b.value="🔳"):(document.documentElement.requestFullscreen(),b.value="🔲")},o.useProgram(r),o.clearColor(0,0,0,1),requestAnimationFrame((function e(){o.clear(o.COLOR_BUFFER_BIT),g.update(),h.update(),i.drawSSQ(),requestAnimationFrame(e)}))})()})();