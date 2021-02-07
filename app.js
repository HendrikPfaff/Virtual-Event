const express = require('express')
const socketio = require('socket.io')
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res)=> {
    res.render('index')
})

const server = app.listen(process.env.PORT || 3000, () => {
    console.log("server is running")
})


//initialize socket for the server
const io = socketio(server)
// User handling.
let currentUsersOnline = []
let currentAvatarsOnline = []

class Avatar{
    constructor(imgSource, positionX, positionY, user) {
        this.imgSource = imgSource
        this.positionX = positionX
        this.positionY = positionY
        this.user = user
    }
}

io.on('connection', socket => {

    // Process new user.
    console.log("New user connected")
    // Make sure every name is unique.
    socket.username = "User " + Math.floor(Math.random()*1000)
    // Refresh userlist.
    currentUsersOnline.push(socket.username)
    // Refresh avatars.
    currentAvatarsOnline.push(new Avatar('../img/turquoise.png', '500', '500', socket.username))
    console.log("Avatars: " + currentAvatarsOnline)
    io.sockets.emit('user_joins', {username: socket.username, onlineList: currentUsersOnline, avatars: currentAvatarsOnline})

    //handle the new message event.
    socket.on('new_message', data => {
        console.log("new message")
        io.sockets.emit('receive_message', {message: data.message, username: socket.username, timestampUtc: data.timestampUtc})
    })

    // Handling typing event.
    socket.on('typing', data => {
        socket.broadcast.emit('typing', {username: socket.username})
    })

    // User goes offline - remove from list.
    socket.on('disconnect', () => {
        console.log('user disconnected');
        currentUsersOnline = currentUsersOnline.filter(e => e !== socket.username);
        io.sockets.emit('user_leaves', {onlineList: currentUsersOnline})
    });
})