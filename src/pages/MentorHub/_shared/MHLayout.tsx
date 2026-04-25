import React from "react";
import MHSidebar from "./MHSidebar";
import "./MHLayout.scss";

interface Props {
  children: React.ReactNode;
}

export default function MHLayout({ children }: Props) {
  return (
    <div className="mh-layout">
      <MHSidebar />
      <main className="mh-layout__main">{children}</main>
    </div>
  );
}
