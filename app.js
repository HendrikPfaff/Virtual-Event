/**
 *        .-._
 *      .-| | |
 *    _ | | | |__FRANKFURT
 *  ((__| | | | UNIVERSITY
 *     OF APPLIED SCIENCES
 *
 *  (c) 2021
 *
 *  This Project was created during the IPR3 in the winter term 2020/21
 *  by Hendrik Pfaff
 */

const express = require('express')
const socketio = require('socket.io')
const app = express()
const port = 3000

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res)=> {
    res.render('index')
})

const server = app.listen(process.env.PORT || port, () => {
    console.log("server is running\nCall localhost:" + port)
})


//initialize socket for the server
const io = socketio(server)
// User handling.
let currentUsersOnline = []
let currentAvatarsOnline = []

class User{
    constructor(username, img, positionX, positionY) {
        this.username = username
        this.avatarImg = img
        this.avatarPositionX = positionX
        this.avatarPositionY = positionY
    }
}

// Welcome message.
console.log("       .-._\n     .-| | |\n   _ | | | |__FRANKFURT\n ((__| | | | UNIVERSITY\n     OF APPLIED SCIENCES")

io.on('connection', socket => {

    // Make sure every username is unique for now.
    socket.username = "User " + Math.floor(Math.random()*1000)
    let user = new User(socket.username, '../img/avatars/turquoise.png', 500, 500)

    // Process new user.
    console.log("'" + socket.username + "' connected")



    io.sockets.emit("userConnected", {user: user})

    // Refresh userlist.
    currentUsersOnline.push(user)

    // Broadcast the userlist everytime a new user joins.
    io.sockets.emit('user_joins', {onlineList: currentUsersOnline})

    //handle the new message event.
    socket.on('new_message', data => {
        console.log("new message")
        io.sockets.emit('receive_message', {message: data.message, username: user.username, timestampUtc: data.timestampUtc})
    })

    // Handling typing event.
    //socket.on('typing', data => {
    //    socket.broadcast.emit('typing', {username: socket.username})
    //})

    // Handling avatar movement.
    socket.on('avatarMoves', data => {
        console.log("Avatar of " + data.username + " moves to " + data.positionX + " | " + data.positionY)
    })

    // User goes offline - remove from lists.
    socket.on('disconnect', () => {
        console.log("'" + socket.username + "' disconnected");
        currentUsersOnline = currentUsersOnline.filter(e => e.username !== socket.username);
        io.sockets.emit('user_leaves', {onlineList: currentUsersOnline})
    });
})