/**
 * Returns the true size of an element using ResizeObserver and passes it to a callback.
*/
function trueSize(
    entry: ResizeObserverEntry[],
    callback: (width: number, height: number, dpr: number) => void,
): void {
    for (const e of entry) {
        callback(e.contentBoxSize[0].inlineSize, e.contentBoxSize[0].blockSize, window.devicePixelRatio);
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
        unbind: () => { o.disconnect(); },
        /**
         * Observes the targets.
         */
        bind: () => {
            for (let i=0; i<targets.length; i++) { o.observe(targets[i]); };
        },
    };
};