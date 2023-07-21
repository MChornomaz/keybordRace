export interface User {
  id: string;
  userName: string;
  currentRoom: string;
}

const activeUsers: User[] = [];

