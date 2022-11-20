
attribute vec4 aVertexPosition;

uniform mat4 WorldMatrix;
uniform mat4 ViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
    gl_Position = uProjectionMatrix * ViewMatrix * WorldMatrix * aVertexPosition;
}