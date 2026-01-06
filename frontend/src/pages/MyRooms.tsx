import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import type { Room } from "../types/room";
import Layout from "../components/Layout";

const MyRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: remplacer par un fetch vers le backend pour récupérer les rooms créées par l'utilisateur
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRooms([
      {
        id: "1",
        name: "Room privée A",
        ownerId: "me",
        createdAt: "2026-01-06T00:00:00Z",
        updatedAt: "2026-01-06T00:00:00Z",
      },
      {
        id: "2",
        name: "Room privée B",
        ownerId: "me",
        createdAt: "2026-01-06T00:00:00Z",
        updatedAt: "2026-01-06T00:00:00Z",
      },
    ]);
  }, []);

  const handleOpenRoom = (roomId: string) => {
    navigate(`/rooms/${roomId}`);
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6">Mes Rooms</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card
              key={room.id}
              title={room.name}
              description="Room privée créée par vous"
              onClick={() => handleOpenRoom(room.id)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default MyRooms;
