precision mediump float;
varying vec4 vColour;

void main() {
    gl_FragColor = vColour;
    gl_FragColor.a = 0;
}