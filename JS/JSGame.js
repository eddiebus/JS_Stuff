function GetVectorMagnitude(inputVector) {
    let result = 0;
    let vecSum = 0;
    for (let i = 0; i < inputVector.length; i++) {
        vecSum += Math.pow(inputVector[i], 2);
    }

    result = Math.sqrt(vecSum);
    return result;
}

function GetNormalisedVector(inputVector) {
    let returnVector = []
    let magnitude = GetVectorMagnitude(inputVector);

    for (let i = 0; i < inputVector.length; i++) {
        if (magnitude > 0) {
            returnVector.push(inputVector[i] / magnitude);
        } else {
            returnVector.push(0);
        }
    }

    return returnVector;
}

// Touch Input Object
class JSGameTouch {
    constructor(touchIndex, HTMLElement) {
        this.id = touchIndex;
        //HTML Element touch is bound to
        this._targetElement = HTMLElement;
        this._targetElementRect = this._targetElement.getBoundingClientRect();

        this.startPos = [0, 0]; //Start point of touch
        this._lastPos = [0, 0]; //Last point in previous frame
        this.endPos = [0, 0]; //End point of touch
        this.normalisedEndPog = [0, 0];
        this.distanceVector = [0, 0];
        this.dirVector = [0, 0]; //Direction vector of touch

        this.moveDelta = [0, 0];

        //Frames since touchStart/End Event
        this._Frames = 0;

        //Start/End/ifPress Flags
        this.Down = false;
        this.isPressed = false;
        this.Up = false;
        //Duration of touch
        this.duration = 0;

        window.addEventListener("touchstart", (event) => {
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

    //Check for ID match in touch event
    //Return: The touch object found else null
    _CheckSelfInTouchEvent(event) {
        let matchTouch = null;
        for (let i = 0; i < event.changedTouches.length; i++) {
            if (event.changedTouches[i].identifier == this.id) {
                matchTouch = event.changedTouches[i];
            }
        }

        return matchTouch;
    }

    _handleTouchStartEvent(event) {
        let myTouch = this._CheckSelfInTouchEvent(event);

        if (!myTouch) {
            return;
        } else {
            this._targetElementRect = this._targetElement.getBoundingClientRect();

            let x = myTouch.pageX - this._targetElementRect.left;
            x -= this._targetElementRect.width / 2;
            let y = this._targetElementRect.height - (myTouch.pageY - this._targetElementRect.top);
            y -= this._targetElementRect.height / 2;


            this.startPos = [x, y];
            this._lastPos = [x, y];
            this.endPos = [x, y];
            this.Down = true;
            this.isPressed = true;
            this._Frames = 0;
            this.distanceVector = [0, 0];
        }
    }

    _handleTouchMoveEvent(event) {
        //Check if this touch did move
        let myTouch = this._CheckSelfInTouchEvent(event);

        if (!myTouch) {
            return;
        } else {
            this._targetElementRect = this._targetElement.getBoundingClientRect();

            let x = myTouch.pageX - this._targetElementRect.left;
            x -= this._targetElementRect.width / 2;
            let y = this._targetElementRect.height - (myTouch.pageY - this._targetElementRect.top);
            y -= this._targetElementRect.height / 2;

            this.endPos = [x, y];

            this.moveDelta = [
                this.endPos[0] - this._lastPos[0],
                this.endPos[1] - this._lastPos[1]
            ]


            this.distanceVector = [
                this.endPos[0] - this.startPos[0],
                this.endPos[1] - this.startPos[1]
            ]

            this.dirVector = GetNormalisedVector(this.distanceVector);
            this._lastPos = this.endPos;
            this.isPressed = true;
        }
    }

    _handleTouchEndEvent(event) {
        //Check if this touch did end
        let myTouch = null;
        for (let i = 0; i < event.changedTouches.length; i++) {
            if (event.changedTouches[i].identifier == this.id) {
                myTouch = event.changedTouches[i];
            }
        }

        if (!myTouch) {
            return;
        }
        this.Up = true;
        this.Down = false;
        this.isPressed = false;
        this.moveDelta = [0, 0];
        this._Frames = 0;
    }

    // Reset events flags in object.
    _Reset() {
        this.moveDelta = [0, 0];
        this._Frames = 0;
        this.Down = false;
        if (this.Up) {
            this.duration = 0;
            this.Up = false;
            this.dirVector = [0, 0];
        }
    }

    _Tick() {
        //Check if flags must be reset
        if (this.isPressed | this.Up) {
            this.duration += Time.deltaTime;
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

//Touch input handler
//This is class is made per HTML Element
class JSGameTouchInput {
    constructor(HTMLElement) {
        this._targetElement = HTMLElement;
        this.touch = [];
        for (let i = 0; i < 10; i++) {
            this.touch.push(new JSGameTouch(i, this._targetElement));
        }
    }
}

// Mouse input handler
class JSGameMouseInput {
    constructor(HTMLElement) {
        this.pos = [0, 0];
        this._lastPos = [0, 0]
        this.moveDelta = [0, 0];
        this._targetElemet = HTMLElement;
        this.inFullscreen = false;
        this.locked = false;

        this._MoveFrames = 0;

        this._targetElemet.addEventListener("click", (event) => {
            this._lockMouse(event)
        })

        window.addEventListener("mousemove", (event) => {
            this._move(event)
        })

        window.requestAnimationFrame((time) => {
            this._Tick();
        })
    }

    _lockMouse(event) {
        if (this.locked) {
            event.target.requestPointerLock();
        }
    }

    _move(event) {
        let rect = this._targetElemet.getBoundingClientRect();

        let x = event.pageX - rect.left;
        let y = event.pageY - rect.top;
        if (x > rect.width) {
            x = rect.width;
        } else if (x < 0) {
            x = 0;
        }

        if (y > rect.height) {
            y = rect.height;
        } else if (y < 0) {
            y = 0;
        }


        this.pos = [x, rect.height - y];
        this.moveDelta = [event.movementX, -event.movementY];

    }

    _Tick() {
        let fsElement = document.fullscreenElement;
        if (fsElement == this._targetElemet) {
            this.inFullscreen = true;
        } else {
            this.inFullscreen = false;
        }

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

// Keyboard Key Object
class JSGameKey {
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

            window.addEventListener("keyup", (event) => {
                this._SetUp(event);
            })
        }
    }

    _SetDown(event) {
        if (event.key != this.value) {
            return;
        }
        this.Down = true;
        this.Press = true;
    }

    _SetUp(event) {
        if (event.key != this.value) {
            return;
        }
        this.Press = false;
        this.Down = false;
    }

    Tick() {
        if (this.Down) {
            this._Frames += 1;
        }

        if (this._Frames >= 2) {
            this.Down = false;
            this._Frames = 0;
        }
    }
}

// Keyboard Input Handler
class JSGameKeyInput {
    constructor() {
        this.Keys = []

        window.addEventListener("keydown", (event) => {
            if (!event.repeat) {
                this._AddKeyDownEvent(event);
            }
        })
        window.requestAnimationFrame(() => {
            this._Tick()
        });
    }

    GetKey(keyName) {
        let index = this._GetKeyIndex(keyName);
        if (index != null) {
            return this.Keys[index];
        } else {
            return new JSGameKey(null, false, false);
        }

    }

    DebugLogKeys() {
        console.log("Keys: ");
        for (let i = 0; i < this.Keys.length; i++) {
            console.log(this.Keys[i].value);
        }
    }

    _GetKeyIndex(keyString) {
        let returnIndex = -1;
        for (let i = 0; i < this.Keys.length; i++) {
            if (this.Keys[i].value == keyString) {
                returnIndex = i;
            }
        }

        if (returnIndex >= 0) {
            return returnIndex;
        } else {
            return null;
        }

    }

    _AddKeyDownEvent(keyEvent) {
        if (!this._GetKeyIndex(keyEvent.key)) {
            this.Keys.push(new JSGameKey(keyEvent.key, true, true));
        }
    }

    _Tick(deltaTime) {
        for (let i = 0; i < this.Keys.length; i++) {
            this.Keys[i].Tick();
        }

        window.requestAnimationFrame(() => {
            this._Tick()
        });

    }
}

