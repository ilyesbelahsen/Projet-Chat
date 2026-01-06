import React from "react";
import Card from "../components/Card";
import Modal from "../components/Modal";
import { MessageCircle, PlusCircle, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const HomePage: React.FC = () => {
  const [modal, setModal] = React.useState<null | "create">(null);
  const navigate = useNavigate();

  const handleCardClick = (type: "chat" | "myRooms" | "create") => {
    if (type === "chat") navigate("/chat");
    else if (type === "myRooms") navigate("/my-rooms");
    else if (type === "create") setModal("create");
  };

  const handleCreateRoom = (data: Record<string, string>) => {
    console.log("Création de room:", data);
    setModal(null);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-10">
        <h1 className="text-4xl font-bold mb-10 text-gray-800">
          Bienvenue sur Cloud Chat
        </h1>
        <p className="text-gray-600 mb-8 text-center max-w-xl">
          Discutez avec vos amis, créez vos rooms privées et consultez vos
          conversations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <Card
            title="Chat Général"
            onClick={() => handleCardClick("chat")}
            icon={MessageCircle}
            description="Accédez à la conversation principale avec tous les utilisateurs."
          />

          <Card
            title="Mes Rooms"
            onClick={() => handleCardClick("myRooms")}
            icon={List}
            description="Consultez vos rooms privées et leurs membres."
          />

          <Card
            title="Créer une Room"
            onClick={() => handleCardClick("create")}
            icon={PlusCircle}
            description="Créez votre propre room privée et invitez des membres."
          />
        </div>

        <Modal
          isOpen={modal === "create"}
          title="Créer une Room"
          onClose={() => setModal(null)}
          onSubmit={handleCreateRoom}
          fields={[
            { label: "Nom de la room", name: "name" },
            {
              label: "Inviter des membres (ID séparés par virgule)",
              name: "members",
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default HomePage;
