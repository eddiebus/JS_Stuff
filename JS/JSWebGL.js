
function DegToRadians(valueDeg){
    return valueDeg * Math.PI/180.0;
}

class WebGlVector3 {
    constructor(x = 0.0, y = 0.0, z = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}


class WebGlVector4 {
    constructor(x = 0.0, y = 0.0, z = 0.0, w = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}

class TransForm {
    constructor() {
        this.position = vec4.create();
        this.rotation = vec4.create();
        this.scale = vec4.create()
        for (let i = 0; i < 4;i++){
            this.scale[i] = 1;
        }
    }
    GetTransformMatrix() {


        let rotationDeg = vec4.create();
        rotationDeg[0] = DegToRadians(this.rotation[0]);
        rotationDeg[1] = DegToRadians(this.rotation[1]);
        rotationDeg[2] = DegToRadians(this.rotation[2]);

        let scaleMatrix = mat4.create();
        mat4.fromScaling(
            scaleMatrix,
            [this.scale[0],this.scale[1],this.scale[3]]
        );

        let translateMatrix = mat4.create();
        mat4.translate(
            translateMatrix,
            translateMatrix,
            [this.position[0],this.position[1],this.position[2]]
        );

        let xRotMatrix = mat4.create();

        mat4.fromXRotation(
            xRotMatrix,
            rotationDeg[0]
        );

        let yRotMatrix = mat4.create();
        mat4.fromYRotation(
            yRotMatrix,
            rotationDeg[1]
        );
        let zRotMatrix = mat4.create();
        mat4.fromZRotation(
            zRotMatrix,
            rotationDeg[2]
        );

        let rotationMatrix = mat4.create();

        mat4.multiply(
            rotationMatrix,
            xRotMatrix,
            yRotMatrix
        );

        mat4.multiply(
            rotationMatrix,
            rotationMatrix,
            zRotMatrix
        );

        let returnMatrix = mat4.create();

        mat4.multiply(
            returnMatrix,
            returnMatrix,
            translateMatrix
        );

        mat4.multiply(
            returnMatrix,
            returnMatrix,
            scaleMatrix
        );

        mat4.multiply(
            returnMatrix,
            returnMatrix,
            rotationMatrix
        );
        return returnMatrix;
    }
}

// WebGl Context is Linked to HTML Canas
class WebGlContext {
    constructor(HTMLCanvas) {
        this._canvasContext = HTMLCanvas.getContext("webgl", {
            premultipliedAlpha: false
        });
        this._canvas = HTMLCanvas;


        if (this._canvasContext === null) {
            console.log("WebGL error: Failed to get Canvas Context");
            return;
        } else {
            this._canvasContext.clearColor(0.0, 0.0, 0.0, 1.0);
            this._canvasContext.clear(this._canvasContext.COLOR_BUFFER_BIT);

            console.log("WebGl Context Init Success");
        }

        this._canFullScreen = true;
        this.isFullscreen = false;
        this._canvas.addEventListener("click", (event) => {
            if (this._canFullScreen) {
                event.target.requestFullscreen();
            }
        });
        this._canvas.addEventListener("fullscreenchange", (event) =>{
            this._updateSize();
        });
        this._canvas.addEventListener("resize", (event) =>{
            this._updateSize();
        })

        this._updateSize();

        window.requestAnimationFrame((time) => {
            this._Tick();
        })
    }


    _updateSize() {
        if (this.isFullscreen) {
            this._setResolution(screen.width,screen.height);
        }
        else {
            let clientRect = this._canvas.getBoundingClientRect();
            this._setResolution(clientRect.width,clientRect.height);
        }
    }

    _setResolution(width, height) {
        this._canvas.width = width;
        this._canvas.height = height;
        this._canvasContext.viewport(0, 0, width, height);
    }

    setCanFullScreen(bool) {
        this._canFullScreen = bool
    }

    // Clear canvas to solid color
    clear(newColour = new WebGlVector4(0, 0, 0, 1)) {
        this._canvasContext.clearColor(newColour.x, newColour.y,newColour.z,newColour.w);
        this._canvasContext.clearDepth(1);

        this._canvasContext.enable(this._canvasContext.BLEND);
        this._canvasContext.blendFunc(
            this._canvasContext.SRC_ALPHA,
            this._canvasContext.ONE_MINUS_SRC_ALPHA
        );

        this._canvasContext.enable(this._canvasContext.DEPTH_TEST);
        this._canvasContext.depthFunc(this._canvasContext.LESS)
        this._canvasContext.disable(this._canvasContext.CULL_FACE);


        // Clear canvas
        this._canvasContext.clear(this._canvasContext.COLOR_BUFFER_BIT|this._canvasContext.DEPTH_BUFFER_BIT);
    }

