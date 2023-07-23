import { Server, Socket } from 'socket.io';
import { addUserToRoom, checkPlayersReadiness, checkRoomNameExistence, createRoom, deleteRoom, getRoomById, getVisibleRooms, makeRoomInvisible, removeUserFromRoom } from '../../helpers/roomsHelpers';
import { MAXIMUM_USERS_FOR_ONE_ROOM, SECONDS_TIMER_BEFORE_START_GAME } from '../config';
import { clearUserCurrentRoom } from '../../helpers/userHelpers';
import { getRandomEnglishText } from '../../helpers/selectText';
import { texts } from '../../data';


export const refreshActiveRooms = (io: Server) => {
  const rooms = getVisibleRooms();
  io.emit('getActiveRooms', rooms, MAXIMUM_USERS_FOR_ONE_ROOM);
}

export function createRoomHandler(socket: Socket, io: Server) {
  socket.on('createRoom', (roomName: string) => {
    const roomNameExists = checkRoomNameExistence(roomName);
    if (roomNameExists) {
      socket.emit('roomExists', roomName);
    } else {
      const newRoom = createRoom(roomName);
      const roomId = newRoom.id;
      socket.emit('roomCreated', roomId);

      refreshActiveRooms(io)
    }
  });
}

export function joinRoomHandler(socket: Socket, io: Server) {
  socket.on('JoinRoom', (roomId: string) => {
    const room = getRoomById(roomId);
    if (room) {
      socket.join(room.name);
      addUserToRoom(socket.id, roomId);

      socket.emit('updateRoomUserCount', {
        name: room.name,
        numberOfUsers: room.activeUsers.length,
        maxValue: MAXIMUM_USERS_FOR_ONE_ROOM
      });
      socket.emit('enterGameRoom', room)

      refreshActiveRooms(io)
    }
  });
}


export function leaveRoomHandler(socket: Socket, io: Server) {
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
        const timeToWait = SECONDS_TIMER_BEFORE_START_GAME
        makeRoomInvisible(currentRoom.id)
        const text = getRandomEnglishText(texts)
        io.to(currentRoom.name).emit('startTimer', { time: timeToWait, text })
      }
    }

    refreshActiveRooms(io)
  })
}














