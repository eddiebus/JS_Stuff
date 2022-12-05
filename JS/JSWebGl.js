function DegToRadians(valueDeg) {
    return valueDeg * (Math.PI / 180.0);
}

class WebGlVector3 {
    constructor(x = 0.0, y = 0.0, z = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

function GetVectorMagnitude(inputVector) {
    let result = 0;
    let vecSum = 0;
    for (let i = 0; i < inputVector.length; i++) {
        vecSum += Math.pow(inputVector[i], 2);
    }

    result = Math.sqrt(vecSum);
    return result;
}

class TransForm {
    constructor() {
        this.position = vec4.create();
        this.rotation = vec4.create();
        this.scale = vec4.create()
        for (let i = 0; i < 4; i++) {
            this.scale[i] = 1;
        }
    }

    Copy(otherTransform) {
        if (otherTransform.constructor.name == this.constructor.name) {
            vec4.copy(this.position, otherTransform.position);
            vec4.copy(this.rotation, otherTransform.rotation);
            vec4.copy(this.scale, otherTransform.scale);
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
            [this.scale[0], this.scale[1], this.scale[2], 1]
        );

        let translateMatrix = mat4.create();
        mat4.translate(
            translateMatrix,
            translateMatrix,
            [this.position[0], this.position[1], this.position[2]]
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

// WebGl Context is Linked to HTML Canvas
class WebGlContext {
    constructor(HTMLCanvas, antiAlias = true) {
        this._canvasContext = HTMLCanvas.getContext("webgl2", {
            antialias: antiAlias,
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
        this.resolutionScale = 1;
        this._canvas.addEventListener("click", (event) => {
            if (this._canFullScreen) {
                event.target.requestFullscreen();
            }
        });
        this._canvas.addEventListener("fullscreenchange", (event) => {
            this._updateSize();
        });
        this._canvas.addEventListener("resize", (event) => {
            this._updateSize();
        })

        this._updateSize();

        window.requestAnimationFrame((time) => {
            this._Tick();
        })
    }

    _updateSize() {
        if (this.resolutionScale < 0.25) {
            this.resolutionScale = 0.25;
        }

        if (this.isFullscreen) {
            this._setResolution(screen.width * this.resolutionScale, screen.height * this.resolutionScale);
        } else {
            screen.orientation.unlock();

            let clientRect = this._canvas.getBoundingClientRect();
            this._setResolution(
                clientRect.width * this.resolutionScale,
                clientRect.height * this.resolutionScale);
        }
    }

    _setResolution(width, height) {
        this._canvas.width = Math.round(width);
        this._canvas.height = Math.round(height);
        this._canvasContext.viewport(0, 0, width, height);
    }

    setCanFullScreen(bool) {
        this._canFullScreen = bool
    }

    clearDepth(){
        this._canvasContext.clearDepth(1);
    }
    // Clear canvas to solid color
    clear(newColour = [0, 0, 0, 1]) {
        this._canvasContext.clearColor(newColour[0], newColour[1], newColour[2], newColour[3]);
        this._canvasContext.clearDepth(1);

        this._canvasContext.enable(this._canvasContext.BLEND);
        this._canvasContext.blendFunc(
            this._canvasContext.SRC_ALPHA,
            this._canvasContext.ONE_MINUS_SRC_ALPHA
        );

        this._canvasContext.enable(this._canvasContext.DEPTH_TEST);
        this._canvasContext.depthFunc(this._canvasContext.LEQUAL);
        this._canvasContext.disable(this._canvasContext.CULL_FACE);


        // Clear canvas
        this._canvasContext.clear(this._canvasContext.COLOR_BUFFER_BIT | this._canvasContext.DEPTH_BUFFER_BIT);
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

    _Tick() {
        if (this._canvas == document.fullscreenElement) {
            this.isFullscreen = true;
        } else {
            this.isFullscreen = false;
        }

        this._updateSize();
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
attribute vec2 texCoord;

varying   vec4 vColour;
varying   vec2 vTextCoord;

uniform mat4 WorldMatrix;
uniform mat4 ViewMatrix;
uniform mat4 uProjectionMatrix;

void main(void) {
    gl_Position =   uProjectionMatrix * ViewMatrix * WorldMatrix *  vec4(coordinates, 1.0);
    vColour = colour;
    vTextCoord = texCoord;
}
        `
        this.fragShaderCode = `
precision mediump float;

varying   vec2 vTextCoord;

uniform int toTexture;
uniform sampler2D vTexture;

void main() {
        vec4 cSample = texture2D(vTexture,vTextCoord);
        gl_FragColor = cSample;
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
                textureCoord: this._parentContext.getAttribLocation(this._shaderProgram, 'texCoord')
            },
            uniformLocations: {
                projectionMatrix: this._parentContext.getUniformLocation(this._shaderProgram, 'uProjectionMatrix'),
                viewMatrix: this._parentContext.getUniformLocation(this._shaderProgram, 'ViewMatrix'),
                worldMatrix: this._parentContext.getUniformLocation(this._shaderProgram, 'WorldMatrix'),
                toTexture: this._parentContext.getUniformLocation(this._shaderProgram, 'toTexture'),
                Texture: this._parentContext.getUniformLocation(this._shaderProgram, 'vTexture')
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

    setTexturing(intBool) {
        this._parentContext.uniform1i(this._shaderInputLayout.uniformLocations.toTexture, intBool);
    }

    // Set Vertex and index Buffer
    setVertexIndexBuffer(vBuffer, indexBuffer) {
        this._parentContext.bindBuffer(
            this._parentContext.ELEMENT_ARRAY_BUFFER,
            indexBuffer
        );

        this._parentContext.bindBuffer(
            this._parentContext.ARRAY_BUFFER,
            vBuffer
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

class JSWebGlImage {

    constructor(urlSource) {
        this.imgElement = document.createElement("img");
        this.LoadFailed = false;
        this.Complete = false;

        this.imgElement.addEventListener("load", (event) => {
            this.Complete = true;
            this.LoadFailed = false;
        })
        this.imgElement.addEventListener("error", (event) => {
            this.Complete = true;
            this.LoadFailed = true;
        })
        this.imgElement.crossOrigin = "anonymous"
        this.imgElement.src = urlSource;

        this.LoadPromise = new Promise((resolve, reject) => {
            this.imgElement.onload = resolve;
            this.imgElement.onerror = reject;
        });

        this.GetLoadPromise();
    }

    async GetLoadPromise(){
        return this.LoadPromise;
    }
}

class JSWebGlCanvasTexture {
    constructor(WebGlContext, HTMLCanvas = null) {
        this._parentContext = WebGlContext;

        // Check if link to existing canvas
        // Else ake new canvas
        if (HTMLCanvas) {
            this._canvas = HTMLCanvas;
        }

        else { this._canvas = document.createElement("canvas")}
        this.CanvasContext = this._canvas.getContext("2d");
        this._canvas.width = 100;
        this._canvas.height = 100;
        this.Texture = this._parentContext._canvasContext.createTexture();

        this.updateTexture();
    }

    clear(colour = [0, 0, 0, 0]) {
        this.CanvasContext.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this.CanvasContext.fillStyle = `rgba(
        ${colour[0] * 255},
        ${colour[1] * 255},
        ${colour[2] * 255},
        ${colour[3]}
        )`;
        this.CanvasContext.fillRect(0, 0, this._canvas.width, this._canvas.height);
        this.updateTexture();
    }

    setAsImage(JSWebGlImage,opacity = 1) {
        if (JSWebGlImage.imgElement != null) {
            JSWebGlImage.GetLoadPromise().then(()=>{
                if (JSWebGlImage.LoadFailed) {
                    return;
                }
                let width = JSWebGlImage.imgElement.width;
                let height = JSWebGlImage.imgElement.height;
                this._canvas.width = width;
                this._canvas.height = height;

                this.CanvasContext.clearRect(0, 0, width, height);
                this.CanvasContext.globalAlpha = opacity;
                this.CanvasContext.drawImage(
                    JSWebGlImage.imgElement,0,0,
                    width,height);

                this.updateTexture();
            })

        }
    }

    updateTexture() {
        this._parentContext._canvasContext.bindTexture(this._parentContext._canvasContext.TEXTURE_2D, this.Texture);

        this._parentContext._canvasContext.texImage2D(
            this._parentContext._canvasContext.TEXTURE_2D,
            0, //level
            this._parentContext._canvasContext.RGBA, //internal Format
            this._parentContext._canvasContext.RGBA, //format (ignore this)
            this._parentContext._canvasContext.UNSIGNED_BYTE, //Type
            this._canvas //Pixel Source
        );

        this._parentContext._canvasContext.texParameteri(
            this._parentContext._canvasContext.TEXTURE_2D,
            this._parentContext._canvasContext.TEXTURE_MIN_FILTER,
            this._parentContext._canvasContext.LINEAR)

        //Prevent texture wrapping

        // S - coord
        this._parentContext._canvasContext.texParameteri(
            this._parentContext._canvasContext.TEXTURE_2D,
            this._parentContext._canvasContext.TEXTURE_WRAP_S,
            this._parentContext._canvasContext.CLAMP_TO_EDGE
        );

        // T - coord
        this._parentContext._canvasContext.texParameteri(
            this._parentContext._canvasContext.TEXTURE_2D,
            this._parentContext._canvasContext.TEXTURE_WRAP_T,
            this._parentContext._canvasContext.CLAMP_TO_EDGE
        );

        // Done Texture Work, Unbind texture
        this._parentContext._canvasContext.bindTexture(this._parentContext._canvasContext.TEXTURE_2D, null);
    }

    GetCanvasContext(){
        return this.CanvasContext;
    }
    GetCanvas(){
        return this._canvas;
    }
}

// 2D Camera Class
class JSWebGlCamera {
    constructor(WebGlContext) {
        this.transform = new TransForm();
        this.Size = [10, 10];

        this._parentContext = WebGlContext._canvasContext;

        this.fov = 45 * Math.PI / 180;
        this.aspectRatio = this._parentContext.canvas.clientWidth / this._parentContext.canvas.clientHeight;
        this.zNear = 0.1;
        this.zFar = 100.0;
        this._projectionMatrix = mat4.create();
        this._viewMatrix = mat4.create();

        this._updateMatrix();
    }

    GetViewMatrix(){
        this._updateMatrix();

        let returnMatrix = mat4.create();

        mat4.multiply(
            returnMatrix,
            this._viewMatrix,
            this._projectionMatrix
        );

        return returnMatrix;
    }
    _getInverseMatrix() {
        this._updateMatrix();

        let _invertProjMatrix = mat4.create();
        let _invertViewMatrix = mat4.create();
        let returnMatrix = mat4.create();

        mat4.invert(
            _invertProjMatrix,
            this._projectionMatrix
        );

        mat4.invert(
            _invertProjMatrix,
            this._projectionMatrix
        );

        mat4.multiply(
            returnMatrix,
            _invertViewMatrix,
            _invertProjMatrix
        );

        return returnMatrix;
    }

    screenToWorld(screenPoint) {
        let returnVector = vec4.create();
        let iMatrix = this._getInverseMatrix();
        vec4.transformMat4(
            returnVector,
            [
                screenPoint[0],
                screenPoint[1],
                0,
                0
            ],
            this._getInverseMatrix()
        );

        return returnVector;
    }

    // Update matrices (case base value changed)
    _updateMatrix() {
        let cWidth = Math.round(this.Size[0]);
        let cHeight = Math.round(this.Size[1]);

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

    setToShader(WebGlShaderProgram) {
        this._updateMatrix();
        WebGlShaderProgram.setViewMatrix(this._viewMatrix);
        WebGlShaderProgram.setProjectionMatrix(this._projectionMatrix);
    }
}

class JSWebGlMesh{
    constructor(WebGlContext) {
        this._parentContext = WebGlContext._canvasContext;
        this.Texture = new JSWebGlCanvasTexture(WebGlContext);
        this.ExternalTexture = null;
        this.transform = new TransForm();

        this._vertexBuffer = this._parentContext.createBuffer();
        this._indexBuffer = this._parentContext.createBuffer();
        this._texCoordBuffer = this._parentContext.createBuffer();

        this.polyCount = 0;
        this.indexCount = 0;
        this.RenderMethod = this._parentContext.TRIANGLES;
    }

    // Set vertex buffer for this mesh
    _setVertexBuffer(vertexArray){

        // write points to buffer
        this._parentContext.bindBuffer(
            this._parentContext.ARRAY_BUFFER,
            this._vertexBuffer
        );

        this._parentContext.bufferData(
            this._parentContext.ARRAY_BUFFER,
            new Float32Array(vertexArray),
            this._parentContext.STATIC_DRAW
        );

        this._parentContext.bindBuffer(this._parentContext.ARRAY_BUFFER, null);

        this.polyCount = vertexArray.length/3;
    }

    _setTextureCoords(textCoordArray){
        // write texCoords
        this._parentContext.bindBuffer(
            this._parentContext.ARRAY_BUFFER,
            this._texCoordBuffer
        );

        this._parentContext.bufferData(
            this._parentContext.ARRAY_BUFFER,
            new Float32Array(textCoordArray),
            this._parentContext.STATIC_DRAW
        );

        this._parentContext.bindBuffer(
            this._parentContext.ARRAY_BUFFER,
            null
        );
    }

    _setIndexBuffer(indexArray){
        //write indicies to buffer
        this._parentContext.bindBuffer(
            this._parentContext.ELEMENT_ARRAY_BUFFER,
            this._indexBuffer
        );

        this._parentContext.bufferData(
            this._parentContext.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indexArray),
            this._parentContext.STATIC_DRAW
        );

        this._parentContext.bindBuffer(
            this._parentContext.ELEMENT_ARRAY_BUFFER,
            null
        );
    }

    setTexture(Texture){
        this.ExternalTexture = Texture;
    }

    draw(WebGlShaderProgram){
        WebGlShaderProgram.setVertexIndexBuffer(this._vertexBuffer, this._indexBuffer);

        // Bind Tex Coord
        this._parentContext.bindBuffer(
            this._parentContext.ARRAY_BUFFER,
            this._texCoordBuffer
        );
        this._parentContext.vertexAttribPointer(
            WebGlShaderProgram._shaderInputLayout.attribLocations.textureCoord,
            2,
            this._parentContext.FLOAT,
            false, 0, 0
        );
        this._parentContext.enableVertexAttribArray(
            WebGlShaderProgram._shaderInputLayout.attribLocations.textureCoord
        );

        WebGlShaderProgram.setWorldMatrix(this.transform.GetTransformMatrix());

        if (this.ExternalTexture) {
            this._parentContext.activeTexture(this._parentContext.TEXTURE0);

            this._parentContext.bindTexture(this._parentContext.TEXTURE_2D, this.ExternalTexture.Texture);

            this._parentContext.uniform1i(WebGlShaderProgram._shaderInputLayout.uniformLocations.Texture, 0);
        } else {
            this._parentContext.activeTexture(this._parentContext.TEXTURE0);

            this._parentContext.bindTexture(this._parentContext.TEXTURE_2D, this.Texture.Texture);

            this._parentContext.uniform1i(WebGlShaderProgram._shaderInputLayout.uniformLocations.Texture, 0);
        }

        if (this.RenderMethod == WebGlShaderProgram._parentContext.TRIANGLES) {
            this._parentContext.drawElements(
                this._parentContext.TRIANGLES,
                this.indexCount,
                this._parentContext.UNSIGNED_SHORT, 0);
        }
        else if (this.RenderMethod == WebGlShaderProgram._parentContext.TRIANGLE_FAN) {
            this._parentContext.drawArrays(
                this._parentContext.TRIANGLE_FAN,
                0,
                this.polyCount
            );
        }
    }
}

class JSWebGlCircle extends JSWebGlMesh {
    constructor(WebGlContext, colour, sections = 100) {
        super(WebGlContext);
        this.RenderMethod = this._parentContext.TRIANGLE_FAN;

        let vertices = [];
        let textureCoord = [];
        let vColours = [];
        let indices = [];

        this.sections = sections; //How many sections of the circle
        // How large are the sections

        // Add center point
        vertices.push(0);
        vertices.push(0);
        vertices.push(0);

        // Add center texture position
        textureCoord.push(0.5);
        textureCoord.push(0.5);

        vColours.push(colour[0]);
        vColours.push(colour[1]);
        vColours.push(colour[2]);
        vColours.push(colour[3]);

        // Add points around center
        // Add indecies
        for (let i = 0; i <= this.sections; i++) {
            let Angle = i * DegToRadians(360.0 / sections);

            let vertX = Math.cos(Angle) * 1;
            let vertY = Math.sin(Angle) * 1;
            // Start Angle + Extend
            vertices.push(vertX);
            vertices.push(vertY);
            vertices.push(0);

            let texX = 0.5 + (Math.cos(Angle) * 0.5);
            let texY = 0.5 + (Math.sin(-Angle) * 0.5); //Flip y texture pos

            textureCoord.push(texX);
            textureCoord.push(texY);

            vColours.push(colour[0]);
            vColours.push(colour[1]);
            vColours.push(colour[2]);
            vColours.push(colour[3]);

        }

        this.vCount = vertices.length;
        console.log(`This circle has ${this.vCount} vertices`);
        console.log(`This circle has ${sections} sections`);


        // Vertex points
        this._setVertexBuffer(vertices);

        this._setTextureCoords(textureCoord);

        this.Texture.clear([1, 1, 0, 1]);
    }
    setTexture(Texture) {
        this.ExternalTexture = Texture;
    }
}

class JSWebGlSquare extends JSWebGlMesh {
    //Input
    //WebGlContext - Parent context of this object
    //c - The colour of this square
    constructor(WebGlContext, colour = [1,1,1,1]) {
        super(WebGlContext);
        this.Colour = colour;

        let vertices = [
            -1.0, 1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
        ];

        let textureCoord = [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0
        ];

        let indices = [0, 1, 2, 1, 2, 3];

        this.polyCount = vertices.length/3;
        this.indexCount = indices.length;

        this._setVertexBuffer(vertices);
        this._setIndexBuffer(indices);
        this._setTextureCoords(textureCoord);
        this.Texture.clear(this.Colour);

        this.RenderMethod = this._parentContext.TRIANGLES;
    }

    setTexture(Texture) {
        this.ExternalTexture = Texture;
    }

    // Draw - Draw with given shader. Shader should be bound to same context
}

// Render Queue Class
// Sorts Objects in Z-order and draws them in said order
// All "Objects" must have a transform and "draw" method
class JSWebGlRenderQueue{
    constructor() {
        this.Objects = []
    }

    SetObjects(ObjectArray){
        for (let  i = 0; i < ObjectArray.length; i++)
        {
            let newItem = [ObjectArray[i],true]
            this.Objects.push( newItem) ;
        }
    }

    // Sort Objects and draw them in Z order
    Draw(WebGlShader,WebGlCamera){
        WebGlShader.use();
        WebGlCamera.setToShader(WebGlShader);
        // Find Z Depth
        for (let i = 0; i < this.Objects.length; i++) {
            let zDepth = 0;
            let camTransform = WebGlCamera.GetViewMatrix();

            let resultPos = vec4.create();

            vec4.transformMat4(
                resultPos,
                this.Objects[i][0].transform.position,
                camTransform
            );

            this.Objects[i][1] = resultPos[2];
        }

        for (let i = 0; i < this.Objects.length - 1; i++){
            let thisDepth = this.Objects[i][1];
            let thatDepth = this.Objects[i + 1][1];

            if (thisDepth < thatDepth){
                let tempObj = this.Objects[i];
                this.Objects[i] = this.Objects[i+1];
                this.Objects[i + 1 ] = tempObj;
                i = -1;
            }

        }


        WebGlShader.use()
        WebGlCamera.setToShader(WebGlShader);

        for (let i = 0; i < this.Objects.length; i++){
            this.Objects[i][0].draw(WebGlShader);
        }

    }
}



