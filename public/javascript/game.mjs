import { showInputModal, showMessageModal } from "./views/modal.mjs";
import { appendRoomElement, removeRoomElement, updateNumberOfUsersInRoom } from "./views/room.mjs";

const username = sessionStorage.getItem('username');
sessionStorage.removeItem('roomId');

if (!username) {
	window.location.replace('/login');
}

const fetchRooms = async () => {
	try {
		const data = await fetch('http://localhost:3002/game/rooms')
		const roomsData = await data.json()
		outputRooms(roomsData.rooms, roomsData.maxUsers)
	} catch (error) {
		console.log(error.message)
	}
}

fetchRooms()

const socket = io('', { query: { username } });

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

const createRoomBtn = document.getElementById('add-room-btn');

let newRoomName = '';

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

const gamePage = document.getElementById('game-page')
const roomPage = document.getElementById('rooms-page')

socket.on('roomCreated', (roomId) => {
	socket.emit('JoinRoom', roomId)
	sessionStorage.setItem('roomId', roomId)
	showGame()
})

createRoomBtn.addEventListener('click', createRoomBtnClickHandler)



socket.on('roomExists', (roomName) => {
	const errorMessage = `Sorry, room with name - ${roomName} already exists. Please enter another name`
	showMessageModal({message: errorMessage, onClose: createRoomBtnClickHandler})
})



function outputRooms (rooms, maxUsers) {
	const roomsContainer = document.querySelector('#rooms-wrapper');
	roomsContainer.innerHTML = ''
	rooms.forEach(room => {

		if(room.activeUsers.length < maxUsers){
			const roomData = {
				name: room.name,
				numberOfUsers: room.activeUsers.length,
				onJoin : () => {
					socket.emit('JoinRoom', room.id)
					updateNumberOfUsersInRoom({name: room.name, numberOfUsers: room.activeUsers.length + 1})
					sessionStorage.setItem('roomId', room.id)
					showGame()
		}
	}
	appendRoomElement(roomData)
		}
	})
}

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

const leaveRoomBtn = document.getElementById('quit-room-btn');

const leaveRoomHandler = () => {
	const roomId = sessionStorage.getItem('roomId');
	socket.emit('LeaveRoom', roomId)
	sessionStorage.removeItem('roomId');
	gamePage.classList.add('display-none')
	roomPage.classList.remove('display-none')
}

leaveRoomBtn.addEventListener('click', leaveRoomHandler)



