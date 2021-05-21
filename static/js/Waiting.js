const X = 1280
const Y = 720

var loading_text = "Waiting for players"
var smallText = { 
    fontFamily: 'KoHo, sans-serif', 
    fontSize: '12pt', 
    color: '#BBB'
}

var headerText =  {
    fontFamily: 'KoHo, sans-serif', 
    fontSize: '36pt', 
}

var buttonText =  {
    fontFamily: 'KoHo, sans-serif', 
    fontSize: '24pt', 
    backgroundColor: '#333',
}


class Waiting extends Phaser.Scene {
    constructor() {
        super({key: 'Waiting'});
    }

    loading () {
        this.count ++;
        if (loading_text.split(".").length >= 5) {
            loading_text = "Waiting for players";

        }
        else {
            loading_text += ".";
        }
        this.txt.setText(loading_text).setOrigin(0.5);
    }

    acceptPlayer (player_obj, player_text_obj, client_name, number) {
        var image_str = 'flower' + number
        this.tweens.add({
            targets: player_obj,
            y: Y/2,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                player_text_obj.setText(client_name);
                player_text_obj.setColor("#FFF");
                player_text_obj.setFontSize("16pt");
                player_obj.setTexture(image_str).setScale(0.15);
                player_obj.alpha = 0;
                this.tweens.add({
                    targets: player_obj,
                    y: Y/3 * 2,
                    alpha: 1,
                    duration: 1000,
                    ease: 'Power2',
                })
            }
          });
    }

    updatePlayerStatus(type, number, name) {
        switch (number) {
            case 1:
                if (type == "connect") {
                    this.acceptPlayer(this.playerOne, this.playerOneText, name, 1)
                }
                else if (type == "disconnect") {
                    this.disconnectPlayer(this.playerOne, this.playerOneText)
                }
                break
            case 2:
                if (type == "connect") {
                    this.acceptPlayer(this.playerTwo, this.playerTwoText, name, 2)
                }
                else if (type == "disconnect") {
                    this.disconnectPlayer(this.playerTwo, this.playerTwoText)
                }
                break
            case 3:
                if (type == "connect") {
                    this.acceptPlayer(this.playerThree, this.playerThreeText, name, 3)
                }
                else if (type == "disconnect") {
                    this.disconnectPlayer(this.playerThree, this.playerThreeText)
                }
                break
            case 4:
                if (type == "connect") {
                    this.acceptPlayer(this.playerFour, this.playerFourText, name, 4)
                }
                else if (type == "disconnect") {
                    this.disconnectPlayer(this.playerFour, this.playerFourText)
                }   
            }
    }

    disconnectPlayer (player_obj, player_text_obj) {
        this.tweens.add({
            targets: player_obj,
            y: Y/2,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                player_text_obj.setText("Waiting");
                player_text_obj.setColor("#BBB");
                player_text_obj.setFontSize("12pt");
                player_obj.setTexture('playerOff').setScale(0.15);
                player_obj.alpha = 0;
                this.tweens.add({
                    targets: player_obj,
                    y: Y/3 * 2,
                    alpha: 1,
                    duration: 1000,
                    ease: 'Power2',
                })
            }
          });
    }

    // Start button functions
    startingGame(type) {
        if (type == 1) {
            this.txt.setAlpha(0);
            this.startButton = this.add.sprite(X/2, Y/5, 'start').setOrigin(0.5).setScale(0.75)
            this.startButton.setInteractive()
            // this.startButton.setPadding(50,25,50,25)
            this.startButton.on('pointerup', () => {
                this.startButton.y = Y/5
                this.startGame()

            })
            this.startButton.on('pointerover', (ptr) => {
                this.startButton.setScale(0.90)
                if (ptr.isDown) {
                    this.startButton.y = Y/5 + 10
                }
            })
            this.startButton.on('pointerdown', () => {
                this.startButton.y = Y/5 + 10
                this.startButton.setScale(0.90)
            })
            this.startButton.on('pointerout', (ptr) => {
                this.startButton.y = Y/5
                this.startButton.setScale(0.75)

            })
        }
        else if (type == 0) {
            if (this.startButton) {
                this.startButton.destroy();
            }
            this.txt.setAlpha(1);
        }
        
    }

    startGame() {
        socket.emit("startGame", {roomid: room_id})
    }


    preload() {
        this.load.image('background', './static/img/background.jpg');
        this.load.image('playerOff', './static/img/unknown.png');
        this.load.image('flower1', './static/img/flower1.png');
        this.load.image('flower2', './static/img/flower2.png');
        this.load.image('flower3', './static/img/flower3.png');
        this.load.image('flower4', './static/img/flower4.png');
        this.load.image('start', './static/img/start.png');

        this.load.audio('backaudio', [ './static/audio/bensound-background.mp3']);

        socket.on('roomCreated', (msg) => {
            this.acceptPlayer(this.playerOne, this.playerOneText, msg.clientName, 1)
            this.data.playerNumber = 1
        });

        socket.on('clientLeave', (msg) => {
            this.updatePlayerStatus("disconnect", msg.clientNumber, msg.clientName)
            this.startingGame(0)
        })
        socket.on('clientJoined', (msg) => {
            this.updatePlayerStatus("connect", msg.clientNumber, msg.clientName)
            if (msg.roomid != null){
                msg.clients.forEach( (player) => {
                    this.updatePlayerStatus("connect", player.number, player.name)
                })
                this.data.playerNumber = msg.clientNumber
            }
            if (msg.clients.length == 3 && this.data.playerNumber == 1) {
                this.startingGame(1)
            }
            
        });

        socket.on('startGame', (msg) => {
            $(".msger-chat").append(`<div class="chatnotice"><b>The game has started!</b></div>`)
            this.scene.start('Round', { player: this.data.playerNumber });
        })
    }

    create() {

        var music = this.sound.add('backaudio');

        music.play({
            loop: true,
            volume: 0.25
        });
        
        this.count = 0

        this.background = this.add.image(0, 0, 'background')
        
        this.txt = this.add.text(X/2, Y/4, 'Waiting for players', headerText).setOrigin(0.5);
        
        this.playerOne = this.add.sprite(X/5, Y/3 * 2, 'playerOff').setScale(0.15)
        this.playerOneText = this.add.text(X/5, Y/6 * 5, 'Waiting', smallText).setOrigin(0.5)

        this.playerTwo = this.add.sprite(X/5 * 2, Y/3 * 2, 'playerOff').setScale(0.15)
        this.playerTwoText = this.add.text(X/5 * 2, Y/6 * 5, 'Waiting', smallText).setOrigin(0.5)

        this.playerThree = this.add.sprite(X/5 * 3, Y/3 * 2, 'playerOff').setScale(0.15)
        this.playerThreeText = this.add.text(X/5 * 3, Y/6 * 5, 'Waiting', smallText).setOrigin(0.5)

        this.playerFour = this.add.sprite(X/5 * 4, Y/3 * 2, 'playerOff').setScale(0.15)
        this.playerFourText = this.add.text(X/5 * 4, Y/6 * 5, 'Waiting', smallText).setOrigin(0.5)


        var loadingAnim = this.time.addEvent({ delay: 250, loop: true, callback: this.loading, callbackScope: this});
        
    }

    update (time, delta) {
        
    }

    
}
