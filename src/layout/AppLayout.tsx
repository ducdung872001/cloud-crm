import { Outlet } from "react-router-dom";
import CommandPalette from "../components/CommandPalette";
import ToastHost from "../components/Toast";
import Rail from "./Rail";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  return (
    <>
      <div className="app">
        <Rail />
        <Sidebar />
        <Topbar />
        <main className="main">
          <div className="decor-line">REBORN · FORGE · v2.1</div>
          <div className="main-inner">
            <Outlet />
          </div>
        </main>
      </div>
      <CommandPalette />
      <ToastHost />
    </>
  );
}
