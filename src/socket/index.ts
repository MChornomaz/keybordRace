import { Server } from 'socket.io';
import * as config from './config';
import { checkUserNameExistence, clearUserCurrentRoom, userJoin, userLeave } from '../helpers/userHelpers';
import { addUserToRoom, checkRoomNameExistence, createRoom, deleteRoom, getActiveRooms, getRoomById, removeUserFromRoom } from '../helpers/roomsHelpers';

export default (io: Server) => {
	io.on('connection', socket => {
		let username = socket.handshake.query.username;
		const maximum_users_for_room = config.MAXIMUM_USERS_FOR_ONE_ROOM;
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
					socket.emit('roomCreated', roomId);

					const rooms = getActiveRooms();
					io.emit('getActiveRooms', rooms, maximum_users_for_room);
				}
			});

			socket.on('JoinRoom', (roomId: string) => {
				const room = getRoomById(roomId);
				if (room) {
					socket.join(room.name);
					addUserToRoom(socket.id, roomId);

					socket.emit('updateRoomUserCount', { name: room.name, numberOfUsers: room.activeUsers.length, maxValue: maximum_users_for_room });

					const rooms = getActiveRooms();
					io.emit('getActiveRooms', rooms, maximum_users_for_room);
				}
			});

			socket.on('LeaveRoom', (roomId: string) => {
				const currentRoom = getRoomById(roomId);
				if (currentRoom) {
					socket.leave(currentRoom.id);
					removeUserFromRoom(socket.id, roomId)
					clearUserCurrentRoom(socket.id)

					if (currentRoom.activeUsers.length === 0) {
						deleteRoom(roomId)
					}
				}

				const rooms = getActiveRooms();
				io.emit('getActiveRooms', rooms, maximum_users_for_room);
			})

			socket.on('disconnect', () => {
				userLeave(socket.id);

				const rooms = getActiveRooms();
				io.emit('getActiveRooms', rooms, maximum_users_for_room);
			});
		}
	});
};
