(()=>{"use strict";var e={};e.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||Function("return this")()}catch(e){if("object"==typeof window)return window}}(),(()=>{var t;e.g.importScripts&&(t=e.g.location+"");var n=e.g.document;if(!t&&n&&(n.currentScript&&(t=n.currentScript.src),!t)){var a=n.getElementsByTagName("script");if(a.length)for(var r=a.length-1;r>-1&&(!t||!/^http(s?):/.test(t));)t=a[r--].src}if(!t)throw Error("Automatic publicPath is not supported in this browser");t=t.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),e.p=t})(),(()=>{function e(e,t){const n=e.getContext("webgl2",t);if(!n)throw Error("WebGL2 is not supported");return[n,function(t=e.clientWidth,a=e.clientHeight,r=0,i=0){n.viewport(r,i,t,a)},e instanceof HTMLCanvasElement?function(t=window.devicePixelRatio,n=e.clientWidth,a=e.clientHeight){return[e.width=n*t,e.height=a*t]}:function(t=window.devicePixelRatio,n=e.width,a=e.height){return[e.width=n*t,e.height=a*t]}]}function t(e,t,n,a){const r=e.createBuffer(),i=()=>e.bindBuffer(n,r);return i(),e.bufferData(n,t,a),Object.assign(((t,a=0,r=0,i)=>e.bufferSubData(n,a,t,r,i)),{buf:r,bindBuffer:i})}function n(e,n){const a=function(e,t,n){function a(t,n){const a=e.createShader(t);if(e.shaderSource(a,n),e.compileShader(a),!e.getShaderParameter(a,e.COMPILE_STATUS))throw Error(e.getShaderInfoLog(a));return a}const r=e.createProgram(),i=a(e.VERTEX_SHADER,t),o=a(e.FRAGMENT_SHADER,n);if(e.attachShader(r,i),e.attachShader(r,o),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS))throw Error(e.getProgramInfoLog(r));return r}(e,"#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}",n),r=function(e){const t=e.createVertexArray();return Object.assign((()=>e.bindVertexArray(t)),{unbind:()=>e.bindVertexArray(null)})}(e);return e.useProgram(a),r(),t(e,48,34962,35044)(new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1])),function(e,t,n){for(let a=0;a<n.length;a++){const{name:r,size:i,type:o,normalized:c,stride:s,offset:l,divisor:u}=n[a],d=e.getAttribLocation(t,r);-1!==d&&(e.enableVertexAttribArray(d),e.vertexAttribPointer(d,i,o||e.FLOAT,c||!1,s||0,l||0),u&&e.vertexAttribDivisor(d,u))}}(e,a,[{name:"a",size:2}]),[a,function(){e.useProgram(a),r(),e.drawArrays(4,0,6)}]}function a(e,t,n,a=0){const r=e.getUniformBlockIndex(t,n),i=(n=0)=>{e.uniformBlockBinding(t,r,n)};return i(a),Object.assign(i,{size:e.getActiveUniformBlockParameter(t,r,e.UNIFORM_BLOCK_DATA_SIZE)})}function r(e,n,a=0){const r=t(e,n,e.UNIFORM_BUFFER,e.STATIC_DRAW),i=function(t=0){e.bindBufferBase(e.UNIFORM_BUFFER,t,r.buf)};return i(a),Object.assign(r,{bufferBinding:i})}var i=function(e,t,n,a){return new(n||(n=Promise))((function(r,i){function o(e){try{s(a.next(e))}catch(e){i(e)}}function c(e){try{s(a.throw(e))}catch(e){i(e)}}function s(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(o,c)}s((a=a.apply(e,t||[])).next())}))};function o(e,t,n){let a=0,r=0,i=0,o=Math.floor(6*e),c=6*e-o,s=n*(1-t),l=n*(1-c*t),u=n*(1-(1-c)*t);switch(o%6){case 0:a=n,r=u,i=s;break;case 1:a=l,r=n,i=s;break;case 2:a=s,r=n,i=u;break;case 3:a=s,r=l,i=n;break;case 4:a=u,r=s,i=n;break;case 5:a=n,r=s,i=l}return[a,r,i]}function c(e,t,n,a){let[r,i,c]=function(e,t,n){let a=Math.max(e,t,n),r=0,i=a-Math.min(e,t,n);switch(a){case e:r=(t-n)/i+(t<n?6:0);break;case t:r=(n-e)/i+2;break;case n:r=(e-t)/i+4}return r/=6,[r,i/a,a]}(e,t,n);return r=(r+a)%1,o(r,i,c)}function s(e,t){const n=e.id,a=Object.assign(document.createElement("div"),{className:"panel-control",id:n+"-container"}),r=Object.assign(document.createElement("span"),{className:"input-tooltip",id:n+"-tooltip",textContent:e.value});return e.addEventListener("input",(()=>{r.textContent=e.value})),a.append(Object.assign(document.createElement("label"),{className:"control-label",id:n+"-label",textContent:t,htmlFor:n}),e,r),a}var l=function(e,t,n,a){return new(n||(n=Promise))((function(r,i){function o(e){try{s(a.next(e))}catch(e){i(e)}}function c(e){try{s(a.throw(e))}catch(e){i(e)}}function s(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(o,c)}s((a=a.apply(e,t||[])).next())}))};!function(){l(this,void 0,void 0,(function*(){const t=document.createElement("canvas"),[i,o,l]=e(t,{alpha:!1,antialias:!1,depth:!1,powerPreference:"high-performance"});let u=yield fetch("./shaders/mandelbrot.fs").then((e=>e.text())),[d,m]=n(i,u),p=window.devicePixelRatio;const f=r(i,a(i,d,"U").size);function h(e){b.value=e.toString(),N=Math.exp(-e),f(new Float32Array([e]),44)}function g(e,t){f(new Float32Array([e,t]),16)}f(new Uint32Array([80,400])),f(new Float32Array([6,5e3,t.clientWidth*p,t.clientHeight*p,-.74,.18,3,4,5,0,.1]),8);const v=Object.assign(document.createElement("input"),{type:"range",id:"dpr",step:""+.25*p,min:""+.5*p,max:""+2*p,value:p.toString(),oninput:()=>{p=v.valueAsNumber;const[e,n]=l(p);o(e,n),O=2/t.clientHeight,g(e,n),requestAnimationFrame(C)}}),b=Object.assign(document.createElement("input"),{type:"range",id:"zoom",step:"1e-4",min:"0",max:"12",value:"0",oninput:()=>{j=b.valueAsNumber,h(j),requestAnimationFrame(C)}}),y=Object.assign(document.createElement("input"),{type:"range",id:"minIter",step:"1",min:"0",max:"400",value:"80",oninput:()=>{w.min=y.value.toString(),f(new Uint32Array([y.valueAsNumber]),0),requestAnimationFrame(C)}}),w=Object.assign(document.createElement("input"),{type:"range",id:"maxIter",step:"1",min:"80",max:"1000",value:"400",oninput:()=>{y.max=w.value.toString(),f(new Uint32Array([w.valueAsNumber]),4),requestAnimationFrame(C)}}),A=Object.assign(document.createElement("input"),{type:"range",id:"minEscape",step:"1e-4",min:"0",max:"12",value:"6",oninput:()=>{x.min=A.value.toString(),f(new Float32Array([A.valueAsNumber]),8),requestAnimationFrame(C)}}),x=Object.assign(document.createElement("input"),{type:"range",id:"maxEscape",step:"1e-4",min:"6",max:"1e4",value:"5e3",oninput:()=>{f(new Float32Array([x.valueAsNumber]),12),requestAnimationFrame(C)}}),E=Object.assign(document.createElement("input"),{type:"range",id:"hue",step:"1e-4",min:"0",max:"1",value:"0",oninput:()=>{f(new Float32Array([...c(3,4,5,E.valueAsNumber)]),32),requestAnimationFrame(C)}}),F=Object.assign(document.createElement("input"),{type:"range",id:"colorScale",step:"1e-4",min:"0",max:".5",value:".1",oninput:()=>{f(new Float32Array([F.valueAsNumber]),48),requestAnimationFrame(C)}});let O,I=[],j=0,P=-.74,S=.18,N=Math.exp(-j),M=0,k=e=>{I=I.filter((t=>t.pointerId!==e.pointerId)),I.length<2&&(M=0),t.releasePointerCapture(e.pointerId)};function C(){i.clear(i.COLOR_BUFFER_BIT),m()}Object.assign(t,{onpointerdown:e=>{I.push(e),1===I.length&&t.setPointerCapture(e.pointerId)},onpointermove:e=>{if(I[I.findIndex((t=>t.pointerId===e.pointerId))]=e,1===I.length)P-=e.movementX*N*O,S+=e.movementY*N*O,f(new Float32Array([P,S]),24);else if(2===I.length&&e.isPrimary){const[e,t]=I,n=Math.hypot(e.offsetX-t.offsetX,e.offsetY-t.offsetY);M&&h(j+=(n-M)*O*2),M=n}requestAnimationFrame(C)},onpointercancel:k,onpointerleave:k,onpointerout:k,onpointerup:k}),t.addEventListener("wheel",(e=>{e.preventDefault(),h(j-=e.deltaY*O),requestAnimationFrame(C)}),{passive:!1}),document.getElementById("canvas-content").append(function(e,t,n,...a){Object.assign(e,{className:"canvas-element",id:t});const r=Object.assign(document.createElement("div"),{className:"canvas-box",id:t+"-box"});r.append(e);const i=Object.assign(document.createElement("div"),{className:"canvas-container",id:t+"-container"});if(i.addEventListener("wheel",(e=>{e.preventDefault()}),{passive:!1}),a){const e=Object.assign(document.createElement("div"),{className:"canvas-panel",id:t+"-panel"}),n=Object.assign(document.createElement("button"),{className:"fullscreen-button",id:t+"-fullscreen",textContent:"Fullscreen",onclick:()=>{document.fullscreenElement?document.exitFullscreen():r.requestFullscreen()}});let i=0;const o=()=>{i=0};Object.assign(r,{ondblclick:t=>{t.preventDefault(),e.style.display="none"===e.style.display?"flex":"none"},onpointerdown:()=>{i++,3===i&&(e.style.display="none"===e.style.display?"flex":"none")},onpointercancel:o,onpointerup:o,onpointerout:o,onpointerleave:o}),e.append(n,...a),r.append(e)}return i.append(Object.assign(document.createElement("span"),{className:"canvas-caption",id:t+"-caption",textContent:n}),r),i}(t,"mandelbrot","Mandelbrot Set Explorer",s(v,"Resolution Scale"),s(b,"Zoom"),s(y,"Min Iterations"),s(w,"Max Iterations"),s(A,"Min Escape"),s(x,"Max Escape"),s(E,"Hue"),s(F,"Color Scale"))),window.addEventListener("resize",(()=>{const[e,n]=l(p);o(e,n),O=2/t.clientHeight,g(e,n),requestAnimationFrame(C)})),window.dispatchEvent(new Event("resize")),i.useProgram(d),i.clearColor(0,0,0,1),requestAnimationFrame(C)}))}(),function(){i(this,void 0,void 0,(function*(){const t=document.createElement("canvas"),[i,o,c]=e(t,{alpha:!1,antialias:!1,depth:!1,powerPreference:"high-performance"});let s=yield fetch("./shaders/background.fs").then((e=>e.text())),[l,u]=n(i,s);const d=r(i,a(i,l,"U").size);function m(e){v=Math.exp(-e),d(new Float32Array([e]),20)}d(new Float32Array([0,0,0,0,0,1]));let p,f,h=[],g=1,v=Math.exp(-g),b=0,y=e=>{h=h.filter((t=>t.pointerId!==e.pointerId)),t.releasePointerCapture(e.pointerId),h.length<2&&(b=0)};Object.assign(t,{className:"canvas-element fixed-canvas",id:"canvas-background",ondblclick:()=>{A.style.display="none"===A.style.display?"flex":"none"},onpointerdown:e=>{h.push(e),1===h.length?t.setPointerCapture(e.pointerId):3===h.length&&(A.style.display="none"===A.style.display?"flex":"none")},onpointermove:e=>{if(h[h.findIndex((t=>t.pointerId===e.pointerId))]=e,1===h.length)d(new Float32Array([e.offsetX*p-1,e.offsetY*f+1]));else if(2===h.length&&e.isPrimary){const[e,t]=h,n=Math.hypot(e.offsetX-t.offsetX,-(e.offsetY-t.offsetY));b&&m(g+=(n-b)*f*2),b=n}},onpointercancel:y,onpointerleave:y,onpointerout:y,onpointerup:y}),t.addEventListener("wheel",(e=>{e.preventDefault(),m(g=Math.max(g-e.deltaY*g*f*.2,.5))}),{passive:!1});const w=Object.assign(document.createElement("div"),{className:"canvas-box",id:"background-box",ondblclick:()=>{A.style.display="none"===A.style.display?"flex":"none"}}),A=Object.assign(document.createElement("button"),{className:"fullscreen-button",id:"background-fullscreen",textContent:"Fullscreen",onclick:()=>{document.fullscreenElement?document.exitFullscreen():w.requestFullscreen()}});w.append(t,A),document.body.prepend(w),window.addEventListener("resize",(()=>{const[e,t]=c();o(e,t),function(e,t){[p,f]=[2/e,2/t],d(new Float32Array([p,f]),8)}(e,t)})),window.dispatchEvent(new Event("resize")),i.useProgram(l),i.clearColor(0,0,0,1),requestAnimationFrame((function e(t){i.clear(i.COLOR_BUFFER_BIT),d(new Float32Array([5e-5*t]),16),u(),requestAnimationFrame(e)}))}))}()})(),e.p,e.p,e.p})();