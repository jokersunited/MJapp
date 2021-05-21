const express = require('express')
const path = require('path')

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const nunjucks  = require('nunjucks');

const room = require('./room')

const port = 8080

app.use('/static', express.static(path.join(__dirname, 'static')))
app.get('/', function(req, res) {
   res.sendFile(__dirname + '/index.html');
});

//Whenever someone connects this gets executed
io.on('connection', function(socket) {
   room.initRoom(io, socket)
});

http.listen(port, function() {
   console.log(`listening on *:${port}`);
});