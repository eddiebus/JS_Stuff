class JSTime {
    constructor() {
        this._currentTime = 0;
        this._pastTime = 0;
        this.deltaTime = 0;

        this.Tick(0);
    }

    Tick(currentTime) {
        this._currentTime = currentTime;
        this.deltaTime = currentTime - this._pastTime;
        this._pastTime = currentTime

        window.requestAnimationFrame( (currentTime) =>{
            this.Tick(currentTime)
        });
    }
}

let Time = new JSTime();