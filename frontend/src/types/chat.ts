export interface User {
  id: string;
  username: string;
}

export interface Message {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}
