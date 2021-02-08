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

(function connect(){
    let socket = io.connect('http://localhost:3000')
    let currentUser = null
    let myAvatar = null
    let maincanvas = document.querySelector('#maincanvas')

    // Recieve my username from Server.
    socket.on('userConnected', data=>{
        currentUser = data.user
        console.log(currentUser)
    })

    // Update the userlist.
    let userList = document.querySelector('#currentUserList')
    function displayOnlineList(item, index){
        userList.innerHTML = "";

        let userItem = document.createElement('li')
        userItem.classList.add('nav-item')

        let userLink = document.createElement('a')
        userLink.classList.add('nav-link')
        userLink.textContent =  item.username

        userItem.appendChild(userLink)
        userList.appendChild(userItem)
    }

    // Update avatar positions
    function displayAvatars(item, index){
        let avatar = document.createElement('img')
        avatar.src = item.avatarImg
        avatar.classList.add('avatar')
        avatar.style.left = item.positionX + "px"
        avatar.style.top = item.positionY + "px"

        if(item.username === currentUser.username){
            avatar.id = 'my-avatar'
            myAvatar = avatar
        }

        maincanvas.appendChild(avatar)
        console.log(avatar)
    }

    function displayUser(item, index){
        displayOnlineList(item, index)
        displayAvatars(item, index)
    }

    // Some other user joins.
    socket.on('user_joins', data => {
        // Refresh the current users / avatars.
        data.onlineList.forEach(displayUser)
    })

    // Some other user leaves.
    socket.on('user_leaves', data => {
        data.onlineList.forEach(displayUser)
    })

    // Message handling.
    let message = document.querySelector('#message')
    let messageBtn = document.querySelector('#messageBtn')
    let messageList = document.querySelector('#message-list')

    messageBtn.addEventListener('click', e => {
        let clientTime = new Date()
        let currentTimestampUtc = clientTime.toUTCString()
        socket.emit('new_message', {message: message.value, timestampUtc: currentTimestampUtc})
        message.value = ''
    })

    socket.on('receive_message', data => {
        let listItem = document.createElement('li')

        if(data.username != currentUser.username){
            // Message is from another user (incoming).
            let userCircle = document.createElement('div')
            userCircle.classList.add('msg-user-circle')
            let userInitials = document.createElement('span')
            userInitials.textContent = 'HP'
            userCircle.appendChild(userInitials)


            let messageBody = document.createElement('div')
            messageBody.classList.add('msg-body')
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

        }

        messageList.appendChild(listItem)
    })


    // Typing indicator.
    //let info = document.querySelector('.info')
    //message.addEventListener('keypress', e => {
    //    if(e.key === "Enter"){
    //        messageBtn.click()
    //    } else {
    //        socket.emit('typing')
    //    }
    //})

    //socket.on('typing', data => {
    //    info.textContent = data.username + " is typing..."
    //    setTimeout(() => {info.textContent=''}, 2000)
    //})


    // Moving my avatar.
    let body = document.querySelector('body')
    let imgAvatar = document.querySelector('#my-avatar')
    let currentPositionX = 0
    let currentPositionY = 0
    let moveAvatar = false
    body.addEventListener('mousemove', e => {
        currentPositionX = e.clientX
        currentPositionY = e.clientY

        if(moveAvatar){
            myAvatar.style.left = currentPositionX + "px"
            myAvatar.style.top = currentPositionY + "px"
            socket.emit('avatarMoves', {username: currentUser.username, positionX: currentPositionX, positionY: currentPositionY})
        }
    })

    let mousedownId = -1
    myAvatar.addEventListener('mousedown', e =>{
        e.preventDefault()
        //Prevent multimple loops!
        if(mousedownId==-1)  {
            mousedownId = setInterval(whilemousedown, 100 /*execute every 100ms*/);
        }
    })

    function whilemousedown(){
        moveAvatar = true
    }

    myAvatar.addEventListener('mouseup', e =>{
        //Only stop if exists
        if(mousedownId!=-1) {
            clearInterval(mousedownId);
            mousedownId=-1;
        }
        moveAvatar = false
    })
})()