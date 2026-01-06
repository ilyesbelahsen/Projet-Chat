import React from "react";
import { User as UserIcon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="w-full p-4 bg-white shadow flex justify-between items-center">
      {/* Logo */}
      <h1
        className="font-bold text-xl cursor-pointer"
        onClick={() => navigate("/")}
      >
        Cloud Chat
      </h1>

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
