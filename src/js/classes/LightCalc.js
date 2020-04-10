export default class LightCalc{
    constructor(){

    }
    bb_spectrum(wavelength, CCT) {
        console.log("bb_spectrum:",wavelength,CCT)
        var wlm = wavelength * 1e-9;   /* Wavelength in meters */
    
        return (3.74183e-16 * Math.pow(wlm, -5.0)) / (Math.exp(1.4388e-2 / (wlm * CCT)) - 1.0);
    }        

    normalizeN(spec) {
        console.log("normalizeN:",spec)
        let max = Math.max.apply(null, spec);
        for (let k = 0; k < spec.length;k++) {
            spec[k] = spec[k] / max;
        }
        return spec;
    }    

    normalize(spec) {
        console.log("normalize:",spec)
        let max = Math.max.apply(null, spec);
        if(max > 0){
            for (let k = 0; k < spec.length;k++) {
                spec[k] = spec[k] / max;
            }
        }
        return spec;
    }  

    static xytohex(spec, x, y) {
        var XYZ = calcXYZ(spec);
        var y = 1.0;
        var x = XYZ[0] /XYZ[1] ;
        var z = XYZ[2] / XYZ[1];
        

        var R = 3.240479*(x) + -1.537150*y + -0.498535*(z);
        var G = -0.969256*(x) + 1.875992*y + 0.041556*(z);
        var B = 0.055648*(x) + -0.204043*y + 1.057311*(z);

        if (R < 0.0031308) {  R = R *12.92; } else {  R = 1.055*Math.pow(R,1/2.4)-0.055;}
        if (G < 0.0031308) {  G = G *12.92; } else {  G = 1.055*Math.pow(G,1/2.4)-0.055;}
        if (B < 0.0031308) {  B = B *12.92; } else {  B = 1.055*Math.pow(B,1/2.4)-0.055;}
    
        var R = R *255;
        var G = G *255;
        var B = B *255;
        
        if (R < 0) R = 0;
        if (G < 0) G = 0;
        if (B < 0) B = 0;
        
        if (R > 255) R = 255;
        if (G > 255) G = 255;
        if (B > 255) B = 255;
        
        return "rgb("+Math.round(R)+","+Math.round(G)+","+Math.round(B)+")";
    }
    static wltohex(wavelength){
        let Gamma = 0.80,
        IntensityMax = 255,
        factor, red, green, blue;
        if((wavelength >= 380) && (wavelength<440)){
            red = -(wavelength - 440) / (440 - 380);
            green = 0.0;
            blue = 1.0;
        }else if((wavelength >= 440) && (wavelength<490)){
            red = 0.0;
            green = (wavelength - 440) / (490 - 440);
            blue = 1.0;
        }else if((wavelength >= 490) && (wavelength<510)){
            red = 0.0;
            green = 1.0;
            blue = -(wavelength - 510) / (510 - 490);
        }else if((wavelength >= 510) && (wavelength<580)){
            red = (wavelength - 510) / (580 - 510);
            green = 1.0;
            blue = 0.0;
        }else if((wavelength >= 580) && (wavelength<645)){
            red = 1.0;
            green = -(wavelength - 645) / (645 - 580);
            blue = 0.0;
        }else if((wavelength >= 645) && (wavelength<781)){
            red = 1.0;
            green = 0.0;
            blue = 0.0;
        }else{
            red = 0.0;
            green = 0.0;
            blue = 0.0;
        };
        // Let the intensity fall off near the vision limits
        if((wavelength >= 380) && (wavelength<420)){
            factor = 0.3 + 0.7*(wavelength - 380) / (420 - 380);
        }else if((wavelength >= 420) && (wavelength<701)){
            factor = 1.0;
        }else if((wavelength >= 701) && (wavelength<781)){
            factor = 0.3 + 0.7*(780 - wavelength) / (780 - 700);
        }else{
            factor = 0.0;
        };
        if (red !== 0){
            red = Math.round(IntensityMax * Math.pow(red * factor, Gamma));
        }
        if (green !== 0){
            green = Math.round(IntensityMax * Math.pow(green * factor, Gamma));
        }
        if (blue !== 0){
            blue = Math.round(IntensityMax * Math.pow(blue * factor, Gamma));
        }
        return "rgb("+red+","+green+","+blue+")";
    }  
}