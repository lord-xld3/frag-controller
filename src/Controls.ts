import { TypedArray, UniformBlockHandler } from "./gl-utils";

/**
    Binds an event target to update a uniform block buffer on the CPU.
    @param target - The event target.
    @param name - The event name.
    @param dataReturn - The function to return the data from the event.
    @param handler - The uniform block handler.
    @param bufferOffset - In elements. (Default: 0)
 */
export function listener(
    target: any, 
    name: string,
    handler: UniformBlockHandler, 
    bufferOffset: number = 0, 
    dataReturn: (event: any) => TypedArray, 
) {
    target.addEventListener(name, (e:any) => { 
        handler.set(dataReturn(e), bufferOffset); 
    });
}

/**
 * Bind multiple events to update the uniform buffer on CPU.
 * @param target - The event target.
 * @param handler - The uniform block handler.
 * @param coordsOffset - Mouse/touch coords offset in elements for the uniform buffer. (Default: 0)
 * @param zoomOffset - Wheel/pinch zoom offset in elements for the uniform buffer. (Default: 2)
 */
export function touchListener(
    target: HTMLCanvasElement,
    handler: UniformBlockHandler,
    coordsOffset: number = 0,
    zoomOffset: number = 2,
) { 
    let dragging = false;
    let zoom = 0;
    let coords = [0, 0];
    let dx = 0, dy = 0;

    const drag = (e: PointerEvent) => {
        dx += -e.movementX * 2 / (target.clientWidth * Math.exp(zoom)),
        dy += e.movementY * 2 / (target.clientHeight * Math.exp(zoom));

        return new Float32Array([
            dx, dy
        ])
    };

    const wheel = (e: WheelEvent) => {
        zoom += e.deltaY / target.clientHeight;
        zoom = Math.max(zoom, 0.1); // min zoom
        return new Float32Array([zoom]);
    }
    
    const pinch = (e: PointerEvent) => {
        return new Float32Array([Math.hypot(
            e.movementX - coords[0],
            e.movementY - coords[1]
        )]);
    };
    
    target.addEventListener('pointerdown', (e) => {
        dragging = true;
        coords = [e.clientX, e.clientY];
    });
    
    target.addEventListener('pointerup', () => {
        dragging = false;
        coords = [0, 0];
    });
    
    target.addEventListener('pointermove', (e) => {
        if (dragging) handler.set(drag(e), coordsOffset);
    });
    
    target.addEventListener('wheel', (e) => {
        handler.set(wheel(e), zoomOffset);
    }, { passive: true });
}