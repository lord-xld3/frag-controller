export function controlTemplate(
    control: HTMLInputElement,
    label: string,
) {
    const controlID = control.id;
    
    const container = Object.assign(document.createElement('div'), {
        className: 'panel-control',
        id: `${controlID}-container`,
    });
    const tooltip = Object.assign(document.createElement('span'), { 
        className: 'input-tooltip', 
        id: `${controlID}-tooltip`,
        textContent: control.value,
    });

    control.addEventListener('input', () => {
        tooltip.textContent = control.value;
    });

    container.append(
        Object.assign(document.createElement('label'), {
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

    

    Object.assign(canvas, {
        className: 'canvas-element',
        id: id,
    });

    const box = Object.assign(document.createElement('div'), {
        className: 'canvas-box',
        id: `${id}-box`
    })

    box.append(canvas)

    const container = Object.assign(document.createElement('div'), {
        className: 'canvas-container',
        id: `${id}-container`,
    });

    container.addEventListener('wheel', (e: WheelEvent) => {
        e.preventDefault();
    }, {passive: false})

    if (content) {
        const panel = Object.assign(document.createElement('div'), {
            className: 'canvas-panel',
            id: `${id}-panel`,
        });
        let i = 0;
        const upfunc = () => {i = 0;}
        Object.assign(box, { 
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
        panel.append(...content);
        box.append(panel);
    }
    
    container.append(
        Object.assign(document.createElement('span'), {
            className: 'canvas-caption',
            id: `${id}-caption`,
            textContent: caption
        }), 
        box
    );

    return container;
}