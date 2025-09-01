// needed functions
function setValueAsGesture (value, { onBeginEdit, onEdit, onEndEdit })
{
    onBeginEdit?.();
    onEdit?.(value);
    onEndEdit?.();
}

function toStatefulEditCallback (controlled, onEdit, update)
{
    if (controlled)
        return onEdit;

    return (nextValue) =>
    {
        onEdit?.(nextValue);
        update?.(nextValue);
    };
}
/// make ROTATABLE
export function makeRotatable ({
    initialValue,
    min = 0,
    max = 1,
    onBeginEdit = () => {},
    onEdit = () => {},
    onEndEdit = () => {},
    maxRotation = 132,
    element,
    controlled = true,
} = {})
{
    initialValue = initialValue ?? min;

    const remap = (source, sourceFrom, sourceTo, targetFrom, targetTo) =>
    {
        return targetFrom + (source - sourceFrom) * (targetTo - targetFrom) / (sourceTo - sourceFrom);
    };

    const toValue = (knobRotation) => remap (knobRotation, -maxRotation, maxRotation, min, max);
    const toRotation = (value) => remap (value, min, max, -maxRotation, maxRotation);

    const state =
    {
        rotation: undefined,
    };

    const update = (nextValue, force) =>
    {
        const degrees = toRotation (nextValue);

        if (! force && state.rotation === degrees)
            return;

        state.rotation = degrees;
        element.style.transform = `rotate(${degrees}deg)`
    };

    onEdit = toStatefulEditCallback (controlled, onEdit, update);

    const force = true;
    update (initialValue, force);

    let accumulatedRotation, touchIdentifier, previousClientY;

    const nextRotation = (rotation, delta) =>
    {
        const clamp = (v, min, max) => Math.min (Math.max (v, min), max);
        return clamp (rotation - delta, -maxRotation, maxRotation);
    };

    const onMouseMove = (event) =>
    {
        event.preventDefault(); // avoid scrolling whilst dragging
        const speedMultiplier = event.shiftKey ? 0.25 : 1.5;
        accumulatedRotation = nextRotation (accumulatedRotation, event.movementY * speedMultiplier);
        onEdit?.(toValue (accumulatedRotation));
    };

    const onMouseUp = () =>
    {
        accumulatedRotation = undefined;
        window.removeEventListener ("mousemove", onMouseMove);
        window.removeEventListener ("mouseup", onMouseUp);
        onEndEdit?.();
    };

    const onMouseDown = () =>
    {
        accumulatedRotation = state.rotation;
        onBeginEdit?.();
        window.addEventListener ("mousemove", onMouseMove);
        window.addEventListener ("mouseup", onMouseUp);
    };

    const onTouchMove = (event) =>
    {
        for (const touch of event.changedTouches)
        {
            if (touch.identifier == touchIdentifier)
            {
                event.preventDefault(); // avoid scrolling whilst dragging
                const speedMultiplier = event.shiftKey ? 0.25 : 1.5;
                const movementY = touch.clientY - previousClientY;
                previousClientY = touch.clientY;
                accumulatedRotation = nextRotation (accumulatedRotation, movementY * speedMultiplier);
                onEdit?.(toValue (accumulatedRotation));
            }
        }
    };

    const onTouchStart = (event) =>
    {
        accumulatedRotation = state.rotation;
        previousClientY = event.changedTouches[0].clientY
        touchIdentifier = event.changedTouches[0].identifier;
        onBeginEdit?.();
        window.addEventListener ("touchmove", onTouchMove);
        window.addEventListener ("touchend", onTouchEnd);
        event.preventDefault();
    };

    const onTouchEnd = (event) =>
    {
        previousClientY = undefined;
        accumulatedRotation = undefined;
        window.removeEventListener ("touchmove", onTouchMove);
        window.removeEventListener ("touchend", onTouchEnd);
        onEndEdit?.();
        event.preventDefault();
    };

    const onReset = () => setValueAsGesture (initialValue, { onBeginEdit, onEdit, onEndEdit });

    element.addEventListener ("mousedown", onMouseDown);
    element.addEventListener ("dblclick", onReset);
    element.addEventListener ('touchstart', onTouchStart);

    return update;
}

function resolvePath (path)
{
    return new URL (path, import.meta.url);
}

export function createSmallKnobDiv(parameter, { left = "0px", top = "0px", width = "50px" , height = "50px" ,  image = "./big-knob-flat.svg" } = {}) {
    const skd = {};
    skd.elm = document.createElement("div");
    skd.elm.className = "knob"; // better than reusing id
    skd.elm.style.position = "absolute";
    skd.elm.style.left = left;
    skd.elm.style.top = top;
    skd.elm.style.width = width;
    skd.elm.style.height = height;
    skd.elm.style.backgroundSize = "cover";
    skd.elm.style.backgroundImage = `url('${resolvePath(image)}')`;
 skd.elm.style.backgroundRepeat = "no-repeat";

    // make knob rotatable AND bind it to parameter lifecycle
    skd.update = makeRotatable({
        element: skd.elm,
        initialValue: parameter.initialValue,
        min: parameter.min,
        max: parameter.max,
        maxRotation: 140,
        controlled: true,
        onBeginEdit: parameter.onBeginEdit,
        onEdit: parameter.onEdit,
        onEndEdit: parameter.onEndEdit,
    });

    return skd;
}

export  function createKnobSetup(paramName, knobId) {
    return (parameters) => setupAndSubscribe(
        parameters[paramName], 
        (parameter) => setupKnob(knobId, parameter)
    );
}


