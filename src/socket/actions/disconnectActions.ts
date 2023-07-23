import { Server, Socket } from 'socket.io';
import { clearUserCurrentRoom, getUserById, userLeave } from '../../helpers/userHelpers';
import { checkPlayersReadiness, deleteRoom, getRoomByName, removeUserFromRoom } from '../../helpers/roomsHelpers';
import { SECONDS_TIMER_BEFORE_START_GAME } from '../config';
import { refreshActiveRooms } from './roomActions';
import { checkGameFinish, removePlayer, sortResults } from '../../helpers/gameHelpers';


export function disconnectHandler(socket: Socket, io: Server) {
  socket.on('disconnect', () => {
    const user = getUserById(socket.id)
    if (user) {
      const room = getRoomByName(user.currentRoom)

      if (room) {
        removePlayer(user.userName, user.currentRoom)
        const gameIsOver = checkGameFinish(user.currentRoom);
        if (gameIsOver) {
          const sortedPlayers = sortResults(user.currentRoom);
          console.log('sorted', sortedPlayers)
          io.to(room.name).emit('gameIsOver', sortedPlayers)
        }
        socket.leave(room.id);
        socket.broadcast.to(room.name).emit('checkUsers', room)

        removeUserFromRoom(socket.id, room.id)
        clearUserCurrentRoom(socket.id)
        if (room.activeUsers.length === 0) {
          deleteRoom(room.id)
        }

        const playersAreReady = checkPlayersReadiness(room.id);
        if (playersAreReady) {
          const timeToWait = SECONDS_TIMER_BEFORE_START_GAME
          io.to(user.currentRoom).emit('startTimer', timeToWait)
          refreshActiveRooms(io)
        }
      }
      userLeave(socket.id);

    }
    refreshActiveRooms(io)
  });
}