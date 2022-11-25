

class WebGlText {
    constructor(HTMLCanvas) {
        this._targetCanvas = HTMLCanvas;
        this._canvasContext = this._targetCanvas.getContext("2d");
        this.TextString = "";
        this.Font = "arial";
        this.FontSize = 30;

        this.textAlign = "center";
        this.textBaseLine = "middle";
        this.fillStyle = "#333333";


    }

    _testDraw() {
        this._canvasContext.fillStyle = this.fillStyle;
        this._canvasContext.textAlign = this.textAlign;
        this._canvasContext.textBaseLine = this.textBaseLine;
        this._canvasContext.font = this.FontSize + "px arial";

        this._canvasContext.fillText("Hello",
            this._targetCanvas.width /2,
            this._targetCanvas.height/2);
    }
}

let testText = new WebGlText(document.getElementById("TextCanvas"));
testText._testDraw();