class JSGameTouch {
    constructor(touchIndex,HTMLElement) {
        this.id = touchIndex;
        this._targetElement = HTMLElement;
        this.startPos = [0,0];
        this._lastPos = [0,0];
        this.endPos = [0,0];
        this.dirVector = [0,0];

        this.moveDelta = [0,0];
        this._Frames = 0;

        this.touchStart = false;
        this.isPressed = false;
        this.duration = 0;
        this.touchEnd = false;

        window.addEventListener("touchstart",(event) => {
            this._handleTouchStartEvent(event);
        })

        window.addEventListener("touchmove", (event) => {
            this._handleTouchMoveEvent(event)
        })

        window.addEventListener("touchend", (event) => {
            this._handleTouchEndEvent(event)
        })

        window.requestAnimationFrame((time) => {
            this._Tick();
        })
    }

    _handleTouchStartEvent(event){
        let myTouch = null;
        for (let i = 0; i < event.changedTouches.length;i++){
            if (event.changedTouches[i].identifier == this.id){
                myTouch = event.changedTouches[i];
            }
        }

        if (!myTouch) { return; }
        else{
            let rect = this._targetElement.getBoundingClientRect();

            let x = myTouch.pageX - rect.left;
            let y = myTouch.pageY - rect.top;

            if (x > rect.width) { x = rect.width; }
            else if (x < 0 ) { x = 0;}

            if (y > rect.height) { y = rect.height; }
            else if (y < 0 ) { y = 0;}

            y = rect.height - y;
            
            this.startPos = [x,y];
            this.endPos = [x,y];
            this.touchStart = true;
            this.isPressed = true;
            this._Frames = 0;
        }
    }

    _handleTouchMoveEvent(event) {
        //Check if this touch did move
        let myTouch = null;
        for (let i = 0; i < event.changedTouches.length;i++){
            if (event.changedTouches[i].identifier == this.id){
                myTouch = event.changedTouches[i];
            }
        }

        if (!myTouch) { return; }
        else{
            let rect = this._targetElement.getBoundingClientRect();

            let x = myTouch.pageX - rect.left;
            let y = myTouch.pageY - rect.top;

            if (x > rect.width) { x = rect.width; }
            else if (x < 0 ) { x = 0;}

            if (y > rect.height) { y = rect.height; }
            else if (y < 0 ) { y = 0;}

            y = rect.height - y;


            this.endPos = [x,y];

            this.moveDelta = [
                this.endPos[0] - this._lastPos[0],
                this.endPos[1] - this._lastPos[1]
            ]

            this.dirVector = [
                this.endPos[0] - this.startPos[0],
                this.endPos[1] - this.startPos[1]
            ]

            this._lastPos = this.endPos;

            this.isPressed = true;
            console.log(` Press= ${this.isPressed} |Move delta = ${this.moveDelta} | Dir delta = ${this.dirVector}`);
        }
    }

    _handleTouchEndEvent(event) {
        //Check if this touch did end
        let myTouch = null;
        for (let i = 0; i < event.changedTouches.length;i++){
            if (event.changedTouches[i].identifier == this.id){
                myTouch = event.changedTouches[i];
            }
        }

        if (!myTouch) { return;}
        this.touchEnd = true;
        this.touchStart = false;
        this.isPressed = false;
        this.moveDelta = [0,0];
        this._Frames = 0;
    }

    _Reset() {
        this.moveDelta = [0, 0];
        this._Frames = 0;
        this.touchStart = false;

        if (this.touchEnd) {
            this.touchEnd = false;
            this.dirVector = [0,0];
        }
    }

    _Tick() {

        if (this.isPressed | this.touchEnd) {
            this._Frames += 1;
            if (this._Frames >= 2) {
                this._Reset();
            }
        }



        window.requestAnimationFrame((time) => {
            this._Tick();
        })
    }
}

class JSGameTouchInput{
    constructor(HTMLElement) {
        this._targetElement = HTMLElement;
        this.touch =[];
        for (let i = 0; i < 10; i++){
            this.touch.push(new JSGameTouch(i,this._targetElement));
        }
    }
}

class JSGameMouseInput{
    constructor(HTMLElement) {
        this.pos = [0,0];
        this._lastPos = [0,0]
        this.moveDelta = [0,0];
        this._targetElemet = HTMLElement;
        this.inFullscreen = false;
        this.locked = false;

        this._MoveFrames = 0;

        this._targetElemet.addEventListener("click", (event) => {
            this._lockMouse(event)
        })

        window.addEventListener("mousemove",(event) => {
            this._move(event)
        })

        window.requestAnimationFrame((time) => {
            this._Tick();
        })
    }

    _lockMouse(event){
        if (this.locked) { event.target.requestPointerLock(); }
    }
    _move(event) {
        let rect = this._targetElemet.getBoundingClientRect();

        let x = event.pageX - rect.left;
        let y = event.pageY - rect.top;
        if (x > rect.width) { x = rect.width; }
        else if (x < 0 ) { x = 0;}

        if (y > rect.height) { y = rect.height; }
        else if (y < 0 ) { y = 0;}


        this.pos = [x, rect.height - y];
        this.moveDelta = [event.movementX,-event.movementY];

    }

    _Tick() {
        let fsElement = document.fullscreenElement;
        if (fsElement == this._targetElemet){ this.inFullscreen = true;}
        else {this.inFullscreen = false;}

        this._MoveFrames += 1;
        if (this._MoveFrames >= 2) {
            this._MoveFrames = 0;
            this.moveDelta = [0, 0];
        }

        this._lastPos = this.pos;

        window.requestAnimationFrame((time) => {
            this._Tick();
        })

    }

}

class JSGame_Key {
    constructor(KeyString, KeyDown, KeyPress) {
        this.value = KeyString;
        this.Down = KeyDown;
        this.Press = KeyPress;

        this._Frames = 0;

        if (KeyString != null) {
            window.addEventListener("keydown", (event) => {
                if (!event.repeat) {
                    this._SetDown(event);
                }
            })

            window.addEventListener("keyup",(event)=> {
                this._SetUp(event);
            })
        }
    }

    _SetDown(event){
        if (event.key != this.value) {return;}
        this.Down = true;
        this.Press = true;
    }

    _SetUp(event){
        if (event.key != this.value) {return;}
        this.Press = false;
        this.Down = false;
    }

    Tick(){
        if (this.Down) {
            this._Frames += 1;
        }

        if (this._Frames >= 2 ) {
            this.Down = false;
            this._Frames = 0;
        }
    }
}

class JSGame_InputSystem {
    constructor() {
        this._Keys = []

        window.addEventListener("keydown", (event) => {
            if (!event.repeat) {
                this._AddKeyDownEvent(event);
            }
        })
        window.requestAnimationFrame(() => {
            this._Tick()
        });
    }

    GetKey(keyName){
        let index = this._GetKeyIndex(keyName);
        if (index != null) {
            return this._Keys[index];
        }
        else
        {
            return new JSGame_Key(null,false,false);
        }

    }

    DebugLogKeys(){
        console.log("Keys: ");
        for (let i = 0; i < this._Keys.length; i++)
        {
            console.log(this._Keys[i].value);
        }
    }

    _GetKeyIndex(keyString) {
        let returnIndex = -1;
        for (let i = 0; i < this._Keys.length; i++) {
            if (this._Keys[i].value == keyString) {
                returnIndex = i;
            }
        }

        if (returnIndex >= 0){
            return returnIndex;
        }
        else{
            return null;
        }

    }

    _AddKeyDownEvent(keyEvent) {
        if (!this._GetKeyIndex(keyEvent.key)) {
            this._Keys.push(new JSGame_Key(keyEvent.key, true, true));
        }
    }

    _Tick(deltaTime) {
        for (let i = 0; i < this._Keys.length; i++)
        {
            this._Keys[i].Tick();
        }

        window.requestAnimationFrame(() => {
            this._Tick()
        });

    }
}

const JSGameInput = new JSGame_InputSystem();

