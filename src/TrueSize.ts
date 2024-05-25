/**
 * Returns the true size of an element using ResizeObserver and passes it to a callback.
*/
function trueSize(
    entry: ResizeObserverEntry[],
    callback: (width: number, height: number, dpr: number) => void,
): void {
    for (const e of entry) {
        const [width, height, dpr] = e.devicePixelContentBoxSize ? 
            [e.devicePixelContentBoxSize[0].inlineSize, e.devicePixelContentBoxSize[0].blockSize, 1]
        : [e.contentBoxSize[0].inlineSize, e.contentBoxSize[0].blockSize, window.devicePixelRatio];
        callback(width, height, dpr);
    }
};

/**
 * Creates a ResizeObserver with a callback for each target. Tries to get the true size of the element.
* @param target - The target element.
* @param callback - A function that receives the width, height, and device pixel ratio.
*/
export default function resizeListener(
    targets: HTMLElement[],
    callback: (width: number, height: number, dpr: number) => void,
) {
    const o = new ResizeObserver((e) => { trueSize(e, callback); });
    return {
        /**
         * Disconnects the ResizeObserver.
         */
        unobserve: () => { o.disconnect(); },
        /**
         * Observes the targets.
         */
        observe: () => {
            for (let i=0; i<targets.length; i++) { o.observe(targets[i]); };
        },
    };
};