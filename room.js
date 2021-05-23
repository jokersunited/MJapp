var io;
var clientSocket;

const { Player } = require('./game')
const { Game } = require('./game')
const { gamePlayer } = require('./game')
const { Tile } = require('./game')

const MIN = 10000
const MAX = 99999

var rooms = {}
var games = {}

exports.initRoom = function (sio, socket) {
    io = sio;
    clientSocket = socket;

    clientSocket.on("createRoom", createRoom)
    clientSocket.on("joinRoom", joinRoom)
    clientSocket.on("sendMessage", sendMessage)
    clientSocket.on("startGame", startGame)

    clientSocket.on("startRound", startRound)

    clientSocket.on('disconnecting', disconnect)

}

function disconnect() {
    
    for (const roomid of this.rooms.values()) {
        if (roomid != this.id){
            io.to(roomid).emit('clientLeave', {"clientName": rooms[roomid][this.id].name, "clientNumber": rooms[roomid][this.id].number});
            delete rooms[roomid][this.id];
            if (Object.keys(rooms[roomid]).length === 0) {
                delete rooms[roomid];
            }
        }  
    }
}

/* Functions related to lobby logic */

function startGame(msg) {

    var player_arr = Object.values(rooms[msg.roomid.toString()])
    var gamePlayer_arr = []
    player_arr.forEach((player) => {
        gamePlayer_arr.push(new gamePlayer(player.name, player.sid))
    })
        
    games[msg.roomid] = new Game(gamePlayer_arr)
    games[msg.roomid].setWind()    
    io.in(msg.roomid.toString()).emit('startGame');
}

function createRoom(name){
    if (name == ""){
        return;
    }
    else if (this.rooms.size > 1) {
        return;
    }
    else {
        var roomid = Math.floor(MIN + (MAX - MIN) * Math.random());
        this.join(roomid.toString());
        rooms[roomid.toString()] = {};
        rooms[roomid.toString()][this.id] = new Player(name, this.id, 1);
        this.emit('roomCreated', {'roomid': roomid, 'clientName': name, 'playerNumber': 1});
    }
   
}

function joinRoom(data){
    if (data.roomid == "" || !rooms[data.roomid] || this.rooms.size > 1){
        this.emit('roomError', {msg: "Invalid room ID!"})
        return
    }
    else {
        var players = Object.values(rooms[data.roomid.toString()])
    }
    if (players.length >= 4) {
        this.emit('roomError', {msg: "Room is full!"})
    }
    else if(!this.rooms[data.roomid.toString()]) {
        try {
            this.join(data.roomid.toString())
            
            player = players.sort((a,b) => {
                return (a.number - b.number)
            })

            for (let x = 0; x < players.length; x++){
                if (players[x].number != (x+1)){
                    var player_number = (x+1)
                    break
                }
                else {
                    var player_number = players.length + 1
                }
            }
            rooms[data.roomid.toString()][this.id] = new Player(data.name, this.id, player_number)
        }
        catch (err) {
            console.log(err)
            return
        }
        this.broadcast.to(data.roomid.toString()).emit('clientJoined', {'clientName': data.name, 'clientNumber': player_number, "clients": players});
        this.emit('clientJoined', {'clientName': data.name, 'roomid': data.roomid, "clients": players, 'clientNumber': player_number})
        
    }
    console.log(rooms)
}

function sendMessage(msg){
    for (const roomid of this.rooms.values()) {
        if (roomid != this.id){
            this.broadcast.to(roomid.toString()).emit('messageSent', {'type': 0, 'message': msg, 'sender': rooms[roomid][this.id].name})
            this.emit('messageSent', {'type': 1, 'message': msg, 'sender': null})
        }  
    }
}

/* Functions related to game logic */

function initRound(roomid) {
    games[roomid].shuffleTiles()
    games[roomid].dealStartTiles()

    games[roomid].players.forEach((player) => {
        io.to(player.sid).emit('startRound', {'closedtiles': player.closedHand, 'openedtiles': player.openHand, 'wind': player.wind})
    })
}

function playerReadyCheck(players) {
    players.forEach((player) => {
        if (!player.ready) {
            return false
        }
    })
    return true

}

function startRound(msg) {
    var room = Array.from(this.rooms)[1]
    console.log(room)
    initRound(room.toString())
}
