class WebGlText extends JSWebGlSquare {
    constructor(WebGlContext) {
        super(WebGlContext, [1, 1, 1, 1]);
        this._targetCanvas = document.createElement("canvas");


        // WebGl Objects
        this._TextCanvasTexture = new JSWebGlCanvasTexture(WebGlContext, this._targetCanvas);
        this._canvasContext = this._TextCanvasTexture.GetCanvasContext();
        this._targetCanvas = this._TextCanvasTexture.GetCanvas();

        this.properties = {
            style: {
                fontSize: 100,
                fontType: "arial",
                textAlign: "center",
                fontColour: "#ffffff"
            },
            strokeStyle: {
                width: 3,
                colour: [0, 0, 0, 0]
            },
            maxLength: 0,
            maxHeight: 0,
        }

        this.ExternalTexture = this._TextCanvasTexture;
    }

    // Set font using font face#
    // Refresh texture when font is loaded
    SetFontAsFontFace(newFontFace) {
        if (newFontFace.constructor.name == "FontFace") {
            newFontFace.load().then((result) => {
                this.properties.style.fontType = newFontFace.family;
                this.SetText(this.TextString);
            })
        }
    }

    // Get length of string with current properties
    _getRenderLength(string) {
        this._canvasContext.font = this.properties.style.fontSize + "px " + this.properties.style.fontType;
        this._canvasContext.textAlign = "left";
        this._canvasContext.textBaseline = "alphabetic";

        let measureMetric = this._canvasContext.measureText(string);
        let width = measureMetric.actualBoundingBoxLeft + measureMetric.actualBoundingBoxRight;

        return width;
    }

    // Splits string into words
    // Includes length of each split
    _splitIntoParts(string) {
        // Return list of words
        let returnList = []

        let currentWord = "";
        for (let char = 0; char < string.length; char++) {

            // Don't add new line char
            if (string[char] != "\n") {
                currentWord += string[char];
            }

            if (
                string[char] == " " ||
                string[char] == "."
            ) {
                returnList.push([currentWord, this._getRenderLength(currentWord)]);
                currentWord = "";
            }
            // If char is new line, add word then nl char
            else if (string[char] == "\n") {
                returnList.push([currentWord, this._getRenderLength(currentWord)]);
                returnList.push(["\n", this._getRenderLength("\n")]);
                currentWord = "";
            }
        }

        if (currentWord.length > 0) {
            returnList.push([currentWord, this._getRenderLength(currentWord)]);
            currentWord = "";
        }
        return returnList
    }

    // Set the target string and update texture
    SetText(string) {
        document.fonts.ready.then(() => {

            this.TextString = string;
            let splitList = this._splitIntoParts(string);

            let lines = [];

            let currentLine = "";
            let remainingLength = this.properties.maxLength;

            // There is no maxLength ( = 0)
            // String is one line (except \n)
            if (this.properties.maxLength <= 0) {
                for (let i = 0; i < splitList.length; i++) {
                    if (splitList[i][0] != "\n") {
                        currentLine += splitList[i][0];
                    } else {
                        lines.push(currentLine);
                        currentLine = "";
                    }
                }
                lines.push(currentLine);
            }
            // Max length is set. Set lines
            else {
                this._targetCanvas.width = this.properties.maxLength;
                for (let i = 0; i < splitList.length; i++) {
                    // No nl characters
                    if (splitList[i][0] != "\n") {
                        // Split can fit within remaining space?
                        if (splitList[i][1] <= remainingLength) {
                            currentLine += splitList[i][0]; //Add the word / split
                            // Subtract remaining space
                            remainingLength -= splitList[i][1]
                        }
                            // No? Can the word/split if on own line
                        // If so, make new line and repeat check
                        else if (splitList[i][1] <= this.properties.maxLength) {
                            lines.push(currentLine);
                            currentLine = "";
                            remainingLength = this.properties.maxLength;
                            i--; // Push loop index back (repeat check)
                        }
                            // No more space for split/word
                        // Try to fit by the character
                        else {

                            let splitString = splitList[i][0]

                            for (let char = 0; char < splitString.length; char++) {
                                // Get character length
                                let charLength = this._getRenderLength(splitString[char]);

                                // Can character fit?
                                if (charLength <= remainingLength) {
                                    currentLine += splitString[char]
                                    remainingLength -= charLength;
                                    // Character can't fit, make new line
                                } else {
                                    lines.push(currentLine)
                                    currentLine = "";
                                    remainingLength = this.properties.maxLength;

                                    // Infin loop avoid
                                    // Skip character if length boundary is too short
                                    if (charLength <= this.properties.maxLength) {
                                        char--;
                                    }
                                }
                            }
                        }
                    }

                    // \n char hit, add new line
                    else {
                        lines.push(currentLine);
                        currentLine = "";
                        remainingLength = this.properties.maxLength;
                    }

                }

                // Still some characters left. Push it on
                if (currentLine.length > 0) {
                    lines.push(currentLine);
                }
            }

            // Get the appropriate size of canvas
            let renderWidth = 0;
            let renderHeight = 0;

            // Render Width
            if (this.properties.maxLength == 0) {
                for (let i = 0; i < lines.length; i++) {
                    let width = this._getRenderLength(lines[i]);
                    if (width > renderWidth) {
                        renderWidth = width;
                    }
                }
            } else {
                renderWidth = this.properties.maxLength;
            }

            //Height
            renderHeight = this.properties.style.fontSize * lines.length;

            this._targetCanvas.width = renderWidth;
            this._targetCanvas.height = renderHeight;

            //Set wanted font styles/properties
            this._TextCanvasTexture.CanvasContext.clearRect(0, 0, renderWidth, renderHeight);
            this._TextCanvasTexture.CanvasContext.fillStyle = this.properties.style.fontColour;
            this._TextCanvasTexture.CanvasContext.textAlign = this.properties.style.textAlign;
            let size = this.properties.style.fontSize;
            let fontType = this.properties.style.fontType;

            this._TextCanvasTexture.CanvasContext.font = size + "px " + fontType;
            this._TextCanvasTexture.CanvasContext.textBaseline = "bottom";

            let lineY = size;
            for (let i = 0; i < lines.length; i++) {
                this._canvasContext.fillStyle = this.properties.style.fontColour;
                this._canvasContext.fillText(lines[i],
                    this._targetCanvas.width / 2,
                    lineY,
                    this._targetCanvas.width * 1
                );


                let strokeC = this.properties.strokeStyle.colour;
                let strokeW = this.properties.strokeStyle.width;

                // Only stroke/outline if there is a width
                if (strokeW > 0) {
                    this._canvasContext.strokeStyle = `rgba(
            ${strokeC[0] * 255},
            ${strokeC[1] * 255},
            ${strokeC[2] * 255},
            ${strokeC[3]}
            )`;
                    this._canvasContext.lineWidth = strokeW;
                    this._canvasContext.stroke();

                    this._canvasContext.strokeText(lines[i],
                        this._targetCanvas.width / 2,
                        lineY,
                        this._targetCanvas.width * 1
                    )

                    lineY += this.properties.style.fontSize;
                }
            }

            this._TextCanvasTexture.updateTexture();
        });
    }

}


// Testing
let testCanvas = document.getElementById("Canvas");
let testCanvas_MouseInput = new JSGameMouseInput(testCanvas);
testCanvas_MouseInput.locked = false;

let testCanvas_TouchInput = new JSGameTouchInput(testCanvas);
let MyWebGlContext = new WebGlContext(testCanvas);


MyWebGlContext.setCanFullScreen(true);
MyWebGlContext.resolutionScale = 1;

let myShaderProgram = new JSWebGLShaderProgram(MyWebGlContext);
let myCamera = new JSWebGlCamera(MyWebGlContext);
myCamera._getInverseMatrix();


let myImage = new JSWebGlImage(
    "https://is3-ssl.mzstatic.com/image/thumb/Purple111/v4/cd/7f/f0/cd7ff0df-cb1f-8d10-6c4a-9cde28f2c5a5/source/256x256bb.jpg"
);

let myTexture = new JSWebGlCanvasTexture(MyWebGlContext, document.createElement("canvas"));
myTexture.setAsImage(myImage, 1);


let mySquare = new JSWebGlSquare(MyWebGlContext, [1, 0, 0, 0.5]);
let mySquare2 = new JSWebGlSquare(MyWebGlContext, [1, 1, 1, 1]);
let myCircle = new JSWebGlCircle(MyWebGlContext, [0.5, 1.0, 0.5, 1]);

myCircle.setTexture(myTexture);

let touchSquare = new JSWebGlSquare(MyWebGlContext, [1, 1, 1, 0.2]);
let touchSquareMid = new JSWebGlSquare(MyWebGlContext, [1, 1, 1, 1]);

let rotationVector = new WebGlVector3(0, 0, 0);

let TestWebGlText = new WebGlText(MyWebGlContext);
let testString = "日本語で書けるのか？?このフォントで？";
TestWebGlText.properties.maxLength = testCanvas.width;
TestWebGlText.properties.style.fontSize = testCanvas.width * 0.15;
TestWebGlText.properties.strokeStyle.colour = [1, 0.4, 0, 1];
TestWebGlText.properties.strokeStyle.width = 2;
TestWebGlText.properties.style.fontType = "Dela_Gothic";




function loop() {
    TestWebGlText.SetText(testString);


    if (JSGameInput.GetKey("e").Press) {
        rotationVector.z += Time.deltaTime * 0.3;
    }

    if (MyWebGlContext.isFullscreen) {
        let speed = 2;
        let touchSpeed = 1;

        if (testCanvas_TouchInput.touch[0].isPressed) {
            let touchObj = testCanvas_TouchInput.touch[0];
            let touchDisVector = testCanvas_TouchInput.touch[0].distanceVector;
            let moveVector = [touchDisVector[0], touchDisVector[1]];
            let moveRange = 0.10;

            for (let i = 0; i < moveVector.length; i++) {
                let newValue = moveVector[i];
                if (moveVector[i] > moveRange) {
                    newValue = moveRange;
                } else if (moveVector[i] < -moveRange) {
                    newValue = -moveRange
                }

                newValue = newValue / moveRange;
                moveVector[i] = newValue;
            }

            mySquare.transform.position[0] += moveVector[0] * Time.deltaTime * touchSpeed;
            mySquare.transform.position[1] += moveVector[1] * Time.deltaTime * touchSpeed;

            mySquare2.transform.position[0] += moveVector[0] * Time.deltaTime * touchSpeed;
            mySquare2.transform.position[1] += moveVector[1] * Time.deltaTime * touchSpeed;

            let touchPos = [touchObj.endPos[0], touchObj.startPos[1]];
            let touchPosWorld = myCamera.screenToWorld(touchObj.startPos);

            touchSquare.transform.position = touchPosWorld;
            touchSquare.transform.position[2] = -2;

            touchSquareMid.transform.position = touchPosWorld;
            touchSquareMid.transform.position[2] = -1;

            console.log(
                myCamera.screenToWorld(touchObj.endPos)
            )
            console.log(
                mySquare2.transform.position
            )
        }

        if (testCanvas_TouchInput.touch[1].isPressed) {
            rotationVector.z += Time.deltaTime;
        }

        if (JSGameInput.GetKey("w").Press) {
            mySquare.transform.position[1] += Time.deltaTime * speed;
            mySquare2.transform.position[1] += Time.deltaTime * speed;
        } else if (JSGameInput.GetKey("s").Press) {
            mySquare.transform.position[1] -= Time.deltaTime * speed;
            mySquare2.transform.position[1] -= Time.deltaTime * speed;
        }

        if (JSGameInput.GetKey("a").Press) {
            mySquare.transform.position[0] -= Time.deltaTime * speed;
            mySquare2.transform.position[0] -= Time.deltaTime * speed;
        } else if (JSGameInput.GetKey("d").Press) {
            mySquare.transform.position[0] += Time.deltaTime * speed;
            mySquare2.transform.position[0] += Time.deltaTime * speed;
        }
    }

    MyWebGlContext.clear([0, 0.5, 1, 0.2]);

    myShaderProgram.use();
    mySquare.transform.rotation[2] = rotationVector.z;
    mySquare2.transform.rotation[2] = rotationVector.z;

    touchSquare.transform.scale = [200, 200, 200, 1];
    touchSquareMid.transform.scale = [50, 50, 50, 1];

    mySquare2.transform.scale = [testCanvas.width * 0.5, testCanvas.width * 0.5, 1, 0.5];
    mySquare.transform.scale = [testCanvas.width * 0.4, testCanvas.width * 0.4, 1, 0.5];
    mySquare2.transform.position[2] = -10
    mySquare.transform.position[2] = -5

    TestWebGlText.transform.position = [0, 0, -90];
    TestWebGlText.transform.scale = [testCanvas.width, 300, 1, 0];

    myCircle.transform.Copy(mySquare.transform);
    myCircle.transform.position[2] = -1;
    myCircle.transform.scale = [testCanvas.width * 0.4, testCanvas.width * 0.4, 1, 1];


    myCamera.Size = [testCanvas.width, testCanvas.height];
    myCamera.transform.position = [0, 0, -10];

    myCamera.setToShader(myShaderProgram);


    let rQueue = new JSWebGlRenderQueue();
    rQueue.SetObjects([myCircle, mySquare2, mySquare, TestWebGlText]);
    rQueue.Draw(myShaderProgram, myCamera);


    if (testCanvas_TouchInput.touch[0].isPressed) {
        touchSquareMid.draw(myShaderProgram);
        touchSquare.draw(myShaderProgram);
    }

    window.requestAnimationFrame(() => {
        loop();
    })
}

loop()