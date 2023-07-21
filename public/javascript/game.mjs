import { showMessageModal } from "./views/modal.mjs";

const username = sessionStorage.getItem('username');

if (!username) {
	window.location.replace('/login');
}

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