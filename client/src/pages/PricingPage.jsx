import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { Button } from "../components/Button.jsx";
import { Spinner } from "../components/Spinner.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { useLoginModal } from "../components/LoginModal.jsx";

export function PricingPage() {
  const { isLoggedIn } = useAuth();
  const { open } = useLoginModal();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyPack, setBusyPack] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/payments/pricing");
        setPacks(res.data.packs || []);
      } catch (_e) {
        toast.error("Failed to load pricing");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function checkout(packId) {
    if (!isLoggedIn) {
      open();
      return;
    }
    setBusyPack(packId);
    try {
      const res = await api.post("/payments/checkout", { packId });
      window.location.href = res.data.url;
    } catch (e) {
      toast.error(e?.response?.data?.message || "Checkout failed");
    } finally {
      setBusyPack(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Pricing</h1>
        <p className="mt-3 text-white/70">
          Buy credits and generate images anytime. Simple, transparent, and scalable.
        </p>
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="inline-flex items-center gap-2 text-white/70">
            <Spinner />
            Loading packs...
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {packs.map((p) => (
              <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-lg font-black">{p.name}</div>
                <div className="mt-1 text-sm text-white/60">Best for quick projects.</div>
                <div className="mt-6 text-3xl font-black">
                  {(p.amount / 100).toFixed(0)} <span className="text-sm text-white/50 uppercase">{p.currency}</span>
                </div>
                <div className="mt-2 text-sm text-white/70">
                  Includes <span className="font-bold text-white">{p.credits}</span> credits.
                </div>
                <Button className="mt-6 w-full" disabled={busyPack === p.id} onClick={() => checkout(p.id)}>
                  {busyPack === p.id ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner />
                      Redirecting...
                    </span>
                  ) : (
                    "Buy credits"
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

