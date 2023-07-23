import { Server } from 'socket.io';
import { checkUserExistence, userEnteredRoomHandler, } from './actions/usersActions';
import { createRoomHandler, joinRoomHandler, leaveRoomHandler } from './actions/roomActions';
import { gameStartHandler, playerFinishedHandler, playerProgressHandler, readinessChangedHandler, resetGameHandler, timeIsOutHandler } from './actions/gameActions';
import { disconnectHandler } from './actions/disconnectActions';

export default (io: Server) => {
	io.on('connection', socket => {
		let username = socket.handshake.query.username;
		if (Array.isArray(username)) {
			username = username.join(' ')
		}

		if (username) {
			checkUserExistence(socket)

			createRoomHandler(socket, io);

			joinRoomHandler(socket, io)

			userEnteredRoomHandler(socket)

			leaveRoomHandler(socket, io)

			readinessChangedHandler(socket, io)

			gameStartHandler(socket, io)

			playerProgressHandler(socket, io)

			playerFinishedHandler(socket, io)

			timeIsOutHandler(socket, io)

			resetGameHandler(socket, io)

			disconnectHandler(socket, io)
		}
	});
};
