import { Server, Socket } from 'socket.io';
import { changeUserReadiness, getUserById, resetUsersReadiness } from '../../helpers/userHelpers';
import { checkPlayersReadiness, getRoomByName, makeRoomInvisible, makeRoomVisible } from '../../helpers/roomsHelpers';
import { MAXIMUM_USERS_FOR_ONE_ROOM, SECONDS_FOR_GAME, SECONDS_TIMER_BEFORE_START_GAME } from '../config';
import { getRandomEnglishText } from '../../helpers/selectText';
import { texts } from '../../data';
import { refreshActiveRooms } from './roomActions';
import { addPlayer, checkGameFinish, clearGame, createGameRoom, getPlayers, setPlayerFinishTime, setPlayerProgress, sortResults } from '../../helpers/gameHelpers';


export function readinessChangedHandler(socket: Socket, io: Server) {
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
          const timeToWait = SECONDS_TIMER_BEFORE_START_GAME
          makeRoomInvisible(currentRoom.id)
          const text = getRandomEnglishText(texts)
          io.to(currentRoom.name).emit('startTimer', { time: timeToWait, text })

          refreshActiveRooms(io)
        }
      }
    }
  })
}


export function gameStartHandler(socket: Socket, io: Server) {
  socket.on('GameStart', () => {
    const user = getUserById(socket.id);
    if (user) {
      const room = getRoomByName(user.currentRoom);

      if (room) {
        createGameRoom(room.name)
        const players = room.activeUsers;
        players.forEach(player => addPlayer(player.userName, room.name))

        const gameTime = SECONDS_FOR_GAME

        io.to(user.currentRoom).emit('RaceStart', { gameTime });
      }
    }
  });
}


export function playerProgressHandler(socket: Socket, io: Server) {
  socket.on('PlayerProgress', (progress: number) => {
    const user = getUserById(socket.id);
    if (user) {
      const userName = user.userName;
      setPlayerProgress(userName, progress, user.currentRoom)
      const playersData = getPlayers(user.currentRoom)
      io.to(user.currentRoom).emit('checkProgress', playersData)
    }
  })
}

export function playerFinishedHandler(socket: Socket, io: Server) {
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
}

export function timeIsOutHandler(socket: Socket, io: Server) {
  socket.on('TimeIsOut', () => {
    const user = getUserById(socket.id);
    if (user) {
      const sortedPlayers = sortResults(user.currentRoom);
      console.log(sortResults)
      io.to(user.currentRoom).emit('gameIsOver', sortedPlayers)
    }
  })
}


export function resetGameHandler(socket: Socket, io: Server) {
  socket.on('ResetGame', () => {
    const id = socket.id;
    const user = getUserById(id);
    if (user) {
      resetUsersReadiness(user.id);
      clearGame(user.currentRoom)
      const currentRoom = getRoomByName(user.currentRoom)
      if (currentRoom) {
        if (currentRoom.activeUsers.length < MAXIMUM_USERS_FOR_ONE_ROOM) {
          makeRoomVisible(currentRoom.id)
          refreshActiveRooms(io)
        }
        io.to(user.currentRoom).emit('userReadinessChanged', currentRoom)

        const playersAreReady = checkPlayersReadiness(currentRoom.id);
        if (playersAreReady) {
          const timeToWait = SECONDS_TIMER_BEFORE_START_GAME
          makeRoomInvisible(currentRoom.id)
          const text = getRandomEnglishText(texts)
          io.to(currentRoom.name).emit('startTimer', { time: timeToWait, text })
          refreshActiveRooms(io)
        }
      }
    }
  })
}













