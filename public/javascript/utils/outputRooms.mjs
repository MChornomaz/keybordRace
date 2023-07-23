import { socket } from "../game.mjs"
import { appendRoomElement, updateNumberOfUsersInRoom } from "../views/room.mjs"


export function outputRooms (rooms, maxUsers) {
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
		}
	}
	appendRoomElement(roomData)
		}
	})
}