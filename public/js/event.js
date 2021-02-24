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

// Global bool for avatar movement
var moveAvatar = false;
var maincanvas = document.querySelector('#maincanvas')
function renderBackground(room, canvas){
    console.log("Render Room " + room.id)
    let header = document.querySelector('#roomHeader')
    header.innerHTML = room.header

    canvas.classList.add('canvas')
    canvas.style.background = "url(" + room.img + ")"

    displayElements(room.elements, canvas)
}

function displayElements(elementList, canvas){
    if(elementList !== null){
        for(let i = 0; i < elementList.length; i++){
            elementList[i].showOn(canvas)
        }
    }
}

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

class Room{
    constructor(id, header, img, elements) {
        this.id = id
        this.header = header
        this.img = img
        this.elements = elements
    }
}

class RoomLink{
    constructor(id, label, link, img, mouseoverText, positionX, positionY) {
        this.id = id
        this.label = label
        this.link = link
        this.img = img
        this.mouseoverText = mouseoverText
        this.positionX = positionX
        this.positionY = positionY
    }

    showOn(canvas){
        if(canvas !== null){
            let logo = document.createElement('div')
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

            if(this.mouseoverText !== ""){
                let logoMouseover = document.createElement('div')
                logoMouseover.innerHTML = this.mouseoverText
                logoMouseover.id = this.id + "-mouseover"
                logoMouseover.classList.add("mouseoverText")
                logoMouseover.style.left = this.positionX + 0 + "px"
                logoMouseover.style.top = this.positionY + 75 + "px"

                canvas.appendChild(logoMouseover)
            }

            logo.addEventListener('mouseover', e => {
                e.preventDefault()
                console.log("mouseenter")

                if(moveAvatar){
                    if(this.link == "/kino"){
                        document.location.href = "/kino"
                    } else if(this.link == "/beratung"){
                        document.location.href="/beratung"
                    } else if(this.link == "/weltcafe"){
                        document.location.href="/weltcafe"
                    } else if(this.link == "/dashboard") {
                        document.location.href="/dashboard"
                    } else if(this.link == "/vortragsraum"){
                        document.location.href="/vortragsraum"
                    }

                    console.log("enter room " + this.link)
                }

                if(this.mouseoverText !== ""){
                    let tmp = document.getElementById(this.id + "-mouseover")
                    tmp.style.display = "block"
                    console.log("show mouseover text of " + this.label)
                }

            })

            logo.addEventListener('mouseout', e => {
                e.preventDefault()
                console.log("mouseleave")

                if(this.mouseoverText !== ""){
                    let tmp = document.getElementById(this.id+ "-mouseover")
                    tmp.style.display = "none"
                    console.log("close mouseover text of " + this.label)
                }


            })
            canvas.appendChild(logo)
        }
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
        if(canvas !== null){
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
}




(function connect(){

    /*
    let socket = io.connect('localhost:3000', {
        withCredentials: true
    })
    */


    let socket = io.connect('https://bfree.herokuapp.com:3000', {
        withCredentials: true
    })


    // Make sure every username is unique for now.
    let randomDelta
    // Get a random avatar.
    let currentUser
    let myAvatar = document.createElement('img')

    let avatarList = []


    /*
         * Init elements for afk modal at the beginning.
         */
    let afkBody = document.querySelector('#afkModalBody')
    let afkElementList = []
    afkElementList.push(new RoomLink("info", "", "#", "../img/icons/info.svg", "Hier kannst du eine kurze Verschnaufpause einlegen.<br/>Die anderen Teilnehmer sehen nicht, dass du hier bist.", 100, 35))
    afkElementList.push(new RoomLink("duschen","", "#", "../img/icons/magnifier.svg", "Stell dir vor du bist über 80 Jahre alt, könntest du noch sicher alleine duschen?", 100, 300))
    afkElementList.push(new RoomLink("toilette", "", "#", "../img/icons/magnifier.svg", "Stell dir vor du kannst nur noch auf einem Bein laufen, könntest du ohne Hilfe die Toilette benutzen?", 580, 400))
    afkElementList.push(new RoomLink("waschbecken","", "#", "../img/icons/magnifier.svg", "Stell dir vor du benötigst einen Rollstuhl, könntest du dir ohne Probleme die Hände waschen und dich im Spiegel sehen?", 1100, 200))
    let afkRoom = new Room("afkRoom", "", '../img/backgrounds/WC.png', afkElementList)
    renderBackground(afkRoom, afkBody)

    let kinoElementList = []
    kinoElementList.push(new mediaFrame("https://www.youtube.com/embed/Y52d-qe1Mw4", 650, 250, 800, 335))
    let kinoRoom = new Room("kinoRoom", "Kino", "../img/backgrounds/kino.png", kinoElementList)


    let dashboardElementList = []
    dashboardElementList.push(new RoomLink("acting", "Improtheater", "#", "../img/icons/acting.svg", "Acting mouseover text",980, 755))
    dashboardElementList.push(new RoomLink("barrier", "Gedankenschranken", "#", "../img/icons/barrier.svg", "Ausstellung: Gedankenschranken",880, 710))
    dashboardElementList.push(new RoomLink("building", "Partneruniversitäten", "#", "../img/icons/building.svg", "Stände der Partneruniversitäten",1260, 740))
    dashboardElementList.push(new RoomLink("lindemann", "Frau Hoene-Lindemann", "/beratung", "../img/icons/talk.png", "Beratungsstelle von Frau Hoene-Lindemann",  800, 520))
    dashboardElementList.push(new RoomLink("hummel", "Frau Hummel", "#", "../img/icons/talk.png", "Beratungsstelle von Frau Hummel",  850, 610))
    dashboardElementList.push(new RoomLink("conference", "Runder Tisch", "#", "../img/icons/desk.svg", "Austausch am runden Tisch",  1170, 230))
    dashboardElementList.push(new RoomLink("controller", "Onlinespiele", "#", "../img/icons/controller.svg", "Controller text", 890, 330))
    dashboardElementList.push(new RoomLink("meeting", "Tandempartnerschaften", "/beratung", "../img/icons/meeting.svg", "", 1350, 570))
    dashboardElementList.push(new RoomLink("headset", "IT-Abteilung", "#", "../img/icons/headset.svg", "", 1400, 460))
    dashboardElementList.push(new RoomLink("universalDesign", "Universal Design", "#", "../img/icons/lecture.svg", "", 1330, 670))
    dashboardElementList.push(new RoomLink("workshops", "Workshops", "#", "../img/icons/lecture.svg", "", 1200, 800))
    dashboardElementList.push(new RoomLink("living", "Emotionale Räume", "#", "../img/icons/living.png", "", 1330, 360))
    dashboardElementList.push(new RoomLink("sticker", "Sticker Aktion", "#", "../img/icons/postit.svg", "", 1275, 270))
    dashboardElementList.push(new RoomLink("projector", "Kinosaal", "/kino", "../img/icons/projector.svg", "", 970, 250))
    dashboardElementList.push(new RoomLink("theatre", "Vortragsraum", "/vortragsraum", "../img/icons/theatre.svg", "", 830, 410))
    dashboardElementList.push(new RoomLink("world", "Welt-Café", "/weltcafe", "../img/icons/world.svg", "", 1075, 790))
    let dashboardRoom = new Room("dashboard", "Hauptraum", "../img/backgrounds/rondell.png", dashboardElementList)

    let beratungElementList = []
    beratungElementList.push(new RoomLink("lifeChat", "", "#", "../img/icons/magnifier.svg", "Live-Chat mit Frau Hoene-Lindemann beitreten", 1175, 525))
    beratungElementList.push(new RoomLink("site", "", "#", "../img/icons/magnifier.svg", "Lebenslauf von Frau Hoen-Lindemann", 970, 490))
    beratungElementList.push(new RoomLink("contact", "", "#", "../img/icons/magnifier.svg", "Weitere Kontaktmöglichkeiten: <a href='https://www.frankfurt-university.de/de/erweiterungen/ansprechpartner/detail/alexandra-hoene-lindemann/?no_cache=1' target='_blank''>Hier</a>", 1400, 500))
    beratungElementList.push(new RoomLink("lindemannInfo", "", "#", "../img/icons/magnifier.svg", "Info-Broschüren, ausgewählt von Frau Hoene-Lindemann.", 1250, 630))
    let beratungRoom = new Room("lindemann", "Beratung", "../img/backgrounds/lindemann.png", beratungElementList)

    let vortragsraum = new Room("vortrag", "Vortragsraum", "../img/backgrounds/vortragsraum.png", null)

    let weltcafeRoom = new Room("weltcafe", "Welt-Café", "../img/backgrounds/weltcafe.png", null)






    socket.on('login', data => {
        console.log("loggedin with " + data.loginUsername + " and " + data.loginAvatar)
        randomDelta = Math.floor(Math.random()*500)
        currentUser = new User(randomDelta, data.loginUsername, data.loginAvatar, (250 + randomDelta), (250 + randomDelta))

        // Tell server, who we are.
        socket.emit('userConnected', {user: currentUser})
    })

    let param = window.location.href.split("/")
    let room = param[3]
    console.log("param = " + room)
    let currentRoom = dashboardRoom
    if(room == "kino"){
        currentRoom = kinoRoom
    } else if(room == "weltcafe") {
        currentRoom = weltcafeRoom
    } else if(room == "beratung") {
        currentRoom = beratungRoom
    } else if(room == "vortragsraum"){
        currentRoom = vortragsraum
    } else {
        currentRoom = dashboardRoom
    }

    renderBackground(currentRoom, maincanvas)

    if(currentRoom !== dashboardRoom){
        let door = new RoomLink("back", "Zurück zum Hauptraum", "/dashboard", "../img/icons/door.svg", "", 320, 150)
        door.showOn(maincanvas)
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
        document.querySelectorAll('.avatar').forEach(e => e.remove());
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

    socket.on('typing', data => {
        info.textContent = data.username + " tippt grade..."
        setTimeout(() => {info.textContent=''}, 2000)
    })

    // Moving my avatar.
    let currentPositionX = 0
    let currentPositionY = 0
    maincanvas.addEventListener('mousemove', e => {
        currentPositionX = e.clientX
        currentPositionY = e.clientY

        if(moveAvatar){
            console.log('Position: ' + currentPositionX + "|" + currentPositionY)
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
            //console.log("Avatar of " + data.username + " moves to " + data.positionX + "|" + data.positionY)
            let avatar = maincanvas.querySelector("[id='"+data.uniqueId+"'")
            avatar.style.left = data.positionX + "px"
            avatar.style.top = data.positionY + "px"
        }
    })

})()