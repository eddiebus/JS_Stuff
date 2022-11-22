precision mediump float;
varying vec4 vColour;

void main() {
    if (vColour.a < 0.1){
        discard;
    }
    else
    {
        gl_FragColor.r = vColour.r;
        gl_FragColor.g = vColour.g;
        gl_FragColor.b = vColour.b;
    }
}