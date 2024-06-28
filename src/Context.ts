/**
 * Initialize WebGL2 context.
 * @param canvas - The canvas element.
 * @param options - The WebGL context attributes.
 * @returns [WebGL2RenderingContext, resizeViewport(), resizeCanvas()]
 * @example const [gl] = init(canvas, { antialias: false });
 * @example const [gl, resizeViewport] = init(canvas);
 * @example const [gl, resizeViewport, resizeCanvas] = init(canvas);
 */
export default function init(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    options?: WebGLContextAttributes,
): [
    WebGL2RenderingContext, 
    ViewportResizeFunction,
    CanvasResizeFunction, 
] {
    const gl = canvas.getContext('webgl2', options) as WebGL2RenderingContext;
    if (!gl) throw new Error('WebGL2 is not supported');

    return [
        gl, 
        /**
         * Resize the gl viewport.
         * @param width - Positive integer.
         * @param height - Positive integer.
         * @param x - The left offset of the viewport.
         * @param y - The bottom offset of the viewport.
         */
        function resizeViewport(
            width: number = (canvas as HTMLCanvasElement).clientWidth,
            height: number = (canvas as HTMLCanvasElement).clientHeight,
            x: number = 0,
            y: number = 0, 
        ) {
            gl.viewport(x, y, width, height);
        },
        canvas instanceof HTMLCanvasElement ? 
            function(
                dpr: number = window.devicePixelRatio,
                width: number = canvas.clientWidth,
                height: number = canvas.clientHeight,
            ) {
                return [canvas.width = width * dpr, canvas.height = height * dpr];
            }
        : function(
            dpr: number = window.devicePixelRatio,
            width: number = canvas.width,
            height: number = canvas.height,
        ) {
            return [canvas.width = width * dpr, canvas.height = height * dpr];
        } 
    ];
}

/**
 * Resize the canvas element.
 * @param dpr - The device pixel ratio.
 * @param width - The width of the canvas.
 * @param height - The height of the canvas.
 * @returns [width, height]
 */
type CanvasResizeFunction = (dpr?: number, width?: number, height?: number) => [number, number];

/**
 * Resize the gl viewport.
 * @param width - The width of the viewport.
 * @param height - The height of the viewport.
 * @param x - The left offset of the viewport.
 * @param y - The bottom offset of the viewport.
 * 
 * @example resizeViewport(800, 600); // Resize viewport to 800x600.
 * @example resizeViewport(w, h, canvas.width/2 - w/2, canvas.height/2 - h); // Center viewport.
 */
type ViewportResizeFunction = (width?: number, height?: number, x?: number, y?: number) => void;