import { getRoomByName } from "./roomsHelpers";

export interface Player {
  name: string;
  progress: number;
  timeToFinish: number;
}

export interface Game {
  room: string;
  players: Player[]
}

let games: Game[] = [];

export const getRoom = (roomName: string) => {
  return games.find(game => game.room === roomName);
}
export const getPlayers = (roomName: string) => {
  const gameRoom = games.find(game => game.room === roomName)
  if (gameRoom) return gameRoom.players;
}

export const createGameRoom = (roomName: string) => {
  const index = games.findIndex(game => game.room === roomName);

  if (index === -1) {
    const newRoom: Game = {
      room: roomName,
      players: []
    }
    games.push(newRoom)
  }

}

export const checkPlayerExistence = (name: string, roomName: string) => {
  const players = getPlayers(roomName);

  if (players) {
    const index = players.findIndex(player => player.name === name)

    if (index === -1) {
      return false
    } else {
      return true
    }
  }
}

export const getPlayerByName = (name: string, roomName: string) => {
  const players = getPlayers(roomName)
  if (players) {
    const selectedPlayer = players.find(player => player.name === name);

    if (selectedPlayer) {
      return selectedPlayer
    }

    return null;
  }
}

export const addPlayer = (name: string, roomName: string) => {
  const players = getPlayers(roomName);
  if (players) {
    const newPlayer: Player = {
      name,
      progress: 0,
      timeToFinish: 0
    }

    const playerExists = checkPlayerExistence(name, roomName)

    if (!playerExists) {
      players.push(newPlayer)
    }
  }

}

export const removePlayer = (name: string, roomName: string) => {
  const playerExists = checkPlayerExistence(name, roomName);
  let players = getPlayers(roomName)
  const room = getRoom(roomName)


  if (playerExists && players && room) {
    players = players.filter(player => player.name !== name)
    room.players = players;
  }
}

export const setPlayerProgress = (name: string, progress: number, roomName) => {
  const selectedPlayer = getPlayerByName(name, roomName);
  if (selectedPlayer) {
    selectedPlayer.progress = progress
  }
}

export const setPlayerFinishTime = (name: string, finishTime: number, roomName: string) => {
  const selectedPlayer = getPlayerByName(name, roomName);
  if (selectedPlayer) {
    selectedPlayer.timeToFinish = finishTime
  }
}

export const checkGameFinish = (roomName: string): boolean => {
  const players = getPlayers(roomName)

  if (players) {
    const gameIsFinished = players.every(player => player.timeToFinish > 0);
    if (gameIsFinished) return true;
  }

  return false
}

export const sortResults = (roomName: string) => {
  const players = getPlayers(roomName);
  if (players) {
    const sortedPlayers = players.sort((a, b) => {
      if (a.timeToFinish > 0 && b.timeToFinish > 0) {
        return b.timeToFinish - a.timeToFinish;
      } else if (a.timeToFinish > 0) {
        return -1;
      } else if (b.timeToFinish > 0) {
        return 1;
      }

      return b.progress - a.progress;
    });

    const sortedPlayersArr = sortedPlayers.map(player => player.name)

    return sortedPlayersArr
  }

};

export const clearGame = (roomName: string) => {
  games = games.filter(game => game.room !== roomName)
}