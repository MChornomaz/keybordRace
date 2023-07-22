import { Server } from 'socket.io';
import * as config from './config';
import { checkUserNameExistence, userJoin, userLeave } from '../helpers/userHelpers';
import { addUserToRoom, checkRoomNameExistence, createRoom, getActiveRooms, getRoomById } from '../helpers/roomsHelpers';

export default (io: Server) => {
	io.on('connection', socket => {
		let username = socket.handshake.query.username;
		if (Array.isArray(username)) {
			username = username.join(' ')
		}

		if (username) {
			socket.on('checkUserNameExistence', (username) => {
				const userExists = checkUserNameExistence(username);
				if (userExists) {
					socket.emit('userExists');
				} else {
					userJoin(socket.id, username, '');
				}
			});

			socket.on('createRoom', (roomName: string) => {
				const roomNameExists = checkRoomNameExistence(roomName);
				if (roomNameExists) {
					socket.emit('roomExists', roomName);
				} else {
					const newRoom = createRoom(roomName);
					const roomId = newRoom.id;
					addUserToRoom(socket.id, roomId);
					socket.emit('roomCreated', roomId);

					const rooms = getActiveRooms();
					io.emit('getActiveRooms', rooms);
				}
			});

			socket.on('JoinRoom', (roomId: string) => {
				const room = getRoomById(roomId);
				if (room) {
					socket.join(room.name);
					addUserToRoom(socket.id, roomId);
					socket.emit('updateRoomUserCount', { name: room.name, numberOfUsers: room.activeUsers.length });

					const rooms = getActiveRooms();
					io.emit('getActiveRooms', rooms);
				}
			});

			socket.on('disconnect', () => {
				userLeave(socket.id);

				const rooms = getActiveRooms();
				io.emit('getActiveRooms', rooms);
			});
		}
	});
};
