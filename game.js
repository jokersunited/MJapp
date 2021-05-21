const { EPERM } = require('constants');
const fs = require('fs')

// var winds = ["dong", "nan", "xi", "bei"]
var tileTypes = ["suo", "tong", "wan"]

function Player(name, sid, number) {
  this.name = name;
  this.sid = sid;
  this.number = number;
}

function gamePlayer(name, sid) {
  this.name = name;
  this.sid = sid;

  this.wind = null
  this.closedHand = [];
  this.openHand = [];
  this.money = 0.0;

  this.openFlower = function() {
    var flowercount = 0
    this.closedHand.forEach((tile, index) => {
      if (tile.isFlower){
        console.log(tile)
        this.closedHand.splice(index, 1);
        this.openHand.push(tile);
        flowercount++;
      }
    })
    if (flowercount == 0){
      return false
    }
    else {
      return flowercount
    }
  }
}

function Game(players) {
  this.players = players;

  this.round = 1;
  this.wind = 0;
  this.deck = generateTiles();

  this.setWind = function() {
    var winds = ["dong", "nan", "xi", "bei"]
    shuffleArray(winds)
    this.players.forEach((player, index) => {
      player.wind = winds[index]
    })
  }

  this.shuffleTiles = function() {
    shuffleArray(this.deck)
  }

  this.dealTiles = function (playersid, tilecount) {
    this.players.forEach((player, index) => {
      console.log()
      if (playersid == player.sid) {
        while (tilecount > 0) {
          player.closedHand.push(this.deck.pop())
          tilecount--;
        }
        return
      }    
    })
  }

  this.dealStartTiles = function () {
    this.players.forEach((player, index) => {
      if (player.wind == 'dong') {
        for (let count = 0; count < 14; count ++) {
          player.closedHand.push(this.deck.pop())
        }
      }
      else {
        for (let count = 0; count < 13; count ++) {
          player.closedHand.push(this.deck.pop())
        }
      }
      while (true) {
        var openhand = player.openFlower()
        if (openhand == false) {
          break
        }
        else {
          this.dealTiles(player.sid, openhand)
        }
      }
    })
  }

  this.remaindingTiles = function () {
    return this.deck.length
  }
}

function Tile(pattern, number, isFlower, isWind, isBig) {
  this.pattern = pattern;
  this.number = number;
  this.isFlower = isFlower;
  this.isWind = isWind;
  this.isBig = isBig;
}

module.exports = {
  Player: Player,
  gamePlayer: gamePlayer,
  Game: Game,
  Tile: Tile
}

function generateTiles() {
  tile_arr = []
  for (let type = 0; type < 5; type ++) {
    if (type < 3) {
      for (let counter = 1; counter < 10; counter++) {
        for (let extra = 0; extra < 4; extra ++) {
          tile_arr.push(new Tile(tileTypes[type], counter, false, false))
        }
      }
    }
    else {
      for (let counter = 1; counter < 5; counter++) {
        tile_arr.push(new Tile("flower"  + (type-2), counter, true, false))
      }
    }
  }
  let tilesdata = fs.readFileSync('tiles.json');
  let tiles = JSON.parse(tilesdata);
  tiles.forEach((tile) => {
    if (tile.isFlower) {
      tile_arr.push(new Tile(tile.pattern, null, tile.isFlower, tile.isWind, tile.isBig))
    }
    else {
      for (let extra = 0; extra < 4; extra ++) {
        tile_arr.push(new Tile(tile.pattern, null, tile.isFlower, tile.isWind, tile.isBig))
      }
    }
    
  })
  return tile_arr
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}