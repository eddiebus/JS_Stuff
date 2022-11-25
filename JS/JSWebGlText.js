

class WebGlText {
    constructor(HTMLCanvas) {
        this._targetCanvas = HTMLCanvas;
        this._canvasContext = this._targetCanvas.getContext("2d");
        this.TextString = "";
        this.Font = "arial";
        this.FontSize = 30;
        this.textAlign = "center";
        this.fillStyle = "#333333";
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
            this._targetCanvas.width /2,
            0 + this.FontSize);

        console.log(this._targetCanvas.width);
    }
}

let testText = new WebGlText(document.getElementById("TextCanvas"));
testText._setText("日本語ででしょうね．なるほど");