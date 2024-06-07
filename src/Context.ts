export let _gl: WebGL2RenderingContext;

/**
 * Initialize WebGL2 context.
 * @param canvas - The canvas element.
 * @param options - The WebGL context attributes.
 * @returns WebGL2RenderingContext
 */
export default function init(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    options?: WebGLContextAttributes,
): WebGL2RenderingContext {
    _gl = canvas.getContext('webgl2', options)!;
    if (!_gl) throw new Error('WebGL2 is not supported');
    return _gl;
}

/**
 * Returns the NDC normalized width and height of the canvas.
 * @param dpr - Device pixel ratio.
 * @param width - The width of the canvas.
 * @param height - The height of the canvas.
 * @returns [width, height]
 */
export function scaleToDevice(
    dpr: number = window.devicePixelRatio, 
    width?: number,
    height?: number, 
): [number, number] {
    // Return 2/width && 2/height for NDC.
    // So we can use (gl.FragCoord.xy * iResolution - 1.0) to convert to NDC.
    // Instead of (gl.FragCoord.xy / iResolution * 2.0 - 1.0).
    // Yes... all of this to save a division operation.
    const c = _gl.canvas as HTMLCanvasElement;

    return [
        2/(width?? c.clientWidth * dpr), 
        2/(height?? c.clientHeight * dpr)
    ];
};