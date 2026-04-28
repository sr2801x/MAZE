import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../state/AuthContext.jsx";

export function OAuthSuccessPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(search);
      const token = params.get("token");
      if (!token) {
        toast.error("OAuth login failed");
        navigate("/");
        return;
      }
      await loginWithToken(token);
      toast.success("Logged in");
      navigate("/dashboard");
    })();
  }, [search, loginWithToken, navigate]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">Finishing login…</div>
    </div>
  );
}