export function createHTML()
{

     return `
<style>
* {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

.enclosure-svg {
    width: 250px;
    height: 423px;

    background-image: url(${resolvePath ("./enclosure.svg")});
}

.big-knob-svg {
    width: 68px;
    height: 68px;

    background-image: url(${resolvePath ("./big-knob-flat.svg")});
}


.controls {
    position: absolute;
    left: 25px;
    top: 12px;
}

.slot-offset {
    position: relative;
    margin-left: 10px;
    height: 100%;
}

.rectangular-button-svg {
    width: 216px;
    height: 145px;

    background-image: url(${resolvePath ("./button.svg")});

    display: flex;
    align-items: center;
    justify-content: center;
}



.logo-wrapper {
    width: 80%;
    height: 50%;

    filter: drop-shadow(-1px -1px 0px rgba(255, 255, 255, 0.06)) drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.5));
}

#power-led {
    position: absolute;
    left: 110px;
    top: 20px;
}

#knob-rate {
    position: absolute;
    top: 8px;
}

#knob-depth {
    position: absolute;
    top: 8px;
    left: 111px;
}

#knob-wave {
    position: absolute;
    left: 66px;
    top: 78px;
}

#stomp-switch {
    position: absolute;
    left: 7px;
    bottom: 8px;
}

.led {
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;
    width: 10px;
    height: 10px;

    box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.4);
}

.led-reflection {
    border-radius: 50%;

    clip-path: path("M6.00001 1.66622C5.54611 1.4185 5.02548 1.27771 4.47196 1.27771C2.70782 1.27771 1.2777 2.70783 1.2777 4.47196C1.2777 5.02548 1.41849 5.5461 1.6662 6C0.673474 5.45819 0 4.40487 0 3.19425C0 1.43012 1.43012 0 3.19425 0C4.40488 0 5.45821 0.673483 6.00001 1.66622Z");

    background: rgba(255, 255, 255, 0.5);
    width: 6px;
    height: 6px;
}

.led-on {
    background: rgba(255, 0, 0, 1.0);
}

.led-off {
    background: rgba(255, 0, 0, 0.5);
}
</style>

<div class="enclosure-svg">
    <div class="slot-offset">
        <div id="power-led" class="led led-off">
            <div class="led-reflection"></div>
        </div>
        <div class="controls">
        <input type="date">
            <div id="knob-rate" class="big-knob-svg"></div>
            <div id="knob-depth" class="big-knob-svg"></div>
            <div id="knob-wave" class="smaller-knob-svg"></div>
        </div>
        <div id="stomp-switch" class="rectangular-button-svg">
            <div class="logo-wrapper">
                <div class="logo"></div>
            </div>
        </div>
    </div>
</div>
    `;

}


// bad rotary
function makesPseudoRotary(element) {
    element.addEventListener('mousedown', (e) => {
    startY = e.clientY;
    startRotation = rotation;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

function onMouseMove(e) {
    const delta = e.clientY - startY;
    rotation = startRotation - delta; // invert if needed
    element.style.transform = `rotate(${rotation}deg)`;
}

function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}
}

/**
 * Create multiple knobs from a config array
 * Each knob config can contain:
 * - name: string, used for id
 * - parameter: Parameter object with min, max, initialValue, callbacks
 * - position: { left: number, top: number }
 * - size: { width: number, height: number } optional
 * - backgroundImagePath: string optional
 */
export function createKnobs(knobConfigs) {
    const knobs = [];

    for (const cfg of knobConfigs) {
        const skd = {};
        skd.elm = document.createElement("div");
        skd.elm.id = cfg.name;
        skd.elm.style.position = "absolute";
        skd.elm.style.left = (cfg.position?.left ?? 0) + "px";
        skd.elm.style.top = (cfg.position?.top ?? 0) + "px";
        skd.elm.style.width = (cfg.size?.width ?? 70) + "px";
        skd.elm.style.height = (cfg.size?.height ?? 70) + "px";
        skd.elm.style.backgroundImage = cfg.backgroundImagePath 
            ? `url('${resolvePath(cfg.backgroundImagePath)}')`
            : '';
        skd.elm.style.backgroundRepeat = "no-repeat";
        // make it rotatable
        if (cfg.parameter) {
            skd.update = makeRotatable({
                element: skd.elm,
                initialValue: cfg.parameter.initialValue,
                min: cfg.parameter.min,
                max: cfg.parameter.max,
                maxRotation: cfg.maxRotation ?? 140,
                controlled: cfg.controlled ?? true,
                onBeginEdit: cfg.parameter.onBeginEdit,
                onEdit: cfg.parameter.onEdit,
                onEndEdit: cfg.parameter.onEndEdit,
            });
        }

        knobs.push(skd);
    }

    return knobs;
}




export function createBackground(cfg) {
    const bg = document.createElement("div");

    // size with fallback
    bg.style.width = (cfg.width ?? 300) + "px";
    bg.style.height = (cfg.height ?? 500) + "px";

    // background image if provided
    bg.style.backgroundImage = cfg.image ? `url('${resolvePath(cfg.image)}')` : "";
    bg.style.backgroundSize = "cover";
    bg.style.backgroundRepeat = "no-repeat";

    // absolute positioning in container
    bg.style.position = "absolute";
    bg.style.top = "0";
    bg.style.left = "0";
    bg.style.zIndex = "0"; // ensure it's behind knobs

    return bg;
}
    
