var socket;
var room_id;

$( document ).ready(function() {
    $('#playspace').hide()
    socket = io();

    socket.on('roomCreated', (msg) => {
        room_id = msg.roomid
        $('.msger-header-title').text("Room " + msg.roomid.toString())
        $(".msger-chat").append(`<div class="chatnotice">You joined the game!</div>`)
        $(".msger-chat").append(`<div class="chatnotice">Share the room id <b>${msg.roomid.toString()
        }</b> for others to join!</div>`)
        $('#playspace').show()
        $('#roomcreation').hide()

        
    })
    socket.on('clientJoined', (msg) => {
        if (msg.roomid == null){
            $(".msger-chat").append(`<div class="chatnotice">${msg.clientName} joined the game!</div>`)
        }
        else {
            room_id = msg.roomid
            $('#playspace').show()
            $('#roomcreation').hide()
            $('.msger-header-title').text("Room " + msg.roomid.toString())
            $(".msger-chat").append(`<div class="chatnotice">You joined the game!</div>`)
        }
    })
    socket.on('clientLeave', (msg) => {
        $(".msger-chat").append(`<div class="chatnotice">${msg.clientName} left the game!</div>`)
    })
    socket.on('messageSent', (msg) => {
        createchat(msg.type, msg.message, msg.sender);
    })
    socket.on('roomError', (msg) => {
      $(".alertfield").text(msg.msg);
      $('.alertfield').show();
    })

    $('#createroom').click(()=> {
        socket.emit('createRoom', $("#createname").val());
    })

    $('#joinroom').click(()=> {
        socket.emit('joinRoom', {'roomid': $("#roomId").val(), 'name': $("#joinname").val()})
    })

    $('.msger-input').keyup( (e) => {
        let msg = $('.msger-input').val()
        if(e.keyCode == 13 && msg != "") {
            socket.emit('sendMessage', msg)
            $('.msger-input').val('')
        }
    })
    $('.msger-send-btn').click(() => {
        let msg = $('.msger-input').val()
        if (msg != ""){
            socket.emit('sendMessage', msg)
            $('.msger-input').val('')
        }
    })

function createchat(type, message, sender){
    var now = moment().format('MMMM Do YYYY, h:mm')
    if (type == 1){
        $(".msger-chat").append(`<div class="msg right-msg">          
        <div class="msg-bubble">
          <div class="msg-info">
            <div class="msg-info-name">Me</div>
            <div class="msg-info-time">${now.toString()}</div>
          </div>
  
          <div class="msg-text">
            ${message}
          </div>
        </div>
      </div>`)
    }
    else{
        $(".msger-chat").append(`<div class="msg left-msg">          
        <div class="msg-bubble">
          <div class="msg-info">
            <div class="msg-info-name">${sender}</div>
            <div class="msg-info-time">${now.toString()}</div>
          </div>
  
          <div class="msg-text">
            ${message}
          </div>
        </div>
      </div>`)
    }
    $(".msger-chat").animate({ scrollTop: $(".msger-chat")[0].scrollHeight }, 10);
}


});