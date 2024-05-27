/**
 * Controls pointer events.
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

/**
 * Binds pointer events to a target element.
 * @param target - The target element.
 * @param funcs - The functions to call on pointer events.
 */
export function pointerEvents(
    target: GlobalEventHandlers,
    funcs: {
        down?: (e: PointerEvent) => void,
        up?: (e: PointerEvent) => void,
        move?: (e: PointerEvent) => void,
        wheel?: (e: WheelEvent) => void,
    }
) : StreamHandler {
    return {
        bind:()=>{
            if (funcs.down) target.addEventListener('pointerdown',funcs.down);
            if (funcs.move) target.addEventListener('pointermove',funcs.move);
            if (funcs.up) {
                target.addEventListener('pointerup',funcs.up);
                target.addEventListener('pointercancel',funcs.up);
                target.addEventListener('pointerout',funcs.up);
                target.addEventListener('pointerleave',funcs.up);
            }
            if (funcs.wheel) target.addEventListener('wheel',funcs.wheel,{passive:false});},
        unbind: () => {
            if (funcs.down) target.removeEventListener('pointerdown',funcs.down);
            if (funcs.move) target.removeEventListener('pointermove',funcs.move);
            if (funcs.up) {
                target.removeEventListener('pointerup',funcs.up);
                target.removeEventListener('pointercancel',funcs.up);
                target.removeEventListener('pointerout',funcs.up);
                target.removeEventListener('pointerleave',funcs.up);
            }
            if (funcs.wheel) target.removeEventListener('wheel',funcs.wheel);
        }
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