// frontend/src/types/room.ts
export interface Room {
  id: number;
  name: string;
  ownerUserId: string;
  ownerUsernameSnapshot: string | null;
  createdAt: string; // ISO string
}

export interface RoomMemberDTO {
  userId: string;
  usernameSnapshot: string | null;
  joinedAt: string; // ISO string
}

export interface RoomDetailsDTO {
  room: Room;
  members: RoomMemberDTO[];
}
