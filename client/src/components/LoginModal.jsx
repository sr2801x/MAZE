import React, { createContext, useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuth } from "../state/AuthContext.jsx";
import { Button } from "./Button.jsx";

const LoginModalContext = createContext(null);

export function LoginModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen]
  );

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <LoginModal />
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const ctx = useContext(LoginModalContext);
  if (!ctx) throw new Error("useLoginModal must be used within LoginModalProvider");
  return ctx;
}

function LoginModal() {
  const { isOpen, close } = useLoginModal();
  const { loginWithToken } = useAuth();
  const [step, setStep] = useState("email"); // email | otp
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const googleUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080") + "/api/auth/google";

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 px-4" onMouseDown={close}>
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-black">Login to MAZE</div>
            <div className="mt-1 text-sm text-white/60">Google OAuth or email OTP.</div>
          </div>
          <button className="text-white/60 hover:text-white" onClick={close}>
            ✕
          </button>
        </div>

        <div className="mt-4">
          <a
            href={googleUrl}
            className="w-full inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold hover:bg-white/10 transition"
          >
            Continue with Google
          </a>
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <div className="text-xs text-white/40">OR</div>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {step === "email" ? (
          <div className="space-y-3">
            <div className="text-sm text-white/70">Email address</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/60"
            />
            <Button
              className="w-full"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await api.post("/auth/otp/request", { email });
                  toast.success("OTP sent");
                  setStep("otp");
                } catch (e) {
                  toast.error(e?.response?.data?.message || "Failed to send OTP");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Send OTP
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-white/70">Enter OTP</div>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/60"
            />
            <Button
              className="w-full"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const res = await api.post("/auth/otp/verify", { email, otp });
                  await loginWithToken(res.data.token);
                  toast.success("Welcome to MAZE");
                  close();
                  setStep("email");
                  setOtp("");
                } catch (e) {
                  toast.error(e?.response?.data?.message || "Invalid OTP");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Verify & Login
            </Button>
            <button
              className="w-full text-xs text-white/50 hover:text-white/70"
              onClick={() => {
                setStep("email");
                setOtp("");
              }}
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

