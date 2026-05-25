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

export function DashboardPage() {
  const { isLoggedIn, credits, refreshMe } = useAuth();
  const { open } = useLoginModal();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  const handleDownload = async (imageUrl) => {
    try {
      const response = await api.get("/image/download", {
        params: { imageUrl },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `maze-image-${Date.now()}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    try {
      await api.delete(`/image/${imageId}`);
      toast.success("Image deleted successfully");
      // Refresh history
      const res = await api.get("/image/history");
      setHistory(res.data.history || []);
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const handleEdit = async (imageId) => {
    const editPrompt = prompt("Enter your edit instructions (e.g., 'make it blue', 'add a sunset'):");
    if (!editPrompt) return;
    
    try {
      const res = await api.post("/image/edit", { imageId, prompt: editPrompt });
      toast.success("Image edited successfully");
      // Refresh history
      const historyRes = await api.get("/image/history");
      setHistory(historyRes.data.history || []);
      await refreshMe();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to edit image");
    }
  };

  const handleAnalyze = async (imageUrl) => {
    const analyzePrompt = prompt("Enter analysis instructions (optional, leave empty for general description):");
    
    try {
      const res = await api.post("/image/analyze", { 
        imageUrl, 
        prompt: analyzePrompt || "Describe this image in detail" 
      });
      alert(`Image Analysis:\n\n${res.data.analysis}`);
      await refreshMe();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to analyze image");
    }
  };

  useEffect(() => {
    (async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get("/image/history");
        setHistory(res.data.history || []);
        await refreshMe();
      } catch (_e) {
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoggedIn, refreshMe]);

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-black">Dashboard</div>
          <div className="mt-1 text-sm text-white/70">Login to view your credits and image history.</div>
          <Button className="mt-4" onClick={open}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-3xl font-black tracking-tight">Dashboard</div>
          <div className="mt-2 text-white/70">
            Credits remaining: <span className="font-bold text-white">{credits}</span>
          </div>
        </div>
        <Button variant="ghost" onClick={() => (window.location.href = "/#converter")}>
          Generate more
        </Button>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="inline-flex items-center gap-2 text-white/70">
            <Spinner />
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            No images yet. Generate your first one on the home page.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((h, idx) => (
              <div key={`${h.imageUrl}-${idx}`} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                <div className="aspect-square bg-zinc-950/30">
                  <img src={h.imageUrl} alt={h.prompt} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="text-sm font-semibold line-clamp-2">{h.prompt}</div>
                  <div className="mt-2 text-xs text-white/50">{formatDate(h.createdAt)}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={h.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10 transition"
                    >
                      Open
                    </a>
                    <button
                      onClick={() => handleDownload(h.imageUrl)}
                      className="text-xs rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10 transition"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleEdit(h.imageId)}
                      className="text-xs rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 hover:bg-blue-500/20 transition text-blue-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleAnalyze(h.imageUrl)}
                      className="text-xs rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 hover:bg-green-500/20 transition text-green-400"
                    >
                      Analyze
                    </button>
                    <button
                      onClick={() => handleDelete(h.imageId)}
                      className="text-xs rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 hover:bg-red-500/20 transition text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

