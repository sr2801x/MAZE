import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuth } from "../state/AuthContext.jsx";
import { Button } from "../components/Button.jsx";
import { Spinner } from "../components/Spinner.jsx";
import { useLoginModal } from "../components/LoginModal.jsx";

export function HomePage() {
  const converterRef = useRef(null);
  const { isLoggedIn, credits, refreshMe } = useAuth();
  const { open } = useLoginModal();

  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleDownload = async () => {
    if (!imageUrl) return;
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
      toast.success("Image downloaded");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  async function onGenerate() {
    if (!isLoggedIn) {
      open();
      return;
    }
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setBusy(true);
    try {
      const res = await api.post("/image/generate", { prompt });
      setImageUrl(res.data.imageUrl);
      await refreshMe();
      toast.success("Image generated");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to generate image");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_20%_20%,rgba(99,102,241,0.25),transparent_60%),radial-gradient(800px_circle_at_80%_30%,rgba(236,72,153,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              Credit-based • Fast • Cloud-stored
            </div>
            <h1 className="mt-4 text-4xl sm:text-6xl font-black tracking-tight">
              Turn Text into <span className="text-indigo-300">Stunning</span> AI Images
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/70">
              Generate high-quality images from simple prompts in seconds.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                className="px-6 py-3"
                onClick={() => {
                  converterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Start Generating
              </Button>
              <Button variant="ghost" className="px-6 py-3" onClick={() => (window.location.href = "/pricing")}>
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="converter" ref={converterRef} className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Converter</h2>
            <p className="mt-2 text-white/65">
              Describe anything. We’ll generate an image, store it securely, and add it to your history.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/50 mb-2">Prompt</div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt (e.g., tiger eating grass)"
                className="min-h-28 w-full resize-none rounded-xl border border-white/10 bg-zinc-950/50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/60"
              />

              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
                <div className="text-sm text-white/70">
                  Credits: <span className="font-bold text-white">{credits}</span>
                </div>
                <Button className="min-w-44" disabled={busy} onClick={onGenerate}>
                  {busy ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner />
                      Generating...
                    </span>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>

              {!isLoggedIn ? (
                <div className="mt-4 text-xs text-white/50">
                  Login required to generate. New users start with <span className="text-white/80 font-semibold">5 free credits</span>.
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Generated image</div>
                {imageUrl ? (
                  <button
                    onClick={handleDownload}
                    className="text-xs rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10 transition"
                  >
                    Download
                  </button>
                ) : null}
              </div>

              <div className="mt-3 aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950/40 grid place-items-center">
                {imageUrl ? (
                  <img src={imageUrl} alt="Generated" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-sm text-white/50 px-6 text-center">
                    Your image will appear here after generation.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 grid sm:grid-cols-3 gap-3 text-xs text-white/65">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="font-semibold text-white">Cloud storage</div>
                <div className="mt-1">Uploaded to Cloudinary and saved to history.</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="font-semibold text-white">Credits</div>
                <div className="mt-1">1 credit per generation.</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="font-semibold text-white">Secure access</div>
                <div className="mt-1">JWT-protected API endpoints.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

