import { UniformBlockHandler } from "./Fragger";

const info = document.getElementById('overlay-info') as HTMLDivElement;

/**
 * Controls a bindPointer.
 */
interface StreamHandler {
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
    /**
     * Sets the mouse coordinate uniform.
     * @param x - The x-coordinate.
     * @param y - The y-coordinate.
     */
    setCoords: (x: number, y: number) => void,
    /**
     * Sets the resolution uniform.
     * @param width - The width.
     * @param height - The height.
     */
    setResolution: (width: number, height: number) => void,
    /**
     * Sets the delta uniform.
     * @param x - The x-delta.
     * @param y - The y-delta.
     */
    setDelta: (x: number, y: number) => void,
    /**
     * Sets the time uniform.
     * @param time - The time.
     */
    setTime: (time: number) => void,
    /**
     * Sets the zoom uniform.
     * @param zoom - The zoom level.
     */
    setZoom: (zoom: number) => void,
}

/**
 * Binds pointer events to a target element.
 * @param target - The target element.
 * @param down - The down event handler.
 * @param move - The move event handler.
 * @param up - The up event handler.
 * @param wheel - The wheel event handler.
 */
export function bindPointer(
    target: GlobalEventHandlers,
    down: (e: PointerEvent) => void = ()=>{},
    move: (e: PointerEvent) => void = ()=>{},
    up: (e: PointerEvent) => void = ()=>{},
    wheel: (e: WheelEvent) => void = ()=>{},
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
            target.removeEventListener('wheel', wheel);
        }
    };
}

/**
 * Streams canvas [iMouse.xy, iResolution.xy, iDelta.xy, iZoom.x] to a uniform block.
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
    zoom: number = 1,
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

    function setResolution(width: number, height: number) {
        handler.set(new Uint32Array([width, height]), 8);
    }

    
    function setDelta(x: number, y: number) {
        dx = x, dy = y;
        handler.set(new Float32Array([x, y]), 16);
    }
    
    function setTime(time: number) {
        handler.set(new Float32Array([time]), 24);
    }
    
    function setZoom(zoom: number) {
        z = zoom,
        m = Math.exp(-zoom);
        handler.set(new Float32Array([zoom]), 28);
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
            // 2 is a magic number, feels right.
        }

        // && e.isPrimary only fires on the primary pointer.
        if (ec.length === 2 && e.isPrimary) { // Pinch
            const [e1, e2] = ec;
            const diff = Math.hypot(e1.clientX - e2.clientX, e1.clientY - e2.clientY);
            if (prevDiff) setZoom(z += (diff - prevDiff) * H * 4);
            prevDiff = diff;
        }
    }
    
    function up(e: PointerEvent) {
        ec = ec.filter(ev => ev.pointerId !== e.pointerId);
        if (ec.length < 2) prevDiff = 0;
        canvas.releasePointerCapture(e.pointerId);
    }

    function wheel(e: WheelEvent) { setZoom(z -= e.deltaY * H) }

    return {
        ...bindPointer(
            canvas,
            down,
            move,
            up,
            wheel,
        ),
        setCoords,
        setResolution,
        setDelta,
        setTime,
        setZoom,
    };
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
    classname: string = 'control',
): HTMLInputElement {
    const controlDiv = Object.assign(document.createElement('div'), { className: classname }),
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