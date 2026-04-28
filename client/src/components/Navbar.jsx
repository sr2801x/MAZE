import React, { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { Button } from "./Button.jsx";
import { useLoginModal } from "./LoginModal.jsx";

function Avatar({ name, url }) {
  const initials = useMemo(() => {
    const parts = (name || "?").trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("") || "?";
  }, [name]);

  if (url) {
    return <img src={url} alt="Profile" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10" />;
  }
  return (
    <div className="h-9 w-9 rounded-full bg-white/10 ring-1 ring-white/10 grid place-items-center text-xs font-bold">
      {initials}
    </div>
  );
}

export function Navbar() {
  const { isLoggedIn, user, credits, logout } = useAuth();
  const { open } = useLoginModal();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight">MAZE</span>
            <span className="hidden sm:inline text-xs text-white/50">AI Text → Image</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <NavLink to="/" className={({ isActive }) => (isActive ? "text-white" : "hover:text-white")}>
              Home
            </NavLink>
            <NavLink to="/pricing" className={({ isActive }) => (isActive ? "text-white" : "hover:text-white")}>
              Pricing
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
                  <span className="text-white/60">Credits</span>
                  <span className="font-bold">{credits}</span>
                </div>

                <div className="relative">
                  <button
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 hover:bg-white/10 transition"
                    onClick={() => setMenuOpen((v) => !v)}
                  >
                    <Avatar name={user?.name} url={user?.avatarUrl} />
                    <span className="hidden sm:block text-sm text-white/80">{user?.name || "Account"}</span>
                  </button>

                  {menuOpen ? (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-zinc-950 shadow-xl overflow-hidden">
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/profile");
                        }}
                      >
                        Profile
                      </button>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/pricing");
                        }}
                      >
                        My Plans
                      </button>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/dashboard");
                        }}
                      >
                        History
                      </button>
                      <div className="h-px bg-white/10" />
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-red-300 hover:bg-white/5"
                        onClick={async () => {
                          setMenuOpen(false);
                          await logout();
                          navigate("/");
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={open}>
                  Login
                </Button>
                <Button
                  onClick={() => {
                    open();
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

