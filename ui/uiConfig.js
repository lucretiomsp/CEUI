// stompbox/knobConfigs.js


export const knobConfigs = [
  //  { name: "rate", endpointID: "rate", left: 50, top: 24, width: 70 , height: 70 , image: "./big-knob-flat.svg" },
    { name: "depth", endpointID: "depth", left: 180, top: 24, width: 70 , height: 70 , image: "./big-knob-flat.svg" },
    { name: "wave", endpointID: "shape", left: 120, top: 24, width: 50 , height: 50 , image: "./smaller-knob-flat.svg" },
];


export const  bgConfig = {
    image: "./enclosure.svg",
    width: 300,
    height: 500
};

// image is background image for the fader
export const faderConfigs = [
    { 
        name: "rate", 
        endpointID: "rate", 
        left: "50px", 
        top: "24px", 
        width: "140px", 
        height: "40px", 
        image: "./faderbg.png", 
        bgthumb: "./faderthumb.png", 
        isHorizontal: true 
    },
    { 
        name: "depth", 
        endpointID: "depth", 
        left: "180px", 
        top: "24px", 
        width: "40px", 
        height: "140px", 
        image: "./faderbg.png", 
        bgthumb: "./faderthumb.png", 
        isHorizontal: false 
    }
];


