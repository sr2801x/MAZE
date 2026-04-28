import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar.jsx";
import { Footer } from "./Footer.jsx";
import { LoginModalProvider } from "./LoginModal.jsx";

export function Layout() {
  return (
    <LoginModalProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-50">
        <Navbar />
        <main className="pt-16">
          <Outlet />
        </main>
        <Footer />
      </div>
    </LoginModalProvider>
  );
}

