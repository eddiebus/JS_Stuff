precision mediump float;
varying vec4 vColour;

void main() {
    if (vColour.a <= 0.1){
        gl_FragColor = vColour;
        gl_FragColor.a = 0;
    }
    else
    {
        gl_FragColor = vColour;
    }
}