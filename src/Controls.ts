import { UniformBlockHandler } from "./gl-utils";

/**
 * Controls a touchStream.
 */
export interface StreamHandler {
    /**
     * Binds the event handlers.
     */
    bind: () => void,
    /**
     * Unbinds the event handlers.
     */
    unbind: () => void,
}

export interface BaseStreamHandler extends StreamHandler {
    setCoords: (x: number, y: number) => void,
    setDelta: (dx: number, dy: number) => void,
    setResolution: (width: number, height: number) => void,
    setTime: (time: number) => void,
    setZoom: (zoom: number) => void,
}

/**
 * Binds touch events to a target element.
 * @param target - The target element.
 * @param down - The down event handler.
 * @param move - The move event handler.
 * @param up - The up event handler.
 * @param wheel - The wheel event handler.
 */
export function touchStream(
    target: GlobalEventHandlers,
    down: (e: PointerEvent) => void = () => {},
    move: (e: PointerEvent) => void = () => {},
    up: (e: PointerEvent) => void = () => {},
    wheel: (e: WheelEvent) => void = () => {},
) : StreamHandler {
    return {
        bind: () => {
            target.onpointerdown = down;
            target.onpointermove = move;
            target.onpointerup = up;
            target.onpointercancel = up;
            target.onpointerout = up;
            target.onpointerleave = up;
            target.addEventListener('wheel', wheel, { passive: true });
        },
        unbind: () => {
            target.onpointerdown = null;
            target.onpointermove = null;
            target.onpointerup = null;
            target.onpointercancel = null;
            target.onpointerout = null;
            target.onpointerleave = null;
            target.onwheel = null;
        }
    };
}

export function whenResized(
    target: Element,
    resize: (e: ResizeObserverEntry[]) => void,
) {
    const observer = new ResizeObserver(resize);
    observer.observe(target);
}

/**
 * Streams canvas [iMouse.xy, iDelta.xy, iResolution.xy, iZoom.x] to a uniform block.
 * @param canvas - Canvas element.
 * @param handler - Uniform block handler.
 * @param zoom - Zoom level. (Default: 1)
 * @note Expected uniform block layout:
 * ```
 * uniform U {
 *    uvec2 M, R;
 *   vec2 D;
 *  float T, Z;
 * };```
 * where names are user-defined.
 */
export function baseStream(
    canvas: HTMLCanvasElement,
    handler: UniformBlockHandler,
    zoom: number,
    tap3: (e: PointerEvent) => void,
): BaseStreamHandler {
    const H = 1/canvas.clientHeight;
    
    let ec: PointerEvent[] = [],
        z = zoom, // default zoom level
        dx = 0, // delta x
        dy = 0, // delta y
        m = Math.exp(-z), // exp(-zoom)
        prevDiff = 0; // previous distance between two pointers

    function setCoords(x: number, y: number) {
        handler.set(new Uint32Array([x, y]), 0);
    }

    function setDelta(x: number, y: number) {
        dx = x, dy = y;
        handler.set(new Float32Array([x, y]), 16);
    }

    function setResolution(width: number, height: number) {
        handler.set(new Uint32Array([width, height]), 8);
    }
    
    function setTime(time: number) {
        handler.set(new Float32Array([time]), 24);
    }
    
    function setZoom(zoom: number) {
        z = zoom,
        m = Math.exp(-z);
        handler.set(new Float32Array([z]), 28);
    }


    function down(e: PointerEvent) {
        ec.push(e);
        if (ec.length === 1) canvas.setPointerCapture(e.pointerId);
        if (ec.length === 3) tap3(e);
        setCoords(e.clientX, e.clientY);
    }

    function move(e: PointerEvent) {
        let f = ec.findIndex(ev => ev.pointerId === e.pointerId);
        ec[f] = e;

        if (ec.length === 1) { // Pan
            setCoords(e.clientX, e.clientY);
            setDelta(dx -= e.movementX * H * m * 2, dy += e.movementY * H * m * 2);
        }

        if (ec.length === 2 && e.isPrimary) { // Pinch
            const [e1, e2] = ec;
            const diff = Math.hypot(e1.clientX - e2.clientX, e1.clientY - e2.clientY);
            if (prevDiff) {
                z += (diff - prevDiff) * H * 4,
                m = Math.exp(-z);
                setZoom(z);
            }
            prevDiff = diff;
        }
    }
    
    function up(e: PointerEvent) {
        ec = ec.filter(ev => ev.pointerId !== e.pointerId);
        if (ec.length < 2) prevDiff = 0;
        canvas.releasePointerCapture(e.pointerId);
    }

    function wheel(e: WheelEvent) {
        z -= e.deltaY * H,
        m = Math.exp(-z);
        setZoom(z);
    }

    return {
        ...touchStream(
            canvas,
            down,
            move,
            up,
            wheel,
        ),
        setCoords,
        setDelta,
        setResolution,
        setTime,
        setZoom,
    }
}

/**
 * Creates a new input range element and returns it.
 * @param parent - The parent element.
 * @param label - The label text.
 * @param value - The initial value. (Default: 0)
 * @param step - The step value. (Default: 1)
 * @param min - The minimum value. (Default: 0)
 * @param max - The maximum value. (Default: 1)
*/
export function newInputRange(
    parent: HTMLElement,
    label: string,
    value: number = 0,
    step: number = 1,
    min: number = 0,
    max: number = 1,
): HTMLInputElement {
    const controlDiv = Object.assign(document.createElement('div'), { className: 'overlay' }),
        labelElement = Object.assign(document.createElement('label'), { textContent: label }),
        inputElement = Object.assign(document.createElement('input'), {
            type: 'range',
            id: label,
            name: label,
            step: step.toString(),
            min: min.toString(),
            max: max.toString(),
            value: value.toString(),
        }),
        tooltipSpan = Object.assign(document.createElement('span'), { 
            className: 'tooltip', 
            id: `${label}-tooltip`,
            textContent: value.toString(),
        });

    labelElement.setAttribute('for', label);
    inputElement.addEventListener('input', () => {
        tooltipSpan.textContent = inputElement.value;
    });

    controlDiv.append(labelElement, inputElement, tooltipSpan);
    parent.appendChild(controlDiv);

    return inputElement;
}