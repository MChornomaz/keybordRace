import { User, getUserById, setUserRoom } from "./userHelpers";

export interface Room {
  id: string;
  name: string;
  activeUsers: User[];
}

let activeRooms: Room[] = [];

export const getActiveRooms = (): Room[] => {
  return activeRooms
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
    activeUsers: []
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

export const addUserToRoom = (userId: string, roomId: string) => {
  const user = getUserById(userId);
  const room = getRoomById(roomId);

  if (user && room) {
    room.activeUsers.push(user);
    setUserRoom(userId, room.name)
  }
}