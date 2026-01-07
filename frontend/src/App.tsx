import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import HomePage from "./pages/HomePage";
import MyRooms from "./pages/MyRooms";
import RoomChat from "./pages/RoomChat";
import ChatGeneral from "./pages/ChatGeneral";
import LoginPage from "./pages/Login";
import type { JSX } from "react";
import { AuthProvider } from "./context/AuthProvider";

// Route privée
const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { user, isReady } = useAuth();

    // Tant que le refresh n'a pas été tenté, on ne décide rien
    if (!isReady) return <div className="p-4">Chargement...</div>;

    return user ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <HomePage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/chat"
                        element={
                            <PrivateRoute>
                                <ChatGeneral />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/my-rooms"
                        element={
                            <PrivateRoute>
                                <MyRooms />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/rooms/:roomId"
                        element={
                            <PrivateRoute>
                                <RoomChat />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
