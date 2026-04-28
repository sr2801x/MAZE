import React from "react";

export function Button({ variant = "primary", className = "", disabled, ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-400/60 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-500 hover:bg-indigo-400 text-white shadow-sm",
    ghost: "bg-transparent hover:bg-white/5 text-white border border-white/10",
    subtle: "bg-white/5 hover:bg-white/10 text-white border border-white/10",
  };

  return <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled} {...props} />;
}

