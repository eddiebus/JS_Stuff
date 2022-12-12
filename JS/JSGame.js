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

            console.log(this.distanceVector);

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

    GetKey(keyName) {
        let index = this._GetKeyIndex(keyName);
        if (index != null) {
            return this._Keys[index];
        } else {
            return new JSGame_Key(null, false, false);
        }

    }

    DebugLogKeys() {
        console.log("Keys: ");
        for (let i = 0; i < this._Keys.length; i++) {
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

        if (returnIndex >= 0) {
            return returnIndex;
        } else {
            return null;
        }

    }

    _AddKeyDownEvent(keyEvent) {
        if (!this._GetKeyIndex(keyEvent.key)) {
            this._Keys.push(new JSGame_Key(keyEvent.key, true, true));
        }
    }

    _Tick(deltaTime) {
        for (let i = 0; i < this._Keys.length; i++) {
            this._Keys[i].Tick();
        }

        window.requestAnimationFrame(() => {
            this._Tick()
        });

    }
}

class JSGameObject {
    constructor(name = "NullObject") {
        this.transform = new TransForm(); //Transform of object
        this.name = name; //Name Of Object
        this.className = ""

        this.ParentObject = null;
        this.ChildObject = []; //Child Objects of this Object

    }

    Draw(JSWebGlCamera) {
    }

    //Get All Child Objects. Return  Array
    GetAllChildObjects() {

        let returnArray = []
        // Nodes to check
        let CurrentNodes = []
        CurrentNodes.push(...this.ChildObject);

        //While there's still nodes to check
        while (CurrentNodes.length > 0) {
            let nextToCheck = [];
            //Add current nodes to array
            returnArray.push(...CurrentNodes);

            // Check for more children nodes
            for (let i = 0; i < CurrentNodes.length; i++) {
                if (CurrentNodes[i].ChildObject.length > 0) {
                    nextToCheck.push(...CurrentNodes[i].ChildObject);
                }
            }
            CurrentNodes = [];
            CurrentNodes.push(...nextToCheck);
        }

        console.log(returnArray);

        return returnArray;
    }

    SetParent(otherObject) {

        if (otherObject != null) {
            if (otherObject.ParentObject == this) {
                throw "GameObject Error: Current Object is already parent to Object."
                return;
            }
        }

        if (this.ParentObject) {
            let matchIndex = -1
            for (let i = 0; i < this.ParentObject.ChildObject.length; i++) {
                if (this.ParentObject.ChildObject[i] == this) {
                    matchIndex = i;
                }
            }

            if (matchIndex >= 0) {
                this.ParentObject.ChildObject.splice(matchIndex, 1);
            }
            console.log("Removed Self From Class");
        }

        //Check if already exist
        if (otherObject != null) {
            if (otherObject.constructor.name == this.constructor.name) {
                let alreadyExist = false;
                for (let i = 0; i < otherObject.ChildObject.length; i++) {
                    if (otherObject.ChildObject[i] == otherObject) {
                        alreadyExist = true;
                    }

                }

                if (!alreadyExist) {
                    otherObject.ChildObject.push(this);
                    this.ParentObject = otherObject;
                    this.transform.parentTransform = otherObject.transform;
                    console.log("Object set to parent");
                }
            }
        }
        else{
            this.ParentObject = null;
            this.transform.parentTransform = null;
        }


    }
}



const JSGameInput = new JSGame_InputSystem();




// Testing
let testCanvas = document.getElementById("Canvas");
let testCanvas_MouseInput = new JSGameMouseInput(testCanvas);
testCanvas_MouseInput.locked = false;

let testCanvas_TouchInput = new JSGameTouchInput(testCanvas);

class MyPlane extends JSGameObject{
    constructor(JSWebContext, JSWebGlShader) {
        super("PlayerPlane");
        this.DrawTriangle = new JSWebGlTriangle(JSWebContext,JSWebGlShader,[1,0,0,1]);
        this.DrawTriangle.transform.SetParent(this.transform);
    }

    Draw(JSWebCamera){
        this.DrawTriangle.draw(JSWebCamera);
    }

    Tick(DeltaTime) {
        this.transform.rotation[2] += DeltaTime;
    }
}


let MyWebGlContext = new WebGlContext(testCanvas);

MyWebGlContext.setCanFullScreen(true);
MyWebGlContext.resolutionScale = 1;

let myShaderProgram = new JSWebGLShader(MyWebGlContext);
let myCamera = new JSWebGlOrthoCamera(MyWebGlContext);
myCamera._getInverseMatrix();

let UICam = new JSWebGlUICamera(MyWebGlContext);

let myImage = new JSWebGlImage(
    "https://is3-ssl.mzstatic.com/image/thumb/Purple111/v4/cd/7f/f0/cd7ff0df-cb1f-8d10-6c4a-9cde28f2c5a5/source/256x256bb.jpg"
);
let myImage2 = new JSWebGlImage(
    "https://pbs.twimg.com/profile_images/737359467742912512/t_pzvyZZ_400x400.jpg"
);

let myTexture = new JSWebGlCanvasTexture(MyWebGlContext, document.createElement("canvas"));
myTexture.setAsImage(myImage, 1);

let myTexture2 = new JSWebGlCanvasTexture(MyWebGlContext, document.createElement("canvas"));
myTexture2.setAsImage(myImage2,1);

let mySquare = new JSWebGlSquare(MyWebGlContext, myShaderProgram, [1, 0, 0, 0.5]);
let mySquare2 = new JSWebGlSquare(MyWebGlContext, myShaderProgram, [1, 1, 1, 1]);

let myCircle = new JSWebGlCircle(MyWebGlContext, myShaderProgram, [0.5, 1.0, 0.5, 1]);
myCircle.setTexture(myTexture);

let myTriangle = new JSWebGlTriangle(MyWebGlContext, myShaderProgram, [1, 1, 1, 1]);
myTriangle.setTexture(myTexture2);

let touchSquare = new JSWebGlSquare(MyWebGlContext, myShaderProgram, [0, 0, 0, 0.5]);
let touchSquareMid = new JSWebGlSquare(MyWebGlContext, myShaderProgram, [0, 1, 0, 0.2]);
let touchCircle = new JSWebGlCircle(MyWebGlContext, myShaderProgram, [0, 1, 0, 1]);


let rotationVector = new WebGlVector3(0, 0, 0);

let TestWebGlText = new WebGlText(MyWebGlContext, myShaderProgram);
let testString = "日本語で書けるのか？?このフォントで？";
TestWebGlText.properties.maxLength = testCanvas.width;
TestWebGlText.properties.style.fontSize = testCanvas.width * 0.15;
TestWebGlText.properties.strokeStyle.colour = [1, 0.4, 0, 1];
TestWebGlText.properties.strokeStyle.width = 2;
TestWebGlText.properties.style.fontType = "Dela_Gothic";

window.addEventListener("load", (event) => {
    console.log("Page Loaded");
})


let Object1 = new JSGameObject("Object1");
let Object2 = new JSGameObject("Object2");
let Object3 = new JSGameObject("Object3");

Object2.SetParent(Object1);
Object2.SetParent(Object1);
Object3.SetParent(Object2);

Object1.GetAllChildObjects();
Object2.GetAllChildObjects();


let PlayerPlane = new MyPlane(MyWebGlContext,myShaderProgram);

function loop() {
    TestWebGlText.SetText(testString);

    if (JSGameInput.GetKey("e").Press) {
        rotationVector.z += Time.deltaTime * 0.3;
    }

    if (MyWebGlContext.isFullscreen) {
        let speed = 2;
        let touchSpeed = 1;
        let joystickSize = (MyWebGlContext.getSize().width / 2) * 0.3;

        if (testCanvas_TouchInput.touch[0].isPressed) {
            let touchObj = testCanvas_TouchInput.touch[0];
            let touchDisVector = testCanvas_TouchInput.touch[0].distanceVector;
            let moveVector = [touchDisVector[0], touchDisVector[1]];

            let moveRange = joystickSize;

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

            touchSquare.transform.position = [touchObj.startPos[0], touchObj.startPos[1], 0];
            touchSquare.transform.scale = [joystickSize, joystickSize, 0];
            touchSquare.transform.position[2] = -20;

            touchSquareMid.transform.position = [touchObj.endPos[0], touchObj.endPos[1], 0];
            touchSquareMid.transform.scale = [joystickSize / 4, joystickSize / 4, 0];
            touchSquareMid.transform.position[2] = -10;
        }


        if (testCanvas_TouchInput.touch[1].isPressed) {
            rotationVector.z += Time.deltaTime;

            let touchObj = testCanvas_TouchInput.touch[1];
            touchCircle.transform.position = [touchObj.endPos[0], touchObj.endPos[1], -10];
            touchCircle.transform.scale = [joystickSize / 2, joystickSize / 2, 100];
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

    MyWebGlContext.clear([1, 1, 1, 1]);

    myShaderProgram.use();
    mySquare.transform.rotation[2] = rotationVector.z;
    mySquare2.transform.rotation[2] = rotationVector.z;


    mySquare2.transform.scale = [testCanvas.width * 0.5, testCanvas.width * 0.5, 1, 0.5];
    mySquare.transform.scale = [testCanvas.width * 0.4, testCanvas.width * 0.4, 1, 0.5];
    mySquare2.transform.position[2] = -10
    mySquare.transform.position[2] = -5

    TestWebGlText.transform.position = [0, 0, -90];
    TestWebGlText.transform.scale = [testCanvas.width, 300, 1, 0];

    myCircle.transform.Copy(mySquare.transform);

    myTriangle.transform.SetParent(mySquare.transform);
    myTriangle.transform.position = [0, 2, 1];

    myCircle.transform.position[2] = -4;
    myCircle.transform.scale = [testCanvas.width * 0.4, testCanvas.width * 0.4, 1, 1];

    myCamera.Size = [testCanvas.width, testCanvas.height];
    myCamera.transform.position = [0, 0, 10];

    myCamera.setToShader(myShaderProgram);


    let rQueue = new JSWebGlRenderQueue();
    rQueue.SetObjects([mySquare, mySquare2, myTriangle, TestWebGlText, myCircle]);
    rQueue.Draw(myCamera);


    let uiObj = [];

    MyWebGlContext.clearDepth();

    if (testCanvas_TouchInput.touch[0].isPressed) {
        uiObj.push(touchSquareMid, touchSquare);
    }

    if (testCanvas_TouchInput.touch[1].isPressed) {
        uiObj.push(touchCircle)
    }

    rQueue.SetObjects(uiObj);
    rQueue.Draw(UICam);

    PlayerPlane.transform.scale = [
        200,
        200,
        1
    ];

    PlayerPlane.Tick(Time.deltaTime/3);
    PlayerPlane.Draw(myCamera);


    window.requestAnimationFrame(() => {
        loop();
    })
}

loop()