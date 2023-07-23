export interface User {
  id: string;
  userName: string;
  currentRoom: string;
  ready: boolean;
}

let activeUsers: User[] = [];

export const checkUserNameExistence = (username: string): boolean => {
  const index = activeUsers.findIndex(
    user => user.userName.trim().toLowerCase() === username.trim().toLowerCase())

  if (index !== -1) {
    return true
  } else {
    return false
  }
}

export const userJoin = (id: string, userName: string, currentRoom: string) => {
  const user = { id, userName, currentRoom, ready: false }

  activeUsers.push(user);
  return user
}


export const userLeave = (id: string) => {
  activeUsers = activeUsers.filter(user => user.id !== id)
}

export const getUserById = (id: string): User | null => {
  const user = activeUsers.find(user => user.id === id);

  if (!user) return null

  return user

}

export const changeUserReadiness = (userId: string) => {
  const currentUser = getUserById(userId);
  if (currentUser) {
    currentUser.ready = !currentUser.ready;
  }
}

export const setUserRoom = (userId: string, roomName: string) => {
  const user = getUserById(userId);
  const userIndex = activeUsers.findIndex(user => user.id === userId);

  if (user && (userIndex !== -1)) {
    user.currentRoom = roomName;
    activeUsers[userIndex] = user;
  }
}

export const clearUserCurrentRoom = (userId: string) => {
  const user = getUserById(userId);
  if (user) {
    user.currentRoom = ''
  }
}

export const resetUsersReadiness = (roomName: string) => {
  const selectedUsers = activeUsers.filter(user => user.currentRoom === roomName);

  if (selectedUsers) {
    selectedUsers.forEach(user => user.ready = false)
  }
}