import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import type { Room } from "../types/room";
import Layout from "../components/Layout";
import { roomsService } from "../services/roomsService";
import { useAuth } from "../context/useAuth";

const MyRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const userRooms = await roomsService.getUserRooms();
        // Filtrer le chat général (ne pas l'afficher dans "Mes Rooms")
        const filteredRooms = userRooms.filter((room) => room.name !== "general");
        setRooms(filteredRooms);
      } catch (err) {
        console.error("Erreur lors de la récupération des rooms :", err);
      }
    };

    fetchRooms();
  }, []);

  const handleOpenRoom = (roomId: number) => {
    navigate(`/rooms/${roomId}`);
  };

  const getRoomDescription = (room: Room): string => {
    if (room.ownerUserId === user?.id) {
      return "Room privée créée par vous";
    }
    const creatorName = room.ownerUsernameSnapshot || "un utilisateur";
    return `Room privée créée par ${creatorName}`;
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6">Mes Rooms</h1>
        {rooms.length === 0 ? (
          <p className="text-gray-600">Vous n'avez pas encore de rooms.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card
                key={room.id}
                title={room.name}
                description={getRoomDescription(room)}
                onClick={() => handleOpenRoom(room.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyRooms;
