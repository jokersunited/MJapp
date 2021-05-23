var bigTiles = ['dong', 'nan', 'xi', 'bei', 'red', 'white', 'green']
var normalTiles = ['wan', 'tong', 'suo']
var flowerTiles = ['flower1', 'flower2', 'cat', 'worm', 'chicken', 'mouse']

const TILE_X = 150
const TILE_Y = 200
const SELECT_PIX = 20

var playerHandClosed = []
var playerHandOpened = []

class Round extends Phaser.Scene {
    constructor() {
        super({key: 'Round'});
    }

    interactiveTiles(sprite) {
        sprite.clicked = false
        sprite.on('pointerup', (ptr) => {
            console.log('snap')
            if (sprite.dragged == true){
                sprite.dragged = false;
                return
            }
            if (!sprite.clicked) {
                sprite.border = this.add.graphics();
                sprite.clicked = true
                sprite.y = Y/5 * 4 - SELECT_PIX
                // border = this.add.rectangle(sprite.x, sprite.y, TILE_X, TILE_Y, 0xffffff, 0.5);
                sprite.border.lineStyle(5, 0xffff00, 1);
                sprite.border.strokeRect(sprite.x - TILE_X*0.2, sprite.y - TILE_X*0.2 - SELECT_PIX/2, TILE_X*0.4, TILE_Y*0.4);
                // sprite.input.hitArea.setTo(0, 0, TILE_X * 0.4, TILE_Y*0.4 + SELECT_PIX)
            }
            else {
                sprite.clicked = false
                sprite.y = Y/5 * 4
                sprite.border.destroy()
            }
        })
    }

    init(data) {
        this.data.player = data.player
    }

    preload () {
        this.load.image('background', './static/img/background.jpg');

        socket.on('startRound', (msg) => {
            console.log(msg)
            msg.closedtiles.forEach((tile, index) => {
                if (tile.number != null) {
                    var playertile = this.add.sprite(120+(TILE_X*0.4)+1 + ((index + 1)*(TILE_X*0.4)+1), Y/5 * 4, `${tile.pattern}${tile.number}`).setScale(0.4)                
                }
                else {
                    var playertile = this.add.sprite(120+(TILE_X*0.4)+1 + ((index + 1)*(TILE_X*0.4)+1), Y/5 * 4, `${tile.pattern}`).setScale(0.4)
                    
                }
                playertile.setInteractive()
                this.input.setDraggable(playertile);
                this.interactiveTiles(playertile)
                playertile.dragged = false;
                playerHandClosed.push(playertile)
            })
            msg.openedtiles.forEach((tile, index) => {
                if (tile.number != null) {
                    var playertile = this.add.sprite(((index + 1)*(TILE_X*0.2)), Y-(TILE_X*0.2), `${tile.pattern}${tile.number}`).setScale(0.2)
                }
                else {
                    var playertile = this.add.sprite(((index + 1)*(TILE_X*0.2)), Y-(TILE_X*0.2), `${tile.pattern}`).setScale(0.2)
                }
                playerHandOpened.push(playertile)
            })
        })

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

        this.input.on('dragstart', function (pointer, gameObject) {
            gameObject.setDepth(100)
            gameObject.dragged = true
            gameObject.setTint(0x444444);
    
        });
    
        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
    
            gameObject.x = dragX;
            gameObject.y = dragY;
    
        });
    
        this.input.on('dragend', function (pointer, gameObject) {
            gameObject.setDepth(0)
            gameObject.clearTint();
            var tilenumber
            playerHandClosed.forEach((tile, index) => {
                if (tile == gameObject) {
                    tilenumber = index
                }
            })
            
            var movetiles = false;
            var target;

            for (let i = 0; i < playerHandClosed.length; i++) {
                if (gameObject.x < 120+(TILE_X*0.4)+1 + ((i + 1)*(TILE_X*0.4)+1)) {
                    target = i
                    if (target > tilenumber + 1) {
                        target --;
                    }
                    gameObject.x = playerHandClosed[target].x
                    
                    break;
                }
                if (i == playerHandClosed.length - 1) {
                    gameObject.x = playerHandClosed[i].x
                    target = i
                }
            }
            gameObject.y = Y/5 * 4

            console.log(target)
            console.log(tilenumber)

            if (target == tilenumber) {
                gameObject.x = 120+(TILE_X*0.4)+1 + ((target + 1)*(TILE_X*0.4)+1)
            }



            else if (target > tilenumber) {
                while (target > tilenumber) {
                    playerHandClosed[target].x = 120+(TILE_X*0.4)+1 + ((target)*(TILE_X*0.4)+1)
                    target--;
                }
            }
            else {
                while (target < tilenumber) {
                    playerHandClosed[target].x = 120+(TILE_X*0.4)+1 + ((target+ 2)*(TILE_X*0.4)+1)
                    target++
                }
            }
            playerHandClosed.sort(function (l, r) {
                return l.x - r.x;
            });
        });

        this.input.dragDistanceThreshold = 16
        
    }

    create () {
        this.background = this.add.image(0, 0, 'background')
        if(this.data.player == 1) {
            this.txt = this.add.text(X/2, Y/2, 'Deal Tiles!', headerText).setOrigin(0.5);
            this.txt.setInteractive()
            this.txt.on('pointerdown', (ptr) => {
                socket.emit('startRound')
                this.txt.destroy()
            })
        }
        // this.sprite1 = this.add.sprite(Y/5 * 2, X/5 *3, 'dongTile').setScale(0.2)
        // this.sprite2 = this.add.sprite(Y/5 * 2, X/5 *5, 'dongTile').setScale(0.2)
    }

    update () {

    }
}