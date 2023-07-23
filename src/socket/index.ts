import { Server } from 'socket.io';
import * as config from './config';
import { changeUserReadiness, checkUserNameExistence, clearUserCurrentRoom, getUserById, resetUsersReadiness, userJoin, userLeave } from '../helpers/userHelpers';
import { addUserToRoom, checkPlayersReadiness, checkRoomNameExistence, createRoom, deleteRoom, getActiveRooms, getRoomById, getRoomByName, makeRoomInvisible, makeRoomVisible, removeUserFromRoom } from '../helpers/roomsHelpers';
import { getRandomEnglishText } from '../helpers/selectText';
import { texts } from '../data';
import { addPlayer, checkGameFinish, clearGame, createGameRoom, getPlayers, removePlayer, setPlayerFinishTime, setPlayerProgress, sortResults } from '../helpers/gameHelpers';

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
					socket.emit('enterGameRoom', room)

					const rooms = getActiveRooms();
					io.emit('getActiveRooms', rooms, maximum_users_for_room);
				}
			});

			socket.on('userEnteredRoom', (roomId: string) => {
				const currentRoom = getRoomById(roomId);
				if (currentRoom) {
					socket.broadcast.to(currentRoom.name).emit('checkUsers', currentRoom)

				}
			})

			socket.on('LeaveRoom', (roomId: string) => {
				const currentRoom = getRoomById(roomId);

				if (currentRoom) {
					socket.leave(currentRoom.id);
					removeUserFromRoom(socket.id, roomId)
					clearUserCurrentRoom(socket.id)
					socket.broadcast.to(currentRoom.name).emit('checkUsers', currentRoom)

					if (currentRoom.activeUsers.length === 0) {
						deleteRoom(roomId)
					}

					const playersAreReady = checkPlayersReadiness(currentRoom.id);
					if (playersAreReady) {
						const timeToWait = config.SECONDS_TIMER_BEFORE_START_GAME
						makeRoomInvisible(currentRoom.id)
						const text = getRandomEnglishText(texts)
						io.to(currentRoom.name).emit('startTimer', { time: timeToWait, text })
					}
				}

				const rooms = getActiveRooms();
				io.emit('getActiveRooms', rooms, maximum_users_for_room);
			})

			socket.on('readinessChanged', () => {
				const id = socket.id;
				const user = getUserById(id);
				if (user) {
					changeUserReadiness(id);
					const currentRoom = getRoomByName(user.currentRoom)
					if (currentRoom) {
						io.to(user.currentRoom).emit('userReadinessChanged', currentRoom)

						const playersAreReady = checkPlayersReadiness(currentRoom.id);
						if (playersAreReady) {
							const timeToWait = config.SECONDS_TIMER_BEFORE_START_GAME
							makeRoomInvisible(currentRoom.id)
							const text = getRandomEnglishText(texts)
							io.to(currentRoom.name).emit('startTimer', { time: timeToWait, text })
							const rooms = getActiveRooms();
							io.emit('getActiveRooms', rooms, maximum_users_for_room);
						}
					}
				}
			})



			socket.on('GameStart', () => {
				const user = getUserById(socket.id);
				if (user) {
					const room = getRoomByName(user.currentRoom);


					if (room) {
						createGameRoom(room.name)
						const players = room.activeUsers;
						players.forEach(player => addPlayer(player.userName, room.name))

						const gameTime = config.SECONDS_FOR_GAME

						io.to(user.currentRoom).emit('RaceStart', { gameTime });
					}
				}
			});

			socket.on('PlayerProgress', (progress: number) => {
				const user = getUserById(socket.id);
				if (user) {
					const userName = user.userName;
					setPlayerProgress(userName, progress, user.currentRoom)
					const playersData = getPlayers(user.currentRoom)
					io.to(user.currentRoom).emit('checkProgress', playersData)
				}
			})



			socket.on('PlayerFinished', (time: number) => {
				const user = getUserById(socket.id);

				if (user) {
					const userName = user.userName;

					setPlayerFinishTime(userName, time, user.currentRoom);

					const gameIsOver = checkGameFinish(user.currentRoom);

					if (gameIsOver) {
						const sortedPlayers = sortResults(user.currentRoom);
						io.to(user.currentRoom).emit('gameIsOver', sortedPlayers)
					}
				}
			})


			socket.on('TimeIsOut', () => {
				const user = getUserById(socket.id);
				if (user) {
					const sortedPlayers = sortResults(user.currentRoom);
					io.to(user.currentRoom).emit('gameIsOver', sortedPlayers)
				}
			})

			socket.on('ResetGame', () => {
				const id = socket.id;
				const user = getUserById(id);
				if (user) {
					resetUsersReadiness(user.currentRoom);
					clearGame(user.currentRoom)
					const currentRoom = getRoomByName(user.currentRoom)
					if (currentRoom) {
						if (currentRoom.activeUsers.length < maximum_users_for_room) {
							makeRoomVisible(currentRoom.id)
							const rooms = getActiveRooms();
							io.emit('getActiveRooms', rooms, maximum_users_for_room);
						}
						io.to(user.currentRoom).emit('userReadinessChanged', currentRoom)

						const playersAreReady = checkPlayersReadiness(currentRoom.id);
						if (playersAreReady) {
							const timeToWait = config.SECONDS_TIMER_BEFORE_START_GAME
							makeRoomInvisible(currentRoom.id)
							const text = getRandomEnglishText(texts)
							io.to(currentRoom.name).emit('startTimer', { time: timeToWait, text })
							const rooms = getActiveRooms();
							io.emit('getActiveRooms', rooms, maximum_users_for_room);
						}
					}
				}
			})



			socket.on('disconnect', () => {
				const user = getUserById(socket.id)
				if (user) {
					const room = getRoomByName(user.currentRoom)

					if (room) {
						socket.leave(room.id);
						removeUserFromRoom(socket.id, room.id)
						clearUserCurrentRoom(socket.id)
						socket.broadcast.to(room.name).emit('checkUsers', room)

						if (room.activeUsers.length === 0) {
							deleteRoom(room.id)
						}

						userLeave(socket.id);

						const playersAreReady = checkPlayersReadiness(room.id);
						if (playersAreReady) {
							const timeToWait = config.SECONDS_TIMER_BEFORE_START_GAME
							io.to(user.currentRoom).emit('startTimer', timeToWait)
							const rooms = getActiveRooms();
							io.emit('getActiveRooms', rooms, maximum_users_for_room);
						}
						removePlayer(user.userName, user.currentRoom)

						const gameIsOver = checkGameFinish(user.currentRoom);

						if (gameIsOver) {
							const sortedPlayers = sortResults(user.currentRoom);
							io.to(room.name).emit('gameIsOver', sortedPlayers)
						}

					}
				}



				const rooms = getActiveRooms();
				io.emit('getActiveRooms', rooms, maximum_users_for_room);
			});
		}
	});
};
