import React from "react";
import Card from "./Card";
import Modal from "./Modal";
import { MessageCircle, LogIn, PlusCircle } from "lucide-react";

const HomePage: React.FC = () => {
  const [modal, setModal] = React.useState<null | "join" | "create">(null);

  const handleCardClick = (type: "chat" | "join" | "create") => {
    if (type === "chat") {
      console.log("Accéder au chat général");
    } else {
      setModal(type);
    }
  };

  const handleSubmit = (data: Record<string, string>) => {
    console.log("Données soumises:", data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">
        Bienvenue sur Cloud Chat
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-xl">
        Discutez avec vos amis, créez des rooms privées et rejoignez des
        conversations instantanément.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <Card
          title="Chat Général"
          onClick={() => handleCardClick("chat")}
          icon={MessageCircle}
          description="Accédez à la conversation principale avec tous les utilisateurs."
        />
        <Card
          title="Rejoindre une Room"
          onClick={() => handleCardClick("join")}
          icon={LogIn}
          description="Entrez l'identifiant et le mot de passe pour rejoindre une room privée."
        />
        <Card
          title="Créer une Room"
          onClick={() => handleCardClick("create")}
          icon={PlusCircle}
          description="Créez votre propre room avec un nom et mot de passe sécurisé."
        />
      </div>

      {/* Modals */}
      <Modal
        isOpen={modal === "join"}
        title="Rejoindre une Room"
        onClose={() => setModal(null)}
        onSubmit={handleSubmit}
        fields={[
          { label: "Identifiant", name: "id" },
          { label: "Mot de passe", name: "password", type: "password" },
        ]}
      />

      <Modal
        isOpen={modal === "create"}
        title="Créer une Room"
        onClose={() => setModal(null)}
        onSubmit={handleSubmit}
        fields={[
          { label: "Nom de la room", name: "name" },
          { label: "Mot de passe", name: "password", type: "password" },
        ]}
      />
    </div>
  );
};

export default HomePage;
