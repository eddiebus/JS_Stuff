precision highp float;

varying   vec4 vColour;
varying   vec2 vTextCoord;

uniform int toTexture;
uniform sampler2D vTexture;

void main() {
        if (toTexture <= 0){
            gl_FragColor = vec4(vColour.rgb * vColour.a, vColour.a);
        }
        else{
            vec4 cSample = texture2D(vTexture,vTextCoord);
            gl_FragColor = cSample;
        }
}
