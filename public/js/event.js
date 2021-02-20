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

    showOn(canvas){
        let logo = document.createElement('a')
        logo.href = this.link
        logo.classList.add('roomLink')
        logo.style.top = this.positionY + "px"
        logo.style.left = this.positionX + "px"

        let logoImg = document.createElement('img')
        logoImg.src = this.img

        let logoLabel = document.createElement('span')
        logoLabel.innerHTML = this.label

        logo.appendChild(logoImg)
        logo.appendChild(logoLabel)
        canvas.appendChild(logo)

        logo.addEventListener('mouseover', e=>{
            e.preventDefault()
            console.log("overlap with " + this.label)
        })
    }
}

class mediaFrame {
    constructor(link, width, height, positionX, positionY) {
        this.link = link
        this.width = width
        this.height = height
        this.positionX = positionX
        this.positionY = positionY
    }

    showOn(canvas){
        let frame = document.createElement('iframe')
        frame.src = this.link
        frame.referrerpolicy = "no-referrer"
        frame.allowpaymentrequest = "false"
        frame.loading = "eager"
        frame.classList.add('mediaFrame')
        frame.style.top = this.positionY + "px"
        frame.style.left = this.positionX + "px"
        frame.height = this.height
        frame.width = this.width

        canvas.appendChild(frame)
    }
}

(function connect(){
    let socket = io.connect('localhost:3000', {
        withCredentials: true
    })
    // Make sure every username is unique for now.
    let randomDelta = Math.floor(Math.random()*250)
    // Get a random avatar.
    let currentUser = new User(randomDelta, randomDelta, '../img/avatars/turquoise.png', (500 + randomDelta), (500 + randomDelta))
    let myAvatar = document.createElement('img')
    let maincanvas = document.querySelector('#maincanvas')
    let avatarList = []
    let roomElementList = []
    roomElementList.push(new RoomLink("Kino", "#", "../img/icons/cinema.png", 600, 600))
    roomElementList.push(new RoomLink("Lupe", "#", "../img/icons/magnifier.png", 500, 500))
    //roomElementList.push(new mediaFrame("https://google.de", 300, 300, 600, 300))



    // Tell server, who we are.
    socket.emit('userConnected', {user: currentUser})

    function renderBackground(room){
        maincanvas.style.background = 'url("../img/backgrounds/rondell.png")'
        maincanvas.style.backgroundRepeat = 'no-repeat'
        maincanvas.style.backgroundPosition = 'center center'

        console.log("background")
    }
    renderBackground()

    function showElements(item, index){
        item.showOn(maincanvas)
    }

    function displayRoomElements(){
        roomElementList.forEach(showElements)
    }

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

        displayRoomElements()
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
        //TODO: Open modal with bathroom
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