    createVertexShader(ShaderText) {
        let newShader = this._canvasContext.createShader(this._canvasContext.VERTEX_SHADER);
        this._canvasContext.shaderSource(newShader, ShaderText);
        this._canvasContext.compileShader(newShader);
        return newShader;
    }

    createFragmentShader(ShaderText) {
        let newShader = this._canvasContext.createShader(this._canvasContext.FRAGMENT_SHADER);
        this._canvasContext.shaderSource(newShader, ShaderText);
        this._canvasContext.compileShader(newShader);
        return newShader;
    }

    _Tick(){
        if (this._canvas == document.fullscreenElement){
            this.isFullscreen = true;
        }
        else { this.isFullscreen = false;}

        window.requestAnimationFrame((time) => {
            this._Tick();
        })
    }
}

//  Default shader program. Basic 2D graphics
class JSWebGLShaderProgram {
    constructor(WebGlContext) {
        this._parentContext = WebGlContext._canvasContext;
        this._shaderProgram = this._parentContext.createProgram();

        this.vShaderCode = `
attribute vec3 coordinates;
attribute vec4 colour;
varying  vec4 vColour;

uniform mat4 WorldMatrix;
uniform mat4 ViewMatrix;
uniform mat4 uProjectionMatrix;

void main(void) {
    gl_Position =   uProjectionMatrix * ViewMatrix * WorldMatrix *  vec4(coordinates, 1.0);
    vColour = colour;
}
        `
        this.fragShaderCode = `
precision mediump float;
varying vec4 vColour;

void main() {
        gl_FragColor = vec4(vColour.rgb * vColour.a, vColour.a);
}
`

        this.vShader = WebGlContext.createVertexShader(this.vShaderCode);
        this.fragShader = WebGlContext.createFragmentShader(this.fragShaderCode);

        this._parentContext.attachShader(this._shaderProgram, this.vShader);
        this._parentContext.attachShader(this._shaderProgram, this.fragShader);

        this._parentContext.linkProgram(this._shaderProgram);

        if (!this._parentContext.getProgramParameter(this._shaderProgram, this._parentContext.LINK_STATUS)) {
            let info = this._parentContext.getProgramInfoLog(this._shaderProgram);
            alert(`Unable to initialize the shader program: ${info}`);
            return null;
        }

        this._shaderInputLayout = {
            program: this._shaderProgram,
            attribLocations: {
                vertexPosition: this._parentContext.getAttribLocation(this._shaderProgram, 'coordinates'),
                colour: this._parentContext.getAttribLocation(this._shaderProgram, 'colour')
            },
            uniformLocations: {
                projectionMatrix: this._parentContext.getUniformLocation(this._shaderProgram, 'uProjectionMatrix'),
                viewMatrix: this._parentContext.getUniformLocation(this._shaderProgram, 'ViewMatrix'),
                worldMatrix: this._parentContext.getUniformLocation(this._shaderProgram, 'WorldMatrix')
            }
        }
    }

    // Use this shader for upcoming drawing tasks
    use() {
        this._parentContext.useProgram(this._shaderProgram);
    }

    setWorldMatrix(newMatrix) {
        this._parentContext.uniformMatrix4fv(
            this._shaderInputLayout.uniformLocations.worldMatrix,
            false,
            newMatrix
        );
    }

    setViewMatrix(newMatrix) {
        this._parentContext.uniformMatrix4fv(
            this._shaderInputLayout.uniformLocations.viewMatrix,
            false,
            newMatrix
        );
    }

    setProjectionMatrix(newMatrix) {
        this._parentContext.uniformMatrix4fv(
            this._shaderInputLayout.uniformLocations.projectionMatrix,
            false,
            newMatrix
        );
    }

    // Set Vertex and index Buffer
    setVertexIndexBuffer(vBuffer, indexBuffer){
        this._parentContext.bindBuffer(
            this._parentContext.ARRAY_BUFFER,
            vBuffer
        );
        this._parentContext.bindBuffer(
            this._parentContext.ELEMENT_ARRAY_BUFFER,
            indexBuffer
        );

        this._parentContext.vertexAttribPointer(
            this._shaderInputLayout.attribLocations.vertexPosition,
            3,
            this._parentContext.FLOAT,
            false,
            0,
            0
        );
        this._parentContext.enableVertexAttribArray(
            this._shaderInputLayout.attribLocations.vertexPosition
        );
    }
}

class JSWebGlCamera {
    constructor(WebGlContext) {
        this.transform = new TransForm();
        this.Size = [10,10];

        this._parentContext = WebGlContext._canvasContext;
        this._parentCanvas = this._parentContext.canvas;

        this.fov = 45 * Math.PI / 180;
        this.aspectRatio = this._parentContext.canvas.clientWidth / this._parentContext.canvas.clientHeight;
        this.zNear = 0.1;
        this.zFar = 100.0;
        this._projectionMatrix = mat4.create();
        this._viewMatrix = mat4.create();

        this.pos = new WebGlVector3();
        this._updateMatrix();
    }

    // Update matrix's when values change
    _updateMatrix() {
        let cWidth = this.Size[0];
        let cHeight = this.Size[1];

        mat4.ortho(
            this._projectionMatrix,
            -cWidth,
            cWidth,
            -cHeight,
            cHeight,
            this.zNear,
            this.zFar
        );
        this._viewMatrix = this.transform.GetTransformMatrix();
    }

    setPosition(webGlVector) {
        this.transform.position = webGlVector;
        this._updateMatrix();
    }

    setToShader(WebGlShaderProgram) {
        this._updateMatrix();
        WebGlShaderProgram.setViewMatrix(this._viewMatrix);
        WebGlShaderProgram.setProjectionMatrix(this._projectionMatrix);
    }
}

class JSWebGlSquare {
    // Create Square
    /*
    Input:
    WebGlContext - The context this shape is for
    c - A single colour  for this shape
     */
    constructor(WebGlContext,c) {
        this._parentContext = WebGlContext._canvasContext;
        this.transform = new TransForm();

        this._WorldMatrix = mat4.create();
        mat4.translate(
            this._WorldMatrix,
            this._WorldMatrix,
            [0.0, 0.0, 0.0]
        );

        this._vertexBuffer = this._parentContext.createBuffer();
        this._indexBuffer = this._parentContext.createBuffer();
        this._colourBuffer = this._parentContext.createBuffer();

        let vertices = [
            -1, 1, 0.0,
            1, 1, 0.0,
            -1, -1, 0.0,
            1, -1, 0.0,
        ];

        let indices = [0, 1, 2, 1, 2, 3];

        let colours = [
            c.x,c.y,c.z,c.w,
            c.x,c.y,c.z,c.w,
            c.x,c.y,c.z,c.w,
            c.x,c.y,c.z,c.w
        ];

        this._vCount = vertices.length;
        this._indexCount = indices.length;

        // write points to buffer
        this._parentContext.bindBuffer(
            this._parentContext.ARRAY_BUFFER,
            this._vertexBuffer
        );

        this._parentContext.bufferData(
            this._parentContext.ARRAY_BUFFER,
            new Float32Array(vertices),
            this._parentContext.STATIC_DRAW
        );

        this._parentContext.bindBuffer(this._parentContext.ARRAY_BUFFER, null);

        //write indicies to buffer
        this._parentContext.bindBuffer(
            this._parentContext.ELEMENT_ARRAY_BUFFER,
            this._indexBuffer
        );

        this._parentContext.bufferData(
            this._parentContext.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices),
            this._parentContext.STATIC_DRAW
        );

        this._parentContext.bindBuffer(
            this._parentContext.ELEMENT_ARRAY_BUFFER,
            null
        );


        //write colour points
        this._parentContext.bindBuffer(
            this._parentContext.ARRAY_BUFFER,
            this._colourBuffer
        );

        this._parentContext.bufferData(
            this._parentContext.ARRAY_BUFFER,
            new Float32Array(colours),
            this._parentContext.STATIC_DRAW
        );

