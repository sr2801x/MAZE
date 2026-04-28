import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../state/AuthContext.jsx";

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { refreshMe, user } = useAuth();
  const [creditsUpdated, setCreditsUpdated] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    (async () => {
      const maxAttempts = 10;
      let currentAttempt = 0;
      const initialCredits = user?.credits ?? 0;
      
      // Poll for credits update (webhook might take a moment to process)
      const pollInterval = setInterval(async () => {
        currentAttempt++;
        setAttempts(currentAttempt);
        
        const updatedUser = await refreshMe();
        
        if (updatedUser && updatedUser.credits > initialCredits) {
          setCreditsUpdated(true);
          clearInterval(pollInterval);
          toast.success(`✅ Payment successful! ${updatedUser.credits - initialCredits} credits added.`);
          setTimeout(() => navigate("/dashboard"), 1500);
        } else if (currentAttempt >= maxAttempts) {
          clearInterval(pollInterval);
          toast.success("Payment received. Credits may take a moment to appear.");
          setTimeout(() => navigate("/dashboard"), 1500);
        }
      }, 500); // Poll every 500ms for up to 5 seconds
    })();
  }, [refreshMe, navigate, user]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
        <div>Payment successful. Redirecting…</div>
        {attempts > 0 && <div className="mt-2 text-xs text-white/40">Checking for credits update ({attempts})...</div>}
      </div>
    </div>
  );
}

