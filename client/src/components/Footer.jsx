import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="font-black tracking-tight">MAZE</div>
            <div className="text-sm text-white/60">Turn prompts into images, fast.</div>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/70">
            <Link to="/" className="hover:text-white">
              About
            </Link>
            <Link to="/" className="hover:text-white">
              Contact
            </Link>
            <Link to="/pricing" className="hover:text-white">
              Pricing
            </Link>
          </div>
        </div>
        <div className="mt-8 text-xs text-white/45">© {new Date().getFullYear()} MAZE. All rights reserved.</div>
      </div>
    </footer>
  );
}

