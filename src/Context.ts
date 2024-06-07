export let _gl: WebGL2RenderingContext;

/**
 * Sets up an extended WebGL2 context.
 * @param canvas - The canvas element.
 * @param options - The WebGL context attributes.
 * @returns WebGL2RenderingContext
 */
export default function init(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    options?: WebGLContextAttributes,
) {
    const gl = canvas.getContext('webgl2', options)!;
    if (!gl) throw new Error('WebGL2 is not supported');

    return _gl = gl;
}