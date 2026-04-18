import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import AuthLayout from "./layout/AuthLayout";
import Hub from "./pages/Hub";
import Inbox from "./pages/Inbox";
import Analytics from "./pages/Analytics";
import Prompts from "./pages/Prompts";
import Team from "./pages/Team";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import Sessions from "./pages/Sessions";
import Changes from "./pages/Changes";
import Deliverables from "./pages/Deliverables";
import Stage from "./pages/Stage";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/hub" replace />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/prompts" element={<Prompts />} />
        <Route path="/team" element={<Team />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/project/:id" element={<Navigate to="stage/3" replace />} />
        <Route path="/project/:id/stage/:n" element={<Stage />} />
        <Route path="/project/:id/sessions" element={<Sessions />} />
        <Route path="/project/:id/changes" element={<Changes />} />
        <Route path="/project/:id/deliverables" element={<Deliverables />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
