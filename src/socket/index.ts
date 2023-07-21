import { Server } from 'socket.io';
import * as config from './config';
import { checkUserNameExistence, userJoin, userLeave } from '../helpers/userHelpers';

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
					userJoin(socket.id, username, '')
				}

			});


			socket.on('disconnect', () => userLeave(socket.id))
		}
	});
};
