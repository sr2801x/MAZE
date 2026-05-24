import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../state/AuthContext.jsx";
import { api } from "../lib/api";

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { refreshMe, setUser } = useAuth();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    (async () => {
      if (processed) return; // Prevent multiple calls
      
      try {
        // Process pending transactions in development (webhook might not work in dev)
        const processRes = await api.post("/payments/dev/process-pending");
        console.log("Process response:", processRes.data);
        setProcessed(true);
        
        // Refresh user data to get updated credits
        const updatedUser = await refreshMe();
        if (updatedUser) {
          setUser(updatedUser);
          toast.success(`Payment successful! You now have ${updatedUser.credits} credits.`);
        } else {
          toast.success("Payment successful. Redirecting...");
        }
      } catch (err) {
        console.error("Error processing payment:", err);
        toast.success("Payment received. Redirecting...");
      }
      // Redirect without polling
      setTimeout(() => navigate("/dashboard"), 1500);
    })();
  }, [navigate, refreshMe, setUser, processed]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
        <div>Payment successful. Redirecting to dashboard…</div>
      </div>
    </div>
  );
}