        this._parentContext.bindBuffer(
            this._parentContext.ARRAY_BUFFER,
            null
        );
    }
    // Draw - Draw with given shader. Shader should be bound to same context
    draw(WebGlShaderProgram) {
        WebGlShaderProgram.setVertexIndexBuffer(this._vertexBuffer,this._indexBuffer);

        // Bind Colour
        this._parentContext.bindBuffer(
            this._parentContext.ARRAY_BUFFER,
            this._colourBuffer
        );

        this._parentContext.vertexAttribPointer(
            WebGlShaderProgram._shaderInputLayout.attribLocations.colour,
            4,
            this._parentContext.FLOAT,
            false,0,0
        );
        this._parentContext.enableVertexAttribArray(WebGlShaderProgram._shaderInputLayout.attribLocations.colour)

        WebGlShaderProgram.setWorldMatrix(this.transform.GetTransformMatrix());
        this._parentContext.drawElements(
            this._parentContext.TRIANGLES,
            this._indexCount,
            this._parentContext.UNSIGNED_SHORT, 0);
    }
}

// Testing
let testCanvas = document.getElementById("Canvas");
let testCanvas_MouseInput = new JSGameMouseInput(testCanvas);
testCanvas_MouseInput.locked = false;

let testCanvas_TouchInput = new JSGameTouchInput(testCanvas);
let MyWebGlContext = new WebGlContext(testCanvas);

let scale = 2;
MyWebGlContext.setCanFullScreen(true);

let myShaderProgram = new JSWebGLShaderProgram(MyWebGlContext);
let myCamera = new JSWebGlCamera(MyWebGlContext);
let mySquare = new JSWebGlSquare(MyWebGlContext,new WebGlVector4(1,0.5,0.5,1));
let mySquare2 = new JSWebGlSquare(MyWebGlContext,new WebGlVector4(1,1,1,1));


let rotationVector = new WebGlVector3(0,0,0);
let translateVector = new WebGlVector3();



function loop() {
    if (JSGameInput.GetKey("e").Press) {
        rotationVector.z += Time.deltaTime * 0.3;
    }

    if (MyWebGlContext.isFullscreen) {
        let speed = 1.5

        if (testCanvas_TouchInput.touch[0].isPressed) {
            mySquare.transform.position[0] += testCanvas_TouchInput.touch[0].dirVector[0] * Time.deltaTime / 100;
            mySquare.transform.position[1] += testCanvas_TouchInput.touch[0].dirVector[1] * Time.deltaTime / 100;

            mySquare2.transform.position[0] += testCanvas_TouchInput.touch[0].dirVector[0] * Time.deltaTime / 100;
            mySquare2.transform.position[1] += testCanvas_TouchInput.touch[0].dirVector[1] * Time.deltaTime / 100;
        }

        if (testCanvas_TouchInput.touch[1].isPressed){
            rotationVector.z += Time.deltaTime;
        }


        if (JSGameInput.GetKey("w").Press){
            mySquare.transform.position[1] += Time.deltaTime * speed;
            mySquare2.transform.position[1] += Time.deltaTime * speed;
        }
        else if (JSGameInput.GetKey("s").Press){
            mySquare.transform.position[1] -= Time.deltaTime * speed;
            mySquare2.transform.position[1] -= Time.deltaTime * speed;
        }

        if (JSGameInput.GetKey("a").Press){
            mySquare.transform.position[0] -= Time.deltaTime * speed;
            mySquare2.transform.position[0] -= Time.deltaTime * speed;
        }
        else if (JSGameInput.GetKey("d").Press){
            mySquare.transform.position[0] += Time.deltaTime * speed;
            mySquare2.transform.position[0] += Time.deltaTime * speed;
        }
    }


    MyWebGlContext.clear(new WebGlVector4(0,0,1,1));
    myShaderProgram.use();
    mySquare.transform.rotation[2] = rotationVector.z;
    mySquare2.transform.rotation[2] = rotationVector.z;
    mySquare2.transform.scale = [300,300,300,1];
    mySquare.transform.scale = [200,200,200,1];
    mySquare2.transform.position[2] = -10
    mySquare.transform.position[2] = -5


    myCamera.Size = [testCanvas.clientWidth,testCanvas.clientHeight];
    myCamera.transform.position = [0,0,-10];
    myCamera.setToShader(myShaderProgram);
    mySquare2.draw(myShaderProgram);
    mySquare.draw(myShaderProgram);
    window.requestAnimationFrame(() => {
        loop();
    })
}

loop()

