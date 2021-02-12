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

// Welcome message.
console.log("       .-._\n     .-| | |\n   _ | | | |__FRANKFURT\n ((__| | | | UNIVERSITY\n     OF APPLIED SCIENCES");

class User{
    constructor(uniqueId, username, img, positionX, positionY) {
        this.uniqueId = uniqueId
        this.username = username
        this.avatarImg = img
        this.avatarHeight = 50
        this.avatarPositionX = positionX
        this.avatarPositionY = positionY
    }
}

class RoomLink{
    constructor(label, link, img, positionX, positionY) {
        this.label = label
        this.link = link
        this.img = img
        this.positionX = positionX
        this.positionY = positionY
    }
}

(function connect(){
    let socket = io.connect('http://localhost:80', {
        withCredentials: true,
        extraHeaders: {
            "my-header": "abcd"
        }
    })
    // Make sure every username is unique for now.
    let randomDelta = Math.floor(Math.random()*250)
    // Get a random avatar.
    let currentUser = new User(randomDelta, "Hendrik Pfaff", '../img/avatars/turquoise.png', (500 + randomDelta), (500 + randomDelta))
    let myAvatar = document.createElement('img')
    let maincanvas = document.querySelector('#maincanvas')
    let avatarList = []


    // Tell server, who we are.
    socket.emit('userConnected', {user: currentUser})

    function renderBackground(room){


        maincanvas.style.background = 'url("../img/backgrounds/rondell.png")'
        maincanvas.style.backgroundRepeat = 'no-repeat'
        maincanvas.style.backgroundPosition = 'center center'
        maincanvas.style.backgroundSize = 'cover'

        console.log("background")
    }
    renderBackground()

    // Update the userlist.
    let userList = document.querySelector('#currentUserList')
    function displayOnlineList(item, index){
        let userItem = document.createElement('li')
        userItem.classList.add('nav-item')

        let userLink = document.createElement('a')
        userLink.classList.add('nav-link')
        userLink.textContent =  item.username

        if(item.uniqueId === currentUser.uniqueId){
            userLink.style.fontWeight = 'bold'
        }

        userItem.appendChild(userLink)
        userList.appendChild(userItem)
    }

    // Update avatar positions
    function displayAvatars(item, index){
        let avatar = document.createElement('div')
        let avatarImg = document.createElement('img')
        avatarImg.src = item.avatarImg

        avatar.appendChild(avatarImg)
        avatar.classList.add('avatar')
        avatar.style.left = item.avatarPositionX + "px"
        avatar.style.top = item.avatarPositionY + "px"

        if(item.uniqueId === currentUser.uniqueId){
            avatar.id = 'my-avatar'
            avatarImg.id = 'my-avatar' // Yes, I know ids should be unique among DOM elements...
            myAvatar = avatar
        } else {
            avatar.id = item.uniqueId
        }

        let avatarName = document.createElement('span')
        avatarName.innerHTML = item.username
        avatar.appendChild(avatarName)


        maincanvas.appendChild(avatar)
        console.log(avatar)
        avatarList.push(avatar)
    }

    function displayUser(item, index){
        displayOnlineList(item, index)
        displayAvatars(item, index)
    }

    // Some other user joins.
    socket.on('update', data => {
        console.log(data)
        userList.innerHTML = ""
        maincanvas.innerHTML = ""
        avatarList = []
        // Refresh the current users / avatars.
        data.onlineList.forEach(displayUser)
    })

    // Message handling.
    let message = document.querySelector('#message')
    let messageBtn = document.querySelector('#messageBtn')
    let messageList = document.querySelector('#message-list')

    messageBtn.addEventListener('click', e => {
        let clientTime = new Date()
        let currentTimestampUtc = clientTime.toUTCString()
        socket.emit('new_message', {message: message.value, uniqueId: currentUser.uniqueId, username: currentUser.username, timestampUtc: currentTimestampUtc})
        message.value = ''
    })

    socket.on('receive_message', data => {
        let listItem = document.createElement('li')

        if(data.uniqueId !== currentUser.uniqueId){
            // Message is from another user (incoming).
            let userCircle = document.createElement('div')
            userCircle.classList.add('msg-user-circle')
            let userInitials = document.createElement('span')
            userInitials.textContent = 'HP'
            userCircle.appendChild(userInitials)


            let messageBody = document.createElement('div')
            messageBody.classList.add('external-msg-body')
            let messageSender = document.createElement('span')
            messageSender.classList.add('msg-sender-username')
            messageSender.textContent = data.username
            let actualMessage = document.createElement('span')
            actualMessage.classList.add('msg-actual')
            actualMessage.textContent = data.message
            let messageTimestamp = document.createElement('span')
            messageTimestamp.classList.add('msg-timestamp')
            messageTimestamp.textContent = data.timestampUtc
            messageBody.appendChild(messageSender)
            messageBody.appendChild(actualMessage)
            messageBody.appendChild(messageTimestamp)

            listItem.appendChild(userCircle)
            listItem.appendChild(messageBody)
        } else {
            // Message is from this user (outgoing).
            let messageBody = document.createElement('div')
            messageBody.classList.add('interal-msg-body')
            let actualMessage = document.createElement('span')
            actualMessage.classList.add('msg-actual')
            actualMessage.textContent = data.message
            let messageTimestamp = document.createElement('span')
            messageTimestamp.classList.add('msg-timestamp')
            messageTimestamp.textContent = data.timestampUtc
            messageBody.appendChild(actualMessage)
            messageBody.appendChild(messageTimestamp)

            listItem.append(messageBody)
        }

        messageList.appendChild(listItem)
    })


    // Typing indicator.
    let info = document.querySelector('.info')
    message.addEventListener('keypress', e => {
        if(e.key === "Enter"){
            messageBtn.click()
        } else {
            socket.emit('typing')
        }
    })

    //socket.on('typing', data => {
    //    info.textContent = data.username + " is typing..."
    //    setTimeout(() => {info.textContent=''}, 2000)
    //})

    // User is afk.
    let afkButton = document.querySelector('#afkButton')
    afkButton.addEventListener('click', e =>{
        console.log(currentUser.username + " is afk")
    })


    // Moving my avatar.
    let body = document.querySelector('body')
    let currentPositionX = 0
    let currentPositionY = 0
    let moveAvatar = false
    maincanvas.addEventListener('mousemove', e => {
        currentPositionX = e.clientX
        currentPositionY = e.clientY

        if(moveAvatar){
            //console.log('Position: ' + currentPositionX + "|" + currentPositionY)
            myAvatar.style.left = currentPositionX + "px"
            myAvatar.style.top = currentPositionY + "px"
            socket.emit('avatarMoves', {uniqueId: currentUser.uniqueId, username: currentUser.username, positionX: currentPositionX, positionY: currentPositionY})
        }
    })

    let mousedownId = -1
    console.log("myAvatar " + myAvatar)
    maincanvas.addEventListener('mousedown', e =>{
        if(e.target.id === 'my-avatar'){
            e.preventDefault()

            //Prevent multiple loops!
            if(mousedownId==-1)  {
                mousedownId = setInterval(whilemousedown, 150 /*execute every 150ms*/);
            }
        }
    })

    function whilemousedown(){
        moveAvatar = true
    }

    maincanvas.addEventListener('mouseup', e =>{
        //Only stop if exists
        if(mousedownId!=-1) {
            clearInterval(mousedownId);
            mousedownId=-1;
        }
        moveAvatar = false
    })

    // Get the movement of other avatars.
    socket.on('avatarMoves', data => {
        if(data.uniqueId !== currentUser.uniqueId){
            console.log("Avatar of " + data.username + " moves to " + data.positionX + "|" + data.positionY)
            let avatar = maincanvas.querySelector("[id='"+data.uniqueId+"'")
            avatar.style.left = data.positionX + "px"
            avatar.style.top = data.positionY + "px"
        }

    })

})()