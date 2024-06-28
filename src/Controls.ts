import { obj } from "./Types";

export function controlTemplate(
    control: HTMLInputElement,
    label: string,
) {
    const controlID = control.id;
    
    const container = obj(document.createElement('div'), {
        className: 'panel-control',
        id: `${controlID}-container`,
    });
    const tooltip = obj(document.createElement('span'), { 
        className: 'input-tooltip', 
        id: `${controlID}-tooltip`,
        textContent: control.value,
    });

    control.addEventListener('input', () => {
        tooltip.textContent = control.value;
    });

    container.append(
        obj(document.createElement('label'), {
            className: 'control-label',
            id: `${controlID}-label`, 
            textContent: label,
            htmlFor: controlID
        }), 
        control, 
        tooltip,
    );

    return container
}

export function canvasTemplate(
    canvas: HTMLCanvasElement, 
    id: string,
    caption: string,
    ...content: HTMLElement[]
) {

    

    obj(canvas, {
        className: 'canvas-element',
        id: id,
    });

    const box = obj(document.createElement('div'), {
        className: 'canvas-box',
        id: `${id}-box`
    })

    box.append(canvas)

    const container = obj(document.createElement('div'), {
        className: 'canvas-container',
        id: `${id}-container`,
    });

    container.addEventListener('wheel', (e: WheelEvent) => {
        e.preventDefault();
    }, {passive: false})

    if (content) {
        const panel = obj(document.createElement('div'), {
            className: 'canvas-panel',
            id: `${id}-panel`,
        });
        const fs = obj(document.createElement('button'), {
            className: 'fullscreen-button',
            id: `${id}-fullscreen`,
            textContent: 'Fullscreen',
            onclick: () => {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    box.requestFullscreen();
                }
            }
        });
        let i = 0;
        const upfunc = () => {i = 0;}
        obj(box, { 
            ondblclick: (e: MouseEvent) => {
                e.preventDefault();
                panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
            },
            onpointerdown: () => {
                if (i++ === 3) panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
            },
            onpointercancel: upfunc,
            onpointerup: upfunc,
            onpointerout: upfunc,
            onpointerleave: upfunc,
        })
        panel.append(fs, ...content);
        box.append(panel);
    }
    
    container.append(
        obj(document.createElement('span'), {
            className: 'canvas-caption',
            id: `${id}-caption`,
            textContent: caption
        }), 
        box
    );

    return container;
}