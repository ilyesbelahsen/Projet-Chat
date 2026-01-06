import React, { type JSX } from "react";
import Header from "./Header";

interface LayoutProps {
  children: JSX.Element | JSX.Element[];
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;
