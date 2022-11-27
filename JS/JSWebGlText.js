class WebGlText {
    constructor(HTMLCanvas) {
        this._targetCanvas = HTMLCanvas;
        this._canvasContext = this._targetCanvas.getContext("2d");
        this.TextString = "";
        this.Font = "arial";
        this.FontSize = 5;
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
            currentWord += string[char];
            if (
                string[char] == " " ||
                string[char] == "\n" ||
                string[char] == "."
            ) {
                returnList.push([currentWord, this._getRenderLength(currentWord)]);
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

        // There is no maxLength put string in one line
        if (this.properties.maxLength <= 0) {
            for (let i = 0; i < splitList.length; i++) {
                currentLine += splitList[i][0];
            }
            lines.push(currentLine);
        }
        // Max length is set. Find lines
        else {
            for (let i = 0; i < splitList.length; i++) {
                // Split can fit within line
                // If not skip
                if (splitList[i][1] <= remainingLength) {
                    currentLine += splitList[i][0]; //Add the word / split
                    remainingLength -= splitList[i][1] // Get remaining space
                }
                // No more space
                // Try character by character
                else {
                    let splitString = splitList[i][0]
                    for (let char = 0; char < splitString.length; char++) {
                        //find if only characters can fit
                        let charLength = this._getRenderLength(splitString[char]);
                        // Character can fit, add it on
                        if (charLength <= remainingLength) {
                            currentLine += splitString[char]
                            remainingLength -= charLength;
                        } else {
                            lines.push(currentLine)
                            currentLine = "";
                            remainingLength = this.properties.maxLength;
                            if (charLength <= this.properties.maxLength) {
                                char--;
                            }
                        }
                    }
                }

            }

            // Still some characters left. Push it on
            if (currentLine.length > 0) {
                lines.push(currentLine);
            }
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
let testString = "これはテストの分です。";
testText.properties.maxLength = 7;
testText._splitIntoParts(testString);
testText._setMultiLineText(testString);
