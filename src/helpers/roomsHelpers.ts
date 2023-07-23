import { MAXIMUM_USERS_FOR_ONE_ROOM } from "../socket/config";
import { User, getUserById, setUserRoom } from "./userHelpers";

export interface Room {
  id: string;
  name: string;
  activeUsers: User[];
  isVisible: boolean
}

let activeRooms: Room[] = [];

export const getActiveRooms = (): Room[] => {
  return activeRooms.filter(room => room.isVisible)
}



export const getVisibleRooms = () => {
  return activeRooms.filter(room => room.isVisible)
}

export const checkRoomNameExistence = (roomName: string): boolean => {
  const index = activeRooms.findIndex(
    room => room.name.trim().toLowerCase() === roomName.trim().toLowerCase())

  if (index !== -1) {
    return true
  } else {
    return false
  }
}

export const createRoom = (roomName: string): Room => {
  const roomId = Date.now().toString() + (Math.floor(Math.random() * 100)).toString();
  const newRoom = {
    id: roomId,
    name: roomName,
    activeUsers: [],
    isVisible: true
  }

  activeRooms.push(newRoom);

  return newRoom
}

export const deleteRoom = (id: string) => {
  const index = activeRooms.findIndex(room => room.id === id)

  if (index !== -1) {
    activeRooms = activeRooms.filter(room => room.id !== id)
  }
}

export const getRoomById = (id: string): Room | null => {
  const room = activeRooms.find(room => room.id === id);
  if (!room) return null;

  return room
}

export const makeRoomVisible = (roomId: string) => {
  const room = getRoomById(roomId);
  if (room) {
    room.isVisible = true;
  }
}

export const makeRoomInvisible = (roomId: string) => {
  const room = getRoomById(roomId);
  if (room) {
    room.isVisible = false;
  }
}

export const getRoomByName = (name: string): Room | null => {
  const room = activeRooms.find(room => room.name === name);
  if (!room) return null;

  return room
}

export const addUserToRoom = (userId: string, roomId: string) => {
  const user = getUserById(userId);
  const room = getRoomById(roomId);

  if (user && room) {
    room.activeUsers.push(user);
    setUserRoom(userId, room.name)
    if (room.activeUsers.length >= MAXIMUM_USERS_FOR_ONE_ROOM) {
      makeRoomInvisible(roomId)
    } else {
      makeRoomVisible(roomId)
    }
  }
}

export const removeUserFromRoom = (userId: string, roomId: string) => {
  const user = getUserById(userId);
  const room = getRoomById(roomId);

  if (user && room) {
    room.activeUsers = room.activeUsers.filter(user => user.id !== userId)
    setUserRoom(userId, '')
  }
}


export const checkPlayersReadiness = (roomId: string): boolean => {
  const room = getRoomById(roomId);
  if (room) {
    const players = room.activeUsers;

    const playersAreReady = players.every(player => player.ready)
    return playersAreReady
  }
  return false
}
