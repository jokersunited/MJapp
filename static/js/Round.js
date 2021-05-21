
var bigTiles = ['dong', 'nan', 'xi', 'bei', 'red', 'white', 'green']
var normalTiles = ['wan', 'tong', 'suo']
var flowerTiles = ['flower1', 'flower2', 'cat', 'worm', 'chicken', 'mouse']

var TILE_X = 150

class Round extends Phaser.Scene {
    constructor() {
        super({key: 'Round'});
    }

    init(data) {

    }

    preload () {
        this.load.image('background', './static/img/background.jpg');

        // Load all the tiles
        bigTiles.forEach((tile) => {
            this.load.image(`${tile}`, `./static/img/game/${tile}.png`);
        })
        normalTiles.forEach((tile) => {
            for (let count = 1; count < 10; count ++) {
                this.load.image(`${tile}${count}`, `./static/img/game/${tile}${count}.png`);
            }
        })
        flowerTiles.forEach((tile) => {
            if (tile == "flower1" || tile == "flower2") {
                for (let count = 1; count < 5; count ++) {
                    this.load.image(`${tile}${count}`, `./static/img/game/${tile}${count}.png`);
                }
            }
            else {
                this.load.image(`${tile}`, `./static/img/game/${tile}.png`);
            }
        })

        this.background = this.add.image(0, 0, 'background')

        socket.on('startRound', (msg) => {

            this.data.gameinit = msg

            this.playerHand = this.add.group()
        })
    }

    create () {

        let msg = this.data.gameinit
        msg.closedtiles.forEach((tile, index) => {
            if (tile.number != null) {
                let playertile = this.add.sprite(120+(TILE_X*0.4)+1 + ((index + 1)*(TILE_X*0.4)+1), Y/5 * 4, `${tile.pattern}${tile.number}`).setScale(0.4)
                this.playerHand.add(playertile)
            }
            else {
                let playertile = this.add.sprite(120+(TILE_X*0.4)+1 + ((index + 1)*(TILE_X*0.4)+1), Y/5 * 4, `${tile.pattern}`).setScale(0.4)
                this.playerHand.add(playertile)
            }
            
        })
        msg.openedtiles.forEach((tile, index) => {
            if (tile.number != null) {
                let playertile = this.add.sprite(((index + 1)*(TILE_X*0.2)), Y-(TILE_X*0.2), `${tile.pattern}${tile.number}`).setScale(0.2)
                this.playerHand.add(playertile)
            }
            else {
                let playertile = this.add.sprite(((index + 1)*(TILE_X*0.2)), Y-(TILE_X*0.2), `${tile.pattern}`).setScale(0.2)
                this.playerHand.add(playertile)
            }
        })
        
        // this.sprite1 = this.add.sprite(Y/5 * 2, X/5 *3, 'dongTile').setScale(0.2)
        // this.sprite2 = this.add.sprite(Y/5 * 2, X/5 *5, 'dongTile').setScale(0.2)
    }

    update () {

    }
}