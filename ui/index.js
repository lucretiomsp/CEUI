// modification of index.js from the Tremolo patch of Cmajor github examples
// import { createView } from "./stompbox/minimalView.js";
import { createBackground, createSmallKnobDiv , createFaderDiv } from "./assets/viewHelper.js";

import { knobConfigs} from "./uiConfig.js";

import { bgConfig} from "./uiConfig.js";

import { faderConfigs} from "./uiConfig.js";



export default function createPatchView (patchConnection)
{
    const container = document.createElement ("div");
    
    const clear = () => container.innerHTML = "";

    patchConnection.addStatusListener ((status) =>
    {
        clear();

        const toParameter = (endpointIDToFind) => {
            const endpointInfo = status?.details?.inputs?.find(
                ({ endpointID }) => endpointID === endpointIDToFind
            );

            const { endpointID } = endpointInfo;

            return {
                min: endpointInfo?.annotation?.min,
                max: endpointInfo?.annotation?.max,
                initialValue: endpointInfo?.annotation?.init,
                onBeginEdit: () =>
                    patchConnection.sendParameterGestureStart(endpointID),
                onEdit: (nextValue) =>
                    patchConnection.sendEventOrValue(endpointID, nextValue),
                onEndEdit: () =>
                    patchConnection.sendParameterGestureEnd(endpointID),
                subscribe: (listener) => {
                    patchConnection.addParameterListener(endpointID, listener);
                    patchConnection.requestParameterValue(endpointID);
                    return () =>
                        patchConnection.removeParameterListener(
                            endpointID,
                            listener
                        );
                },
            };
        };

      
// add Background


// loop over knobConfigs
const  background = createBackground(bgConfig);
container.appendChild(background);

    

        knobConfigs.forEach((cfg) => {
            const param = toParameter(cfg.endpointID);

            const skd = createSmallKnobDiv(param, {
                left: cfg.left,
                top: cfg.top,
                width: cfg.width,
                height: cfg.height,
                image: cfg.image,
            });

            container.appendChild(skd.elm);

            // subscribe knob to backend updates
            param.subscribe(skd.update);
        });
      
    faderConfigs.forEach((cfg) => {
    const param = toParameter(cfg.endpointID);

    const fdr = createFaderDiv(param, {
        left: cfg.left,
        top: cfg.top,
        width: cfg.width,
        height: cfg.height,
        bgimage: cfg.bgimage,
        bgthumb: cfg.bgthumb,
        isHorizontal: cfg.isHorizontal,
    });

    container.appendChild(fdr.elm);

    // subscribe fader to backend updates
    param.subscribe(fdr.update);
});

    });

    patchConnection.requestStatusUpdate();

    return container;
}

