class WebGlText {
    constructor(HTMLCanvas) {
        this._targetCanvas = HTMLCanvas;
        this._canvasContext = this._targetCanvas.getContext("2d");
        this.TextString = "";
        this.Font = "arial";
        this.FontSize = 100;
        this.textAlign = "center";
        this.fillStyle = "#333333";

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
                let width = this._getRenderLength(lines[i]);
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


        this._canvasContext.beginPath();
        this._canvasContext.fillStyle = "#aeffed";
        this._canvasContext.fillRect(0, 0, this._targetCanvas.width, this._targetCanvas.height);
        this._canvasContext.closePath();

        let lineY = this.FontSize;
        for (let i = 0; i < lines.length; i++){
            this._canvasContext.fillStyle = "#000000";
            this._canvasContext.fillText(lines[i],
                this._targetCanvas.width / 2,
                lineY)
            ;
            lineY += this.FontSize;
        }

        console.log(`Multiline Result: ${lines}`);

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

        console.log(this._targetCanvas.width);
    }
}

let testText = new WebGlText(document.getElementById("TextCanvas"));
let testString = "New Line Text\n" +
    "This text is in multi-line.\n" +
    "Does some of the text not fit\n" +
    "idek..\n" +
    "Here\n" +
    "Have\n" +
    "More\n" +
    "Lines\n" +
    "(Kinda mocking it)";
testText.properties.maxLength = 0;
testText._splitIntoParts(testString);
testText._setMultiLineText(testString);
