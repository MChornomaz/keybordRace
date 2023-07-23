import { Socket } from 'socket.io';
import { checkUserNameExistence, userJoin } from '../../helpers/userHelpers';
import { getRoomById } from '../../helpers/roomsHelpers';

export function checkUserExistence(socket: Socket) {
  socket.on('checkUserNameExistence', (username) => {
    const userExists = checkUserNameExistence(username);
    if (userExists) {
      socket.emit('userExists');
    } else {
      userJoin(socket.id, username, '');
    }
  });
}

export function userEnteredRoomHandler(socket: Socket) {
  socket.on('userEnteredRoom', (roomId: string) => {
    const currentRoom = getRoomById(roomId);
    if (currentRoom) {
      socket.broadcast.to(currentRoom.name).emit('checkUsers', currentRoom)
    }
  })
}
