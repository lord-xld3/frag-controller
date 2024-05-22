import { UniformBlockHandler } from "./gl-utils";

/**
 * Outputs coords, delta, and zoom to CPU uniform buffer.
 * @param target - The canvas element.
 * @param handler - The uniform block handler.
 * @param coordsOffset - The offset in elements for the coords in the uniform buffer.
 * @param deltaOffset - The offset in elements for the delta in the uniform buffer.
 * @param zoomOffset - The offset in elements for the zoom in the uniform buffer.
 * @param zoomRange - The range of zoom values.
 * @param tripleTap - A function to call on triple tap.
 */
export function touchStream(
    target: HTMLCanvasElement,
    handler: UniformBlockHandler,
    coordsOffset: number,
    deltaOffset: number,
    zoomOffset: number,
    tripleTap: () => void,
) : void {
    
    // Reciprocal of canvas resolution, for scaling.
    const [W, H] = [1 / target.clientWidth, 1 / target.clientHeight],
        S = 2, // pan sensitivity
        Z = 2; // zoom sensitivity

    let c: any[] = [], // pointerdown coords
        i = 0, // pointerdown count
        z = 0.01, // default zoom level
        dx = 0, // delta x
        dy = 0, // delta y
        m = Math.exp(-z), // exp(-zoom)
        ptrdistance = 0; // pointer distance

    target.addEventListener('pointerdown', (e) => {
        c.push(e.clientX, e.clientY);
        ptrdistance = Math.hypot(c[2] - c[0], c[3] - c[1]);
        if (++i === 3) tripleTap(); 
    });

    target.addEventListener('pointermove', (e) => {
        let x = e.movementX, 
            y = e.movementY, 
            p = e.clientX,
            q = e.clientY;
        if (i === 1 || i > 2) { // pan
            target.setPointerCapture(e.pointerId);
            handler.set(new Uint32Array([p, q]), coordsOffset);
            handler.set(new Float32Array([dx -= x * H * m * S, dy += y * H * m * S]), deltaOffset);
        } else if (i === 2) { // pinch
            ptrdistance = Math.hypot(c[2] - c[0], c[3] - c[1]);
            // ptr1.xy, ptr2.xy
            // 2-swipe up/down
            // handler.set(new Float32Array([z += s * H]), zoomOffset);
            // pinch
            handler.set(new Float32Array([z += ptrdistance]), zoomOffset);
        }
    });

    target.addEventListener('pointercancel', () => i = 0);
    target.addEventListener('pointerup', () => i = 0);
    target.addEventListener('pointerout', () => i = 0);
    target.addEventListener('pointerleave', () => i = 0);

    target.addEventListener('wheel', (e) => {
        z -= e.deltaY * H * Z,
        m = Math.exp(-z);
        handler.set(new Float32Array([z]), zoomOffset);
    });
}