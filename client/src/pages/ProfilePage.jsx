import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuth } from "../state/AuthContext.jsx";
import { Button } from "../components/Button.jsx";
import { useLoginModal } from "../components/LoginModal.jsx";
import { Spinner } from "../components/Spinner.jsx";

function formatDate(d) {
  try {
    return new Date(d).toLocaleString();
  } catch (_e) {
    return "";
  }
}

export function ProfilePage() {
  const { isLoggedIn, user, credits, refreshMe } = useAuth();
  const { open } = useLoginModal();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    (async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get("/user/overview");
        setOverview(res.data.overview);
        await refreshMe();
      } catch (_e) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoggedIn, refreshMe]);

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-black">Profile</div>
          <div className="mt-1 text-sm text-white/70">Login to view your profile and plan details.</div>
          <Button className="mt-4" onClick={open}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="text-3xl font-black tracking-tight">Profile</div>
      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/60">User</div>
          <div className="mt-2 text-lg font-black">{user?.name || "—"}</div>
          <div className="mt-1 text-sm text-white/70">{user?.email || "—"}</div>
          <div className="mt-5 text-sm text-white/70">
            Credits: <span className="font-bold text-white">{credits}</span>
          </div>
          <div className="mt-2 text-sm text-white/70">
            Plan: <span className="font-bold text-white">{overview?.plan || "free"}</span>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/60">Purchased plans</div>
              <div className="text-lg font-black">Transactions</div>
            </div>
            <Button variant="ghost" onClick={() => (window.location.href = "/pricing")}>
              Buy credits
            </Button>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="inline-flex items-center gap-2 text-white/70">
                <Spinner />
                Loading...
              </div>
            ) : overview?.transactions?.length ? (
              <div className="space-y-2">
                {overview.transactions.map((t) => (
                  <div key={t.id} className="rounded-xl border border-white/10 bg-zinc-950/30 px-4 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="text-sm">
                        <span className="font-semibold text-white">{t.creditsAdded} credits</span>{" "}
                        <span className="text-white/60">• {(t.amount / 100).toFixed(0)} {t.currency.toUpperCase()}</span>
                      </div>
                      <div className="text-xs text-white/50">{formatDate(t.date)}</div>
                    </div>
                    <div className="mt-1 text-xs text-white/50">Status: {t.status}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-white/60">No purchases yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm text-white/60">Credit usage history</div>
        <div className="mt-2 text-sm text-white/70">
          Every generation deducts <span className="font-semibold text-white">1 credit</span>. Your full image history is in the dashboard.
        </div>
      </div>
    </div>
  );
}

