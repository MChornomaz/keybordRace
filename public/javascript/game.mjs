import { startGame } from "./helpers/startGame.mjs";
import { outputRooms } from "./utils/outputRooms.mjs";
import { startTimer } from "./utils/timer.mjs";
import { showInputModal, showMessageModal, showResultsModal } from "./views/modal.mjs";
import {  removeRoomElement, updateNumberOfUsersInRoom } from "./views/room.mjs";
import { appendUserElement, setProgress} from "./views/user.mjs";

const username = sessionStorage.getItem('username');
sessionStorage.removeItem('roomId');

if (!username) {
	window.location.replace('/login');
}

const readyBtn = document.getElementById('ready-btn');
const leaveRoomBtn = document.getElementById('quit-room-btn');
const createRoomBtn = document.getElementById('add-room-btn');
const gamePage = document.getElementById('game-page')
const roomPage = document.getElementById('rooms-page')
const roomsContainer = document.querySelector('#rooms-wrapper');
const readyTimerElement = document.getElementById('timer');
const gameTimerElement = document.getElementById('game-timer-seconds');
const gameTimerContainer = document.getElementById('game-timer');

let gameText = '';
let newRoomName = '';

const fetchRooms = async () => {
	try {
		const data = await fetch('https://keybordrace.onrender.com/game/rooms')
		const roomsData = await data.json()
		outputRooms(roomsData.rooms, roomsData.maxUsers)
	} catch (error) {
		console.log(error.message)
	}
}

fetchRooms()

export const socket = io('', { query: { username } });

socket.emit('checkUserNameExistence', username)
socket.on('userExists', () => {
	const errorMessage = `Sorry, user with name - ${username} already exists. Please enter another name`
	showMessageModal({message: errorMessage, onClose: closeErrorModal})
})

function closeErrorModal(){
	socket.emit('disconnectUser')
	sessionStorage.removeItem('username')
	window.location.replace('/login');
}

const roomNameChangeHandler = (value) => {
	newRoomName = value;
}

const createRoom = (roomName) => {
	socket.emit('createRoom', newRoomName)
}

const createRoomBtnClickHandler = () => {
	showInputModal({
		title: 'Enter the name of the room',
		onChange: roomNameChangeHandler,
		onSubmit: createRoom
	})
}

const showGame = () => {
	gamePage.classList.remove('display-none')
	roomPage.classList.add('display-none')
}

socket.on('roomCreated', (roomId) => {
	socket.emit('JoinRoom', roomId)
	sessionStorage.setItem('roomId', roomId)
})

createRoomBtn.addEventListener('click', createRoomBtnClickHandler)

socket.on('roomExists', (roomName) => {
	const errorMessage = `Sorry, room with name - ${roomName} already exists. Please enter another name`
	showMessageModal({message: errorMessage, onClose: createRoomBtnClickHandler})
})

const showGameLobby = (room) => {
	showGame();
	const usersContainer = document.querySelector('#users-wrapper');
	if(usersContainer){
		usersContainer.innerHTML = ''
		room.activeUsers.forEach(user => {
		const isCurrentUser = user.userName === username;
		appendUserElement({username: user.userName, ready: user.ready, isCurrentUser})
	})
		const roomHeading = document.getElementById('room-name');
		roomHeading.innerText = room.name
	}	
	}

socket.on('enterGameRoom', (room) => {
	showGameLobby(room)
	socket.emit('userEnteredRoom', room.id)
})

socket.on('checkUsers', room => {
	showGameLobby(room)
})

socket.on('getActiveRooms', (rooms, mavValue) => {
	outputRooms(rooms, mavValue)
})

socket.on('updateRoomUserCount', ({name, numberOfUsers, maxValue}) => {
	const currentUserAmount = document.querySelector(`.connected-users[data-room-name='${name}']`).dataset.roomNumberOfUsers;

	if(parseInt(currentUserAmount, 10) >= maxValue){
		removeRoomElement(name)
	} else {
		updateNumberOfUsersInRoom({name, numberOfUsers})
	}
})


const leaveRoomHandler = () => {
	const roomId = sessionStorage.getItem('roomId');
	socket.emit('LeaveRoom', roomId)
	sessionStorage.removeItem('roomId');
	roomsContainer.innerHTML = ''
	gamePage.classList.add('display-none')
	roomPage.classList.remove('display-none')
}

leaveRoomBtn.addEventListener('click', leaveRoomHandler)

const changeUserReadiness = () => {
	socket.emit('readinessChanged')
	if(readyBtn.innerText === 'READY'){
		readyBtn.innerText = 'NOT READY'
	} else{
		readyBtn.innerText = 'READY'
	}
}

socket.on('userReadinessChanged', room => {
		showGameLobby(room)
})


readyBtn.addEventListener('click', changeUserReadiness)

socket.on('startTimer', async ({time, text}) => {
	startTimer(parseInt(time, 10), readyTimerElement, ()=> {socket.emit('GameStart')})
	gameText = text;
})

const finishGameTimerHandler = () => {
	socket.emit('TimeIsOut')
	gameTimerContainer.classList.add('display-none')
}

const finishGameHandler = () => {
	const textContainer = document.getElementById('text-container');
	readyBtn.innerText = 'READY'
	readyBtn.classList.remove('display-none')
	leaveRoomBtn.classList.remove('display-none')
  textContainer.classList.add('display-none');
	textContainer.innerHTML = ''
	socket.emit('ResetGame')
}

socket.on('checkProgress', playersData => {
	playersData.forEach(player => setProgress({username: player.name, progress: player.progress}))
})

socket.on('RaceStart', ({  gameTime }) => {
    gameTimerContainer.classList.remove('display-none');
    const { clearTimer } = startTimer(parseInt(gameTime, 10),
        gameTimerElement,
        finishGameTimerHandler)


    startGame(gameText, (progress) => socket.emit('PlayerProgress', progress), (time) => {
        socket.emit('PlayerFinished', time);
    });

		socket.on('gameIsOver', playersData => {
			const modal = document.querySelector('.modal')
			if (!modal) {
            clearTimer();
            gameTimerContainer.classList.add('display-none');
            showResultsModal({ usersSortedArray: playersData, onClose: finishGameHandler });
					}
        });
});
