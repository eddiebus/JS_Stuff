class WebGlText {
    constructor(WebGlContext) {
        this.Transform = new TransForm();
        this._targetCanvas = document.createElement("canvas");
        this._parentContext = WebGlContext;
        this._canvasContext = this._targetCanvas.getContext("2d");
        this._TextTexture = new JSWebGlCanvasTexture(this._parentContext,this._targetCanvas);;
        this._RenderSquare = new JSWebGlSquare(WebGlContext,[1,1,1,0.8]);

        this.TextString = "";
        this.Font = "arial";
        this.FontSize = 100;
        this.textAlign = "center";
        this.fillStyle = "#ffffff";

        this.properties = {
            maxLength: 0,
            maxHeight: 0
        }
    }

    // Get length of string with current properties
    _getRenderLength(string) {
        this._canvasContext.font = this.FontSize + "px arial";
        this._canvasContext.textAlign = "left";
        this._canvasContext.textBaseline = "alphabetic";

        let measureMetric = this._canvasContext.measureText(string);
        let width = measureMetric.actualBoundingBoxLeft + measureMetric.actualBoundingBoxRight;

        return width;
    }

    // Splits string into words
    // Includes length of each in their render size
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
            else if (string[char] == "\n"){
                returnList.push([currentWord, this._getRenderLength(currentWord)]);
                returnList.push(["\n",this._getRenderLength("\n")]);
                currentWord = "";
            }
        }

        if (currentWord.length > 0) {
            returnList.push([currentWord, this._getRenderLength(currentWord)]);
            currentWord = "";
        }

        console.log(`Result list of function : ${returnList}`);
        return returnList
    }

    _setMultiLineText(string) {
        let splitList = this._splitIntoParts(string);

        let lines = [];

        let currentLine = "";
        let remainingLength = this.properties.maxLength;

        // There is no maxLength ( = 0)
        // String is one line (except \n)
        if (this.properties.maxLength <= 0) {
            for (let i = 0; i < splitList.length; i++) {
                if (splitList[i][0] != "\n"){
                    currentLine += splitList[i][0];
                }
                else{
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
                    else if (splitList[i][1] <= this.properties.maxLength){
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
                else{
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
                let width = this._getRenderLength(lines[i]) ;
                if (width > renderWidth) {
                    renderWidth = width;
                }
            }
        }
        else{
            renderWidth = this.properties.maxLength;
        }

        //Height
        renderHeight = this.FontSize * lines.length;

        this._targetCanvas.width = renderWidth;
        this._targetCanvas.height = renderHeight;

        //Set wanted font styles/properties
        this._canvasContext.fillStyle = this.fillStyle;
        this._canvasContext.textAlign = this.textAlign;
        this._canvasContext.font = this.FontSize + "px arial";
        this._canvasContext.textBaseline = "bottom";

        let lineY = this.FontSize;
        for (let i = 0; i < lines.length; i++){
            this._canvasContext.fillStyle = this.fillStyle;
            this._canvasContext.fillText(lines[i],
                this._targetCanvas.width / 2,
                lineY,
                this._targetCanvas.width * 0.95)
            ;
            lineY += this.FontSize;
        }

        this._TextTexture.updateTexture();
    }

    _setText(newString) {
        // Find basic text length
        // Uses default text properties as measureText() is affected by them
        this.TextString = newString;
        this._canvasContext.font = this.FontSize + "px arial";
        this._canvasContext.textAlign = "left";
        let textWidth = 0;

        let measureMetric = this._canvasContext.measureText(this.TextString);
        textWidth = measureMetric.actualBoundingBoxLeft + measureMetric.actualBoundingBoxRight;
        console.log(`Text width = ${textWidth}`);

        this._targetCanvas.width = textWidth * 2;

        this._canvasContext.fillStyle = this.fillStyle;
        this._canvasContext.textAlign = this.textAlign;
        this._canvasContext.font = this.FontSize + "px arial";
        this._canvasContext.textBaseline = "bottom";


        this._canvasContext.beginPath();
        this._canvasContext.fillStyle = "#aeffed";
        this._canvasContext.fillRect(0, 0, this._targetCanvas.width, this._targetCanvas.height);
        this._canvasContext.closePath();


        this._canvasContext.fillStyle = "#000000";
        this._canvasContext.fillText(this.TextString,
            this._targetCanvas.width / 2,
            0 + this.FontSize);

    }

    draw(WebGlShaderProgram){
        this._RenderSquare.setTexture(this._TextTexture);
        this._RenderSquare.transform = this.Transform;
        this._RenderSquare.draw(WebGlShaderProgram);
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

let mySquare = new JSWebGlSquare(MyWebGlContext,[1,0.5,0.5,1]);
let mySquare2 = new JSWebGlSquare(MyWebGlContext,[0,0,0,1]);
let TextSquare = new JSWebGlSquare(MyWebGlContext,[1,1,1,1]);
let myCircle = new JSWebGlCircle(MyWebGlContext, [0.5,1.0,0.5,1]);
let myTriangle = new JSWebGlTri(MyWebGlContext,[],[1,0,0,1]);

let touchSquare = new JSWebGlSquare(MyWebGlContext,[0,0,1,0.2]);
let touchSquareMid = new JSWebGlSquare(MyWebGlContext,[1,1,1,1]);

let rotationVector = new WebGlVector3(0,0,0);

let TestWebGlText = new WebGlText(MyWebGlContext);
let testString = "日本語でテクストを書けるのか？";
TestWebGlText.properties.maxLength = testCanvas.width;
TestWebGlText.FontSize = testCanvas.height * 0.1
TestWebGlText._setMultiLineText(testString);
TestWebGlText._setMultiLineText(testString);
TestWebGlText._setMultiLineText(testString);


function loop() {
    if (JSGameInput.GetKey("e").Press) {
        rotationVector.z += Time.deltaTime * 0.3;
    }

    if (MyWebGlContext.isFullscreen) {
        let speed = 2;
        let touchSpeed = 1;

        if (testCanvas_TouchInput.touch[0].isPressed) {
            let touchObj = testCanvas_TouchInput.touch[0];
            let touchDisVector = testCanvas_TouchInput.touch[0].distanceVector;
            let moveVector = [touchDisVector[0],touchDisVector[1]];
            let moveRange = 0.10;

            for (let i = 0; i < moveVector.length; i++) {
                let newValue = moveVector[i];
                if (moveVector[i] > moveRange){
                    newValue = moveRange;
                }
                else if (moveVector[i] < -moveRange){
                    newValue = -moveRange
                }

                newValue = newValue/moveRange;
                moveVector[i] = newValue;
            }

            mySquare.transform.position[0] += moveVector[0] * Time.deltaTime * touchSpeed;
            mySquare.transform.position[1] += moveVector[1] * Time.deltaTime * touchSpeed;

            mySquare2.transform.position[0] += moveVector[0] * Time.deltaTime * touchSpeed;
            mySquare2.transform.position[1] += moveVector[1] * Time.deltaTime * touchSpeed;

            let touchPos =  [touchObj.endPos[0],touchObj.startPos[1]];
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

    MyWebGlContext.clear([0,0.5,1,0]);

    myShaderProgram.use();
    mySquare.transform.rotation[2] = rotationVector.z;
    mySquare2.transform.rotation[2] = rotationVector.z;

    touchSquare.transform.scale = [200,200,200,1];
    touchSquareMid.transform.scale = [50,50,50,1];

    mySquare2.transform.scale = [200,200,1,1];
    mySquare.transform.scale = [150,150,1,1];
    mySquare2.transform.position[2] = -10
    mySquare.transform.position[2] = -5

    myTriangle.transform.Copy(mySquare.transform);
    myTriangle.transform.scale = [100,100,0,0];

    TestWebGlText.Transform.position = [0,0,-20];
    TestWebGlText.Transform.scale = [testCanvas.width,300,1,0];
    TextSquare.transform = TestWebGlText.Transform;

    myCircle.transform.position = [0,0,-15];
    myCircle.transform.scale = [400,400,1,0];

    myCamera.Size = [testCanvas.width,testCanvas.height];
    myCamera.transform.position = [0,0,-10];



    myCamera.setToShader(myShaderProgram);
    myCircle.draw(myShaderProgram);
    TextSquare.setTexture(TestWebGlText._TextTexture);
    TestWebGlText.draw(myShaderProgram);

    mySquare2.draw(myShaderProgram);
    mySquare.draw(myShaderProgram);
    myCircle.draw(myShaderProgram);
    //myTriangle.draw(myShaderProgram);


    if (testCanvas_TouchInput.touch[0].isPressed) {
        touchSquareMid.draw(myShaderProgram);
        touchSquare.draw(myShaderProgram);
    }

    window.requestAnimationFrame(() => {
        loop();
    })
}

loop()