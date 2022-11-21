console.log("Hello World")

class JSGame_Key {
    constructor(KeyString, KeyDown, KeyPress, KeyUp) {
        this.value = KeyString;
        this.Down = KeyDown;
        this.Press = KeyPress;
        this.Up = KeyUp;
    }
}

class JSGame_InputSystem {
    constructor() {

        this._Keys = []

        window.addEventListener("keydown", (event) => {
            this._AddKeyDownEvent(event);
        })

        window.addEventListener("keyup", (event) => {
            this._AddKeyUpEvent(event);
        })



        window.requestAnimationFrame(() => {
            this._Tick()
        });
    }

    GetKey(keyName){
        let index = this._GetIndex(keyName);
        if (index >= 0) {
            console.log(`Key found at ${index}`);
            return this._Keys[index];
        }
        else
        {
            return new JSGame_Key("none",false,false,false);
        }

    }

    DebugLogKeys(){
        console.log("Keys: ");
        for (let i = 0; i < this._Keys.length; i++)
        {
            console.log(this._Keys[i].value);
        }
    }

    _GetIndex(keyString) {
        let returnIndex = -1;
        for (let i = 0; i < this._Keys.length; i++) {
            if (this._Keys[i].value == keyString) {
                returnIndex = i;
            }
        }

        return returnIndex;
    }


    _AddKeyDownEvent(keyEvent) {
        if (this._GetIndex(keyEvent.key) >= 0) {
            let keyIndex = this._GetIndex(keyEvent.key);
            this._Keys[keyIndex].Down = true;
            this._Keys[keyIndex].Up = false;
            this._Keys[keyIndex].Press = true;
        } else {
            this._Keys.push(new JSGame_Key(keyEvent.key, true, true, false));
        }
    }

    _AddKeyUpEvent(keyEvent) {
        let keyValue = keyEvent.key;
        let keyDownI = this._GetIndex(keyEvent.key);
        if (keyDownI >= 0) {
            this._Keys[keyDownI].Up = true;
            this._Keys[keyDownI].Down = false;
            this._Keys[keyDownI].Press = false;
        }

    }

    _Tick(deltaTime) {

        for (let i = 0; i < this._Keys.length; i++)
        {
            this._Keys[i].Down = false;
            this._Keys[i].Up = false;
        }

        window.requestAnimationFrame(() => {
            this._Tick()
        });

    }

    _printKeyEvent(keyEvent) {
        console.log(keyEvent.key);
        console.log(this._Keys);
    }
}


const JSGameInput = new JSGame_InputSystem();

