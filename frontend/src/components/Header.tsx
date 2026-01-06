import React from "react";
import { User as UserIcon, LogOut, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Afficher la flèche seulement si on n'est pas sur la page d'accueil
  const showBackArrow = location.pathname !== "/";

  return (
    <header className="w-full p-4 bg-white shadow flex justify-between items-center">
      <div className="flex items-center gap-4">
        {showBackArrow && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>
        )}

        {!showBackArrow && (
          <h1
            className="font-bold text-xl cursor-pointer"
            onClick={() => navigate("/")}
          >
            Cloud Chat
          </h1>
        )}
      </div>

      {/* Auth */}
      {user ? (
        <div className="flex items-center gap-4">
          <UserIcon className="w-6 h-6 text-gray-600" />
          <span className="font-medium">{user.username}</span>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Se connecter
        </button>
      )}
    </header>
  );
};

export default Header;
