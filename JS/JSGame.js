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

class JSGameCollider {
    constructor(ParentTransform, MatterJSBody, IsStatic = true) {
        this.TransformTarget = ParentTransform;
        this.Tansform = new Transform();
        this.Static = IsStatic;
        this.Body = null;
        this.Body = MatterJSBody;
        if (this.Body) {
            Matter.Body.setPosition(this.Body, {x: 0, y: 0});
        }

    }

    SetTransform(newTransform){
        if (newTransform instanceof Transform){
            this.Tansform = newTransform;
        }
    }

    Check(OtherCollider,Transform) {
        function BodyToScale(Body,Transform){
            let sizeScale = 2;
            let sizeX = Transform.scale[0] * sizeScale;
            let sizeY = Transform.scale[0] * sizeScale;
            Matter.Body.scale(Body,
                sizeX,
                sizeY
            );

            Matter.Body.setPosition(
                Body,
                {
                    x: Transform.position[0],
                    y: Transform.position[1]
                }
            )

            Matter.Body.setAngle(Body,
                DegToRadians(Transform.rotation[2])
            );
        }
        function ResetBodyScale(Body,Transform){
            let sizeScale = 2;
            let sizeX = Transform.scale[0] * sizeScale;
            let sizeY = Transform.scale[0] * sizeScale;
            Matter.Body.scale(Body,
                1/sizeX,
                1/sizeY
            );

            Matter.Body.setPosition(
                Body,
                {
                    x: 0,
                    y: 0
                }
            )

            Matter.Body.setAngle(Body,
                0);
        }

        if (!OtherCollider instanceof JSGameCollider) {
            return;
        }
        this.#SetBodyToWorldSize();
        OtherCollider.#SetBodyToWorldSize();

        let CollisionEvent = Matter.Query.collides(this.Body, [OtherCollider.Body]);

        this.#ResetBodyFromWorldSize();
        OtherCollider.#ResetBodyFromWorldSize();

        if (CollisionEvent.length > 0) {
            return CollisionEvent[0];
        } else {
            return null;
        }
    }

    //Set Body to World size based on transform
    //Used by Check function
    #SetBodyToWorldSize(){
        let sizeScale = 2;
        let sizeX = this.TransformTarget.scale[0] * sizeScale;
        let sizeY = this.TransformTarget.scale[0] * sizeScale;
        Matter.Body.scale(this.Body,
            sizeX,
            sizeY
            );

        Matter.Body.setPosition(
            this.Body,
            {
                x: this.TransformTarget.position[0],
                y: this.TransformTarget.position[1]
            }
        )

        Matter.Body.setAngle(this.Body,
            DegToRadians(this.TransformTarget.rotation[2])
        );
    }

    //Reset Body after it is set to world size
    //Since Body Scale Function does not reset.
    #ResetBodyFromWorldSize(){
        let sizeScale = 2;
        let sizeX = this.TransformTarget.scale[0] * sizeScale;
        let sizeY = this.TransformTarget.scale[0] * sizeScale;
        Matter.Body.scale(this.Body,
            1/sizeX,
            1/sizeY
        );

        Matter.Body.setPosition(
            this.Body,
            {
                x: 0,
                y: 0
            }
        )

        Matter.Body.setAngle(this.Body,
            0);
    }
}

class JSGameBoxCollider extends JSGameCollider{
    constructor(ParentTransform,SizeVector = [1,1],IsStatic = true) {
        super(ParentTransform,Matter.Bodies.rectangle(0,0,SizeVector[0],SizeVector[1]),IsStatic);
    }
}

class JSGameCircleCollider extends JSGameCollider{
    constructor(
        ParentTransform,Radius = 0.5,IsStatic = true
    ) {
        super(ParentTransform,Matter.Bodies.circle(
            0,0,
            Radius
        ),IsStatic);
    }
}

