// myPatchView.js

/**
 * Bind a backend endpoint to a Parameter object
 */
function bindParameter(patchConnection, endpointID) {
    return {
        min: 0, max: 1, initialValue: 0,
        onBeginEdit: () => patchConnection.sendParameterGestureStart(endpointID),
        onEdit: (v) => patchConnection.sendEventOrValue(endpointID, v),
        onEndEdit: () => patchConnection.sendParameterGestureEnd(endpointID),
        subscribe: (listener) => {
            patchConnection.addParameterListener(endpointID, listener);
            patchConnection.requestParameterValue(endpointID);
            return () => patchConnection.removeParameterListener(endpointID, listener);
        }
    };
}

/**
 * Create a knob with CSS and endpoint binding
 */
export function createKnob({ filepath, size, position, endpoint, patchConnection, className }) {
    if (!className) {
        const filename = filepath.split('/').pop().split('.')[0];
        className = `${filename}-knob`;
    }
    const addUnit = v => typeof v === 'number' ? `${v}px` : v;
    const css = `
.${className} {
    width: ${addUnit(size.width)};
    height: ${addUnit(size.height)};
    background-image: url(${filepath});
    position: absolute;
    left: ${addUnit(position.left)};
    top: ${addUnit(position.top)};
}`;
    const parameter = endpoint && patchConnection ? bindParameter(patchConnection, endpoint) : null;
    return { className, css, parameter };
}

/**
 * Create background CSS
 */
export function createBackground(filename, size, className) {
    if (!className) {
        const baseName = filename.split('/').pop().split('.')[0];
        className = `${baseName}-bg`;
    }
    const addUnit = v => typeof v === 'number' ? `${v}px` : v;
    const css = `
.${className} {
    width: ${addUnit(size.width)};
    height: ${addUnit(size.height)};
    background-image: url(${filename});
}`;
    return { className, css };
}

/**
 * Create a fader with CSS and endpoint binding
 */
export function createFader({ backgroundPath, thumbPath, backgroundSize, thumbSize, position, isVertical = true, endpoint, patchConnection, className }) {
    if (!className) {
        const baseName = backgroundPath.split('/').pop().split('.')[0];
        className = `${baseName}-fader`;
    }
    const addUnit = v => typeof v === 'number' ? `${v}px` : v;

    const bgClass = `${className}-bg`;
    const thumbClass = `${className}-thumb`;

    const thumbPos = isVertical
        ? `left: 50%; transform: translateX(-50%); top: 0;`
        : `top: 50%; transform: translateY(-50%); left: 0;`;

    const css = `
.${bgClass} {
    width: ${addUnit(backgroundSize.width)};
    height: ${addUnit(backgroundSize.height)};
    background-image: url(${backgroundPath});
    position: absolute;
    left: ${addUnit(position.left)};
    top: ${addUnit(position.top)};
}
.${thumbClass} {
    width: ${addUnit(thumbSize.width)};
    height: ${addUnit(thumbSize.height)};
    background-image: url(${thumbPath});
    position: absolute;
    ${thumbPos}
    cursor: pointer;
    z-index: 1;
}`;

    const parameter = endpoint && patchConnection ? bindParameter(patchConnection, endpoint) : null;

    return { className, backgroundClass: bgClass, thumbClass, css, parameter };
}

/**
 * Default export: self-contained patch view
 */
export default function createPatchView(patchConnection) {
    const container = document.createElement("div");

    // Inject CSS
    const style = document.createElement('style');
    container.appendChild(style);

    // Example: create knobs/faders
    const knobs = [
        createKnob({ filepath:'knob-big.svg', size:{width:68,height:68}, position:{left:50,top:50}, endpoint:'rate', patchConnection }),
        createKnob({ filepath:'knob-small.svg', size:{width:48,height:48}, position:{left:120,top:50}, endpoint:'depth', patchConnection })
    ];
    const faders = [
        createFader({ backgroundPath:'fader-bg.svg', thumbPath:'fader-thumb.svg', backgroundSize:{width:20,height:100}, thumbSize:{width:20,height:20}, position:{left:200,top:50}, endpoint:'volume', patchConnection })
    ];
    const background = createBackground('enclosure.svg', { width:250, height:423 });

    style.textContent = [background.css, ...knobs.map(k => k.css), ...faders.map(f => f.css)].join('\n');

    // Build DOM
    const bgDiv = document.createElement('div');
    bgDiv.className = background.className;
    container.appendChild(bgDiv);

    knobs.forEach(k => {
        const div = document.createElement('div');
        div.className = k.className;
        container.appendChild(div);

        // subscribe to backend updates
        k.parameter?.subscribe(v => {
            // update visual rotation/value here if desired
        });
    });

    faders.forEach(f => {
        const bg = document.createElement('div');
        bg.className = f.backgroundClass;
        container.appendChild(bg);
        const thumb = document.createElement('div');
        thumb.className = f.thumbClass;
        container.appendChild(thumb);

        f.parameter?.subscribe(v => {
            // update thumb position here
        });
    });

    return container;
}
