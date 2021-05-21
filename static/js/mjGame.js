$( document ).ready(() =>{
    var config = {
        type: Phaser.AUTO,
        parent: 'mjgame',
        width: 1280,
        height: 720,
        physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
        },
        scene: [ Waiting, Round ]
    };
    


    var game = new Phaser.Game(config);
})