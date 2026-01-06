export interface User {
  id: string;
  username: string;
}

export interface Message {
  id: string;
  content: string;
  author: User;
  created_at: string;
}
