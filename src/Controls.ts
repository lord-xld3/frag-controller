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
 * @param down - The down event handler.
 * @param move - The move event handler.
 * @param up - The up event handler.
 * @param wheel - The wheel event handler.
 */
export function pointerEvents(
    target: GlobalEventHandlers,
    down: (e: PointerEvent) => void = ()=>{},
    up: (e: PointerEvent) => void = ()=>{},
    move: (e: PointerEvent) => void = ()=>{},
    wheel: (e: WheelEvent) => void = ()=>{},
) : StreamHandler {
    return {
        bind: () => {
            target.addEventListener('pointerdown', down);
            target.addEventListener('pointermove', move);
            target.addEventListener('pointerup', up);
            target.addEventListener('pointercancel', up);
            target.addEventListener('pointerout', up);
            target.addEventListener('pointerleave', up);
            target.addEventListener('wheel', wheel, { passive: true });
        },
        unbind: () => {
            target.removeEventListener('pointerdown', down);
            target.removeEventListener('pointermove', move);
            target.removeEventListener('pointerup', up);
            target.removeEventListener('pointercancel', up);
            target.removeEventListener('pointerout', up);
            target.removeEventListener('pointerleave', up);
            target.removeEventListener('wheel', wheel);
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