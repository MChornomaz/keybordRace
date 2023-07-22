import { showInputModal, showMessageModal } from "./views/modal.mjs";
import { appendRoomElement, updateNumberOfUsersInRoom } from "./views/room.mjs";

const username = sessionStorage.getItem('username');

if (!username) {
	window.location.replace('/login');
}

const fetchRooms = async () => {
	try {
		const data = await fetch('http://localhost:3002/game/rooms')
		const rooms = await data.json()
		outputRooms(rooms)
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

// socket.on('roomCreated', (roomId) => {
// 	socket.emit('JoinRoom', roomId)
// })

createRoomBtn.addEventListener('click', createRoomBtnClickHandler)



socket.on('roomExists', (roomName) => {
	const errorMessage = `Sorry, room with name - ${roomName} already exists. Please enter another name`
	showMessageModal({message: errorMessage, onClose: createRoomBtnClickHandler})
})



function outputRooms (rooms) {
	const roomsContainer = document.querySelector('#rooms-wrapper');
	roomsContainer.innerHTML = ''
	rooms.forEach(room => {
		const roomData = {
		name: room.name,
		numberOfUsers: room.activeUsers.length,
		onJoin : () => {
			socket.emit('JoinRoom', room.id)
			updateNumberOfUsersInRoom({name: room.name, numberOfUsers: room.activeUsers.length + 1})
		}
	}
	appendRoomElement(roomData)
	})
}

socket.on('getActiveRooms', (rooms) => {
	outputRooms(rooms)
})

socket.on('updateRoomUserCount', ({name, numberOfUsers}) => {
	updateNumberOfUsersInRoom({name, numberOfUsers})
})