class JSGameObject {
    //Collision Events
    #CollisionEnterObj = []
    #CollisionStayObj = []
    #CollisionExitObj = []
    #SceneList = null;

    constructor(name = "NullObject", options = {
        LayerName: "DefaultLayer",
    }) {
        this.transform = new Transform(); //Transform of object
        this.name = name; //Name Of Object

        this.LayerName = "DefaultLayer";
        if (options.LayerName) {
            this.LayerName = options.LayerName;
        }

        this.ParentObject = null;
        this.ChildObject = []; //Child Objects of this Object
        this.Collider = null;
        this.LayerCollideIgnore = [] //Layers to Ignore Collision
        this.#SceneList = null;

        this.#GenerateCollisionEvents();
    }

    Tick(DeltaTime) {
    }

    #UpdateColliderBody(){
        if (this.Collider){
            this.Collider.TransformTarget = this.transform;
        }
    }

    SetCollisionBody(newBody){
        if (newBody instanceof JSGameCollider) {
            this.Collider = newBody;
        }
    }

    CollisionCheck(otherObject) {
        if (!otherObject instanceof JSGameObject) {
            return;
        }
        if (!this.Collider || !otherObject.Collider) {
            return;
        }


        let ColEvent = this.Collider.Check(otherObject.Collider);
        if (ColEvent != null) {
            //console.log(`Hit! ${ColEvent.collided}`);
        }
    }

    #GenerateCollisionEvents(){
        function AddColEvent(Object,CollResult){
            if (CollResult){
                //Add to Enter or Stay
            }
        }
        let ObjectList = this.SceneList;
        for (let obj in ObjectList){
            if (this != ObjectList[obj]){
                this.CollisionCheck(ObjectList[obj]);
            }
        }

        window.requestAnimationFrame(()=>{this.#GenerateCollisionEvents()});
    }

    Draw(JSWebGlCamera) {
    }

    FindObjectsOfType(ObjectType) {
        let ResultArray = [];
        let AllObjects = this.SceneList;
        for (let i = 0; i < AllObjects.length; i++) {
            if (AllObjects[i] instanceof ObjectType) {
                ResultArray.push(AllObjects[i]);
            }
        }
        return ResultArray;
    }

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
            CurrentNodes.push(...nextToCheck); //Move to next to check nodes
        }

        return returnArray;
    }

    GetRootObject(){
        let root = this;
        while (root.ParentObject){
            root = root.ParentObject;
        }
        return root;
    }

    #RemoveSelfFromScene(){
        if (!this.SceneList) { return;}
        let index = this.FindObjSceneIndex(this);
        if (index != null){
            this.SceneList.splice(index,1);
            this.SetSceneList(null);
        }

        for (let obj in this.ChildObject){
            // Remove Child Objects from scene
            this.ChildObject[obj].#RemoveSelfFromScene();
        }
    }

    #RemoveSelfFromParent() {
        if (this.ParentObject) {
            let ChildList = this.ParentObject.ChildObject

            let matchIndex = null;
            // Look for self in parent. Remove when found.
            for (let i = 0; i < ChildList.length; i++) {
                if (this == ChildList[i]) {
                    ChildList.splice(i, 1); // Remove Self From List
                    this.ParentObject = null;
                    this.transform.parentTransform = null;
                    return;
                }
            }
        }
    }

    SetParent(otherObject) {
        if (otherObject != null && !otherObject instanceof  JSGameObject){
            return;
        }
        if (otherObject != null) {
            if (otherObject.ParentObject == this) {
                throw "GameObject Error: This Object is already parent to other GameObject"
                return;
            }
        }

        //Check if already exist
        if (otherObject != null) {
            if (otherObject instanceof JSGameObject) {
                let alreadyExist = false;
                for (let i = 0; i < otherObject.ChildObject.length; i++) {
                    if (otherObject.ChildObject[i] == otherObject) {
                        alreadyExist = true;
                        break;
                    }
                }
                // Have Space
                // Add self as child object
                if (!alreadyExist) {
                    this.#RemoveSelfFromParent();
                    this.#RemoveSelfFromScene();

                    otherObject.ChildObject.push(this);
                    this.ParentObject = otherObject;
                    this.transform.parentTransform = otherObject.transform;

                    // Put self in same scene as parent.
                    let rootObj = this.GetRootObject();
                    this.AddToSceneList(rootObj.SceneList);
                }
            }
        // Set Parent to Nothign/Null
        } else {
            this.#RemoveSelfFromParent();
        }
    }

    AddToSceneList(NewList){
        if (this.SceneList == NewList){
            return;
        }
        else{
            NewList.push(this);
            this.SceneList = NewList;
        }
    }

    // Set The Scene List
    SetSceneList(newList){
        this.SceneList = newList;

        if (this.FindObjSceneIndex(this) == null){
            this.SceneList = [];
        }
    }

    // Find Object in Scene List
    // Returns Index Pos
    FindObjSceneIndex(TargetObj){
        if (!this.SceneList){ return; }
        for (let i = 0; i < this.SceneList.length; i++) {
            if (this.SceneList[i] == TargetObj){
                return i;
            }
        }
        return null;
    }

    Spawn(NewObj){
        NewObj.AddToSceneList(this.SceneList);
    }

    Destroy(Obj){
        this.#RemoveSelfFromScene();
    }
}

class JSGameScene extends JSGameObject {
    constructor() {
        super("Scene", {
            Root: true,
            LayerID: 0
        });

        this.SceneList = []
    }

    Add(GameObj){
        //Check if object already exists in scene
        function SearchForObj(target,List){

            for (let i = 0; i < List.length;i++){
                if (List[i] == target){
                    return i;
                }
            }

            return null;
        }
        if (GameObj instanceof JSGameObject ){
            GameObj.AddToSceneList(this.SceneList);
        }
    }

    #SearchObjInScene(obj) {
        for (let i = 0; i < this.SceneList.length; i++){
            if (this.SceneList[i] == obj){
                return i;
            }
        }
        return null;
    }

    Tick() {
        let Objects = this.SceneList;
        for (let i = 0; i < Objects.length; i++) {
            Objects[i].Tick(Time.deltaTime);
        }

        this.#CollisionCheckObjs();
    }

    Draw(JSWebGlCamera) {
        MainWebGlContext.clear();
        let Objects = this.SceneList;
        Objects = this.SortObjectsByDepth(Objects);
        for (let i = 0; i < Objects.length; i++) {
            Objects[i].Draw(JSWebGlCamera);
        }
    }

    #CollisionCheckObjs() {
        let Objects = this.SceneList;
        for (let i = 0; i < Objects.length; i++) {
            for (let obj = 0; obj < Objects.length; obj++) {
                if (obj != i) {
                    //Objects[i].CollisionCheck(Objects[obj]);
                }
            }
        }

    }

    GroupObjectsByLayer() {
        let ResultArray = []
        let Objects = this.SceneList;
        for (let i = 0; i < Objects.length; i++) {
            let LayerMatchIndex = null;

            // Search if layer is already in list
            for (let Layer = 0; Layer < ResultArray.length; Layer++) {
                if (ResultArray[Layer][0] == Objects[i].LayerName) {
                    LayerMatchIndex = Layer;
                    break;
                }
            }

            // Layer not on list. Add Layer
            if (LayerMatchIndex == null) {
                ResultArray.push([
                    Objects[i].LayerName,
                    [Objects[i]]
                ])
            }
            // Layer on list. Push object to layer
            else {
                ResultArray[LayerMatchIndex][1].push(Objects[i])
            }
        }

        return ResultArray;
    }

    SortObjectsByDepth(JSWebGlCamera, ObjectList = this.SceneList) {
        if (!JSWebGlCamera) {
            console.warn("GameObject: SortObjectByDepth, no camera given");
            return [];
        }
        // Bubble Sort objects. Return array of them in order.
        // Furthest 1st
        let RArray = [...ObjectList];

        //Start Sorting
        for (let i = 0; i < RArray.length - 1; i++) {
            let thisPos = vec4.create();
            let thatPos = vec4.create();

            let camTransform = JSWebGlCamera.GetViewMatrix();
            vec4.transformMat4(
                thisPos,
                [...RArray[i].transform.position, 0],
                camTransform
            );


            vec4.transformMat4(
                thatPos,
                [...RArray[i + 1].transform.position, 0],
                camTransform
            );

            if (thisPos[2] < thatPos[2]) {
                let tempObj = RArray[i];
                RArray[i] = RArray[i + 1];
                RArray[i + 1] = tempObj;
                i = 0;
            }
        }
        return RArray;
    }
}

// Testing
let testCanvas = document.getElementById("Canvas");
let testCanvas_MouseInput = new JSGameMouseInput(testCanvas);
testCanvas_MouseInput.locked = false;

let TouchInput = new JSGameTouchInput(testCanvas);

let MainWebGlContext = new WebGlContext(testCanvas);
let MainShaderContext = new JSWebGLShader(MainWebGlContext);
let myCamera = new JSWebGlOrthoCamera(MainWebGlContext);

const GameShape = {
    Square : new JSWebGlSquare(MainWebGlContext),
    Triangle : new JSWebGlTriangle(MainWebGlContext),
    Circle : new JSWebGlCircle(MainWebGlContext)
}

const GameSprite ={
    Player : {
        Ship : new JSWebGlImage("GameAsset/Sprite/TestSprite.PNG")
    }
}

GameShape.Triangle.setShader(MainShaderContext);
GameShape.Circle.setShader(MainShaderContext);
GameShape.Square.setShader(MainShaderContext);

class PlayerPlane_Mesh extends JSWebGlTriangle {
    constructor() {
        let myImage = new JSWebGlImage(
            "https://is3-ssl.mzstatic.com/image/thumb/Purple111/v4/cd/7f/f0/cd7ff0df-cb1f-8d10-6c4a-9cde28f2c5a5/source/256x256bb.jpg"
        );
        let texture = new JSWebGlCanvasTexture(MainWebGlContext);
        texture.setAsImage(myImage);
        super(MainWebGlContext, MainShaderContext, [0, 0, 0, 1]);
        this.setTexture(texture);
        this.Colour = [1, 1, 1, 1];
    }
}

class HeroPlaneModel{
    constructor() {
    }

    draw(JSWebGlCamera,TargetTransform){
        let DrawTransform = new Transform();
        DrawTransform.SetParent(TargetTransform);



        DrawTransform.position = [0,0,0,0];
        GameShape.Square.setColour([1,1,1,1]);
        GameShape.Square.draw(JSWebGlCamera,DrawTransform);




        DrawTransform.position = [0,-1,0,0];
        DrawTransform.scale = [1,1,1,0];
        GameShape.Circle.draw(JSWebGlCamera,DrawTransform);


        DrawTransform.position = [1,0,0,0];
        DrawTransform.scale = [1,1,1,0];
        GameShape.Triangle.setColour([1,1,1,1]);
        GameShape.Triangle.draw(JSWebGlCamera,DrawTransform);

        DrawTransform.position = [-1,0,0,0];
        DrawTransform.scale = [1,1,1,0];
        GameShape.Triangle.setColour([1,1,1,1]);
        GameShape.Triangle.draw(JSWebGlCamera,DrawTransform);

        DrawTransform.position = [0,-1.5,0,0];
        DrawTransform.scale = [1,-0.5,1,0];
        GameShape.Triangle.setColour([1,1,0,1]);
        GameShape.Triangle.draw(JSWebGlCamera,DrawTransform);

    }
}

let PlayerPlaneMesh = new HeroPlaneModel();

class UI_MoveJoystick extends JSGameObject {
    constructor() {
        super("UI_Joystick", {LayerName: "UI"});
        this.OuterCircle = new JSWebGlCircle(MainWebGlContext, MainShaderContext, [0, 0, 0, 0.1]);
        this.ThumbCirlce = new JSWebGlCircle(MainWebGlContext, MainShaderContext, [0, 0, 0, 0.3]);

        this.OuterCircle.transform.SetParent(this.transform);
        this.ThumbCirlce.transform.SetParent(this.transform);
        this.ThumbCirlce.transform.scale = [0.3, 0.3, 1];
        this.ThumbCirlce.transform.position = [0, 0, 0];

        this.MoveX = 0;
        this.MoveY = 0;
        this.MoveAngle = 0;

        this.JoystickSize = 0;
        this.Active = false;
    }

    Tick() {
        if (!MainWebGlContext.isFullscreen) {
            return;
        }
        this.JoystickSize = (MainWebGlContext.getSize().width / 2) * 0.2;
        this.transform.scale = [this.JoystickSize, this.JoystickSize, 1];
        this.transform.position[2] = 0;

        if (TouchInput.touch[0].isPressed) {
            let touchObj = TouchInput.touch[0];
            let distanceVector = [...touchObj.distanceVector];

            for (let i = 0; i < distanceVector.length; i++) {
                if (distanceVector[i] > this.JoystickSize) {
                    distanceVector[i] = this.JoystickSize;
                } else if (distanceVector[i] < -this.JoystickSize) {
                    distanceVector[i] = -this.JoystickSize;
                }
            }

            this.MoveX = distanceVector[0] / this.JoystickSize;
            this.MoveY = distanceVector[1] / this.JoystickSize;
            this.MoveAngle = (Math.atan2(this.MoveY, this.MoveX) * 180 / Math.PI) - 90;

            this.ThumbCirlce.transform.rotation = [0, 0, this.MoveAngle];

            this.transform.position = [
                touchObj.startPos[0],
                touchObj.startPos[1],
                this.transform.position[2]
            ];

            this.ThumbCirlce.transform.position = [
                this.MoveX,
                this.MoveY,
                1
            ];


            this.Active = true;
        } else {
            this.MoveX = 0;
            this.MoveY = 0;
            this.Active = false;
        }
    }

    Draw(JSWebGlCamera) {
        if (!this.Active) {
            return;
        }

        let ThumbCirlceTransform = new Transform();

        ThumbCirlceTransform.Copy(this.transform);
        ThumbCirlceTransform.position[0] += this.MoveX * this.transform.scale[0];
        ThumbCirlceTransform.position[1] += this.MoveY * this.transform.scale[0];
        let ThumbScale = 0.35;
        ThumbCirlceTransform.scale = [
            this.transform.scale[0] * ThumbScale,
            this.transform.scale[0] * ThumbScale,
            1
        ]

        this.ThumbCirlce.draw(JSWebGlCamera,ThumbCirlceTransform);
        this.OuterCircle.draw(JSWebGlCamera,this.transform);


    }
}

class SpinBox extends JSGameObject {
    constructor() {
        super("SpinBox");
        this.Collider = new JSGameBoxCollider(this.transform);

        this.Mesh = new JSWebGlSquare(MainWebGlContext, MainShaderContext, [1, 1, 1, 1]);
        this.Mesh.transform.SetParent(this.transform);
    }

    Tick(DeltaTime) {
        this.transform.position = [0, 0, -10];
        this.transform.scale = [100, 100, 1];
        this.transform.rotation[2] = DeltaTime/200;
    }

    Draw(JSWebGlCamera) {
        this.Mesh.draw(JSWebGlCamera,this.transform);
    }

}

class TestBullet extends JSGameObject {
    constructor(startPos = [0,0,0]) {
        super("SpinBox");
        this.Collider = new JSGameBoxCollider(this.transform);

        this.transform.position[0] = startPos[0];
        this.transform.position[1] = startPos[1];
        this.transform.position[2] = startPos[2];

        this.TimeAlive = 0;
    }

    Tick(DeltaTime) {
        this.transform.position[2] = [-10];
        this.transform.position[1] += Time.deltaTime * 1.5;
        this.transform.scale = [20, 20, 1];
        this.transform.rotation[2] = 0;

        this.TimeAlive += Time.deltaTime;
        if (this.TimeAlive > 2000){
            this.Destroy(this);
        }
    }

    Draw(JSWebGlCamera) {
        GameShape.Square.setColour([0,1,1,1]);
        GameShape.Square.Texture.clear([1,1,1,1]);
        GameShape.Square.draw(JSWebGlCamera,this.transform);
    }

}

class MyPlane extends JSGameObject {
    constructor() {
        super("PlayerPlane");
        this.MoveSpeed = 1;
        this.SetCollisionBody(new JSGameBoxCollider(this.transform));

        this.Shot = {
            Delay: 150,
            Time: 0
        }
    }
    Draw(JSWebCamera) {
        GameShape.Square.setColour([1,1,1,1]);
        GameShape.Square.Texture.setAsImage(GameSprite.Player.Ship);
        GameShape.Square.draw(JSWebCamera,this.transform);

        this.transform.scale = [30, 30, 1]
    }

    Tick(DeltaTime) {
        if (!MainWebGlContext.isFullscreen) { return; }

        this.Shot.Time -= Time.deltaTime;
        if (this.Shot.Time < 0){
            this.Shot.Time = 0;
        }

        if (TouchInput.touch[0].isPressed) {
            let touchObj = TouchInput.touch[0];
            let distanceVector = [...touchObj.distanceVector];

            let JoyStick = this.FindObjectsOfType(UI_MoveJoystick);
            if (JoyStick.length > 0) {
                JoyStick = JoyStick[0]
            }
            ;


            this.transform.position[0] += JoyStick.MoveX * DeltaTime / 2 * this.MoveSpeed;
            this.transform.position[1] += JoyStick.MoveY * DeltaTime / 2 * this.MoveSpeed;
        }

        if (TouchInput.touch[1].isPressed){
            if (this.Shot.Time <= 0) {
                let newBullet = new TestBullet([
                    this.transform.position[0],
                    this.transform.position[1] + this.transform.scale[1]*2,
                    this.transform.position[2] + 100
                ]);
                this.Spawn(newBullet);
                this.Shot.Time = this.Shot.Delay;
            }
        }
        this.transform.position[2] = -10;
        this.transform.scale = [30, 30, 1];
    }
}

MainWebGlContext.setCanFullScreen(true);
MainWebGlContext.resolutionScale = 1;

class TestScene extends JSGameScene {
    constructor() {
        super();
        this.Camera = new JSWebGlUICamera(MainWebGlContext);



        //this.Add(new SpinBox());
        this.Add(new MyPlane());
        this.Add(new UI_MoveJoystick());
    }

    Tick() {
        super.Tick();
        console.log(`Object Count = ${this.SceneList.length}\n`);
        console.log(`FPS  = ${1000 / Time.deltaTime}\n`);
        this.Camera.transform.position = [0, 0, 10];
    }

    Draw(JSWebGlCamera = this.Camera) {
        for (let object of this.SortObjectsByDepth(this.Camera)) {
            object.Draw(JSWebGlCamera);
        }
    }
}

let MyTestScene = new TestScene();


function loop() {
    myCamera.Size = [testCanvas.width, testCanvas.height];
    myCamera.transform.position = [0, 0, 20];

    MyTestScene.Tick();
    MainWebGlContext.clear([1, 1, 1, 1]);
    MyTestScene.Draw();

    window.requestAnimationFrame(() => {
        loop();
    })
}

loop()