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
const cors = require('cors')
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const socketio = require('socket.io')
const app = express()
const port = 3000

app.set('view engine', 'ejs')
app.use(express.static('public'))

// Parse URL parameters.
app.get('/', (req, res)=> {
    res.render('index')
})

let tmpRoom = "dashboard"
app.get('/kino', (req, res) =>{
    tmpRoom = "kino"
    res.render('room')
})

app.get('/vortrag', (req, res) =>{
    tmpRoom = "vortrag"
    res.render('room')
})

app.get('/beratung', (req, res) =>{
    tmpRoom = "beratung"
    res.render('room')
})

app.get('/weltcafe', (req, res) =>{
    tmpRoom = "weltcafe"
    res.render('room')
})

app.get('/vortragsraum', (req, res) =>{
    tmpRoom = "vortragsraum"
    res.render('room')
})

app.get('/dashboard', (req, res) =>{
    tmpRoom = "dashboard"
    res.render('room')
})


let loginUsername = ""
let loginAvatar = ""
app.post('/dashboard', urlencodedParser, function(req,res){
    console.log("New Login with '" + req.body.username + "' and " + req.body.avatarImg)
    loginUsername = req.body.username
    loginAvatar = req.body.avatarImg
    res.render('room')
})

// Initialize server.
const server = app.listen(process.env.PORT || port, () => {
    console.log("server is running\nCall localhost:" + port)
})

const corsOptions = {
    origin: ["https://bfree.herokuapp.com/", "localhost:3000"],
        methods: ["GET", "POST"],
    credentials: true
}
app.use(cors(corsOptions))

// Initialize socket for the server.
const io = socketio(server, )


// Welcome message.
console.log("       .-._\n     .-| | |\n   _ | | | |__FRANKFURT\n ((__| | | | UNIVERSITY\n     OF APPLIED SCIENCES")

// User handling.
let currentUsersOnline = []

io.on('connection', socket => {

    // Chosen login data.
    socket.emit('login', {loginUsername: loginUsername, loginAvatar: loginAvatar})

    // Process new client.
    socket.on('userConnected', data => {
        // Refresh userlist.
        socket.uniqueId = data.user.uniqueId
        socket.username = data.user.username
        socket.currentRoom = data.user.currentRoom
        currentUsersOnline.push(data.user)
        console.log("'" + socket.username + "'(" + socket.uniqueId + ") connected to " + socket.currentRoom.id)

        // Broadcast the userlist everytime a new user joins.
        io.sockets.emit('update', {onlineList: currentUsersOnline})
    })

    //handle the new message event.
    socket.on('new_message', data => {
        console.log("new message")
        io.sockets.emit('receive_message', {message: data.message, uniqueId: data.uniqueId, username: data.username, timestampUtc: data.timestampUtc})
    })

    // Handling typing event.
    socket.on('typing', data => {
        socket.broadcast.emit('typing', {username: socket.username})
    })

    // Handling avatar movement.
    socket.on('avatarMoves', data => {
        console.log("Avatar of " + data.username + " moves to " + data.positionX + " | " + data.positionY)
        let user = currentUsersOnline.find(element => element.username === data.username)
        user.avatarPositionX = data.positionX
        user.avatarPositionY = data.positionY
        io.sockets.emit('avatarMoves', {uniqueId: user.uniqueId, username: user.username, positionX: data.positionX, positionY: data.positionY})
    })

    // User goes offline - remove from lists.
    socket.on('disconnect', () => {
        console.log("'" + socket.username + "'(" + socket.uniqueId + ") disconnected");
        currentUsersOnline = currentUsersOnline.filter(function(element){
            return element.uniqueId !== socket.uniqueId
        });
        console.log(currentUsersOnline)
        io.sockets.emit('update', {onlineList: currentUsersOnline})
    });
})