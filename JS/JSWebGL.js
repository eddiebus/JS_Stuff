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


class WebGlContext {
    constructor(HTMLCanvas) {
        this._canvasContext = HTMLCanvas.getContext("webgl");
        this._canvas = HTMLCanvas;


        if (this._canvasContext === null) {
            console.log("WebGL error: Failed to get Canvas Context");
            return;
        } else {
            this._canvasContext.clearColor(0.0, 0.0, 0.0, 1.0);
            this._canvasContext.clear(this._canvasContext.COLOR_BUFFER_BIT);

            console.log("WebGl Context Init Success");
        }
    }

    // Clear canvas to solid color
    clear(newColour = new WebGlVector4(0,0,0,1)) {
        this._canvasContext.clearColor(newColour.x, newColour.y, newColour.z, newColour.w);
        this._canvasContext.clearDepth(1.0);
        this._canvasContext.enable(this._canvasContext.DEPTH_TEST);
        this._canvasContext.depthFunc(this._canvasContext.LESS);

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


}


class JSWebGLShaderProgram {
    constructor(WebGlContext) {
        this._parentContext = WebGlContext._canvasContext;
        this._shaderProgram = this._parentContext.createProgram();
        this.vShaderCode = `
           attribute vec3 coordinates; 
        
           void main(void) { 
              gl_Position = vec4(coordinates, 1.0); 
           }
        `

        this.fragShaderCode = `
        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
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
                vertexPosition: this._parentContext.getAttribLocation(this._shaderProgram, 'coordinates')

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

    setVertexBuffer(vBuffer) {
        this._parentContext.bindBuffer(this._parentContext.ARRAY_BUFFER, vBuffer);

        this._parentContext.vertexAttribPointer(
            this._shaderInputLayout.attribLocations.vertexPosition,
            2,
            this._parentContext.FLOAT,
            false,
            0,
            0
        );

        this._parentContext.enableVertexAttribArray(this._shaderInputLayout.attribLocations.vertexPosition);
    }

    draw(vertexCount, offset = 0) {
        this._parentContext.drawArrays(this._parentContext.TRIANGLE_STRIP, offset, vertexCount);
    }


}

class JSWebGlCamera {
    constructor(WebGlContext) {
        this._parentContext = WebGlContext._canvasContext;
        this._parentCanvas = this._parentContext.canvas;

        this.fov = 45 * Math.PI / 180;
        this.aspectRatio = this._parentContext.canvas.clientWidth / this._parentContext.canvas.clientHeight;
        this.zNear = 0;
        this.zFar = 100.0;
        this._projectionMatrix = mat4.create();
        this._viewMatrix = mat4.create();

        this.pos = new WebGlVector3();
        this._updateMatrix();

    }

    // Update matrixs when values change
    _updateMatrix() {
        let cWidth = 10;
        let cHeight = 10;

        mat4.ortho(
            this._projectionMatrix,
            -cWidth,
            cWidth,
            -cHeight,
            cHeight,
            this.zNear,
            this.zFar
        );


        this._viewMatrix = mat4.create();

        mat4.translate(
            this._viewMatrix,
            this._viewMatrix,
            [this.pos.x, this.pos.y, this.pos.z]
        );

    }

    setPosition(webGlVector) {
        this.pos = webGlVector;
    }

    setToShader(WebGlShaderProgram) {
        WebGlShaderProgram.setViewMatrix(this._viewMatrix);
        WebGlShaderProgram.setProjectionMatrix(this._projectionMatrix);
    }
}

class JSWebGlTriangle {
    constructor(WebGlShader) {
        this._parentContext = WebGlShader._canvasContext;
        this._vertexBuffer = this._parentContext.createBuffer();
        this._indexBuffer = this._parentContext.createBuffer();

        let vertices = [
            -0.5, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
        ];

        let indices = [0, 1, 2];

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

        // unbind buffer, done for now
        this._parentContext.bindBuffer(this._parentContext.ARRAY_BUFFER, null);

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


    }

    draw(WebGlShaderProgram) {
        this._parentContext.bindBuffer(
            this._parentContext.ARRAY_BUFFER,
            this._vertexBuffer
        );

        this._parentContext.bindBuffer(
            this._parentContext.ELEMENT_ARRAY_BUFFER,
            this._indexBuffer
        )

        this._parentContext.vertexAttribPointer(
            WebGlShaderProgram._shaderInputLayout.attribLocations.vertexPosition,
            3,
            this._parentContext.FLOAT,
            false,
            0,
            0
        );

        this._parentContext.enableVertexAttribArray(WebGlShaderProgram._shaderInputLayout.attribLocations.vertexPosition);

        this._parentContext.drawElements(
            this._parentContext.TRIANGLES,
            this._indexCount,
            this._parentContext.UNSIGNED_SHORT, 0);
    }
}

class JSWebGlSquare {
    constructor(WebGlContext) {
        this._parentContext = WebGlContext._canvasContext;
        this.vertexBuffer = this._parentContext.createBuffer();
        this.modelMatrix = mat4.create();

        mat4.translate(
            this.modelMatrix,
            this.modelMatrix,
            [-0.0, 0.0, -10.0]
        );

        this._parentContext.bindBuffer(this._parentContext.ARRAY_BUFFER, this.vertexBuffer);
        const positions = [
            1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            -1.0, -1.0,
        ];

        this._parentContext.bufferData(
            this._parentContext.ARRAY_BUFFER,
            new Float32Array(positions),
            this._parentContext.STATIC_DRAW
        );
    }

    setToShader(WebGlShader) {
        WebGlShader.setVertexBuffer(this.vertexBuffer);
        WebGlShader.setWorldMatrix(this.modelMatrix);
    }
}

// Testing
let testCanvas = document.getElementById("Canvas");
testCanvas.addEventListener("click", (event) => {
    console.log(`Clicked = ${event}`);
    event.target.requestFullscreen();
})
let MyWebGlContext = new WebGlContext(testCanvas);


let myShaderProgram = new JSWebGLShaderProgram(MyWebGlContext);
let myCamera = new JSWebGlCamera(MyWebGlContext);
let myTri = new JSWebGlTriangle(MyWebGlContext);


function loop() {
    console.log("!!!");
    MyWebGlContext.clear(new WebGlVector4(0,0.5,0,1));
    myShaderProgram.use();
    myTri.draw(myShaderProgram);


    window.requestAnimationFrame(() => {
        loop();
    })

}


loop()

