import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Chamados } from "./pages/Chamados";
import { Calendario } from "./pages/Calendario";
import { NovoUsuario } from "./pages/NovoUsuario";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Chamados />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/equipe/novo" element={<NovoUsuario />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
