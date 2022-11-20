attribute vec3 coordinates;
attribute vec4 colour;
varying  vec4 vColour;

uniform mat4 WorldMatrix;
uniform mat4 ViewMatrix;
uniform mat4 uProjectionMatrix;

void main(void) {
    gl_Position =   WorldMatrix * vec4(coordinates, 1.0);
    vColour = colour;
}


