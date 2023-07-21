export interface User {
  id: string;
  userName: string;
  currentRoom: string;
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
  const user = { id, userName, currentRoom }

  activeUsers.push(user);
  return user
}


export const userLeave = (id: string) => {
  activeUsers = activeUsers.filter(user => user.id !== id)
}