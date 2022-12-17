let DisplayElement = document.getElementById("Canvas");

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    backgroundColor: "rgb(0,0,0)",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    parent:  DisplayElement,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

DisplayElement.addEventListener("click", (event) => {
    event.target.requestFullscreen();
})

var game = new Phaser.Game(config);


class MyPlane extends Phaser.GameObjects.RenderTexture {
    constructor(ParentScene,x,y) {
        super(ParentScene,x,y,100,100);

        let someObj = new Phaser.GameObjects.Arc(ParentScene,0, 0, 80, 0, 240, false, 0x6666ff);
        ParentScene.add.existing(someObj);
    }
}
function preload ()
{

}

function create ()
{
    console.log("Hello Phaser");
    var r1 = this.add.arc(200, 200, 80, 0, 240, false, 0x6666ff);

    new MyPlane(this,0,0);

}

function update()
{
    console.log("Tick");

}
