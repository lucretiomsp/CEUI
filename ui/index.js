// import { createView } from "./stompbox/minimalView.js";
import { createBackground, createSmallKnobDiv } from "./stompbox/viewHelper.js";
import { makeRotatable } from "./stompbox/viewHelper.js";
import { knobConfigs} from "./knobConfigs.js";
// import knobConfigs from './knobConfigs.json' assert { type: 'json' };
import { bgConfig} from "./knobConfigs.js";

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
    



        // create knob bound to "rate" parameter
        // const rateParam = toParameter("rate");
        // const myKnob = createSmallKnobDiv(rateParam);
        // container.appendChild(myKnob.elm);

        // subscribe knob to parameter updates (UI follows DSP state)
        // rateParam.subscribe(myKnob.update);
    




    });

    patchConnection.requestStatusUpdate();

    return container;
}

