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

  const [mode, setMode] = useState("generate"); // "generate" or "analyze"
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [analyzeImage, setAnalyzeImage] = useState(null);
  const [analyzeResult, setAnalyzeResult] = useState("");
  const [analyzePrompt, setAnalyzePrompt] = useState("");

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnalyzeImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onAnalyze() {
    if (!isLoggedIn) {
      open();
      return;
    }
    if (!analyzeImage) {
      toast.error("Please upload an image");
      return;
    }

    setBusy(true);
    try {
      // Convert base64 to file and upload to get URL
      const formData = new FormData();
      const response = await fetch(analyzeImage);
      const blob = await response.blob();
      formData.append('file', blob, 'image.png');
      
      // Upload to get URL (simplified - in production you'd use your upload service)
      const uploadRes = await api.post('/image/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const analyzeRes = await api.post("/image/analyze", {
        imageUrl: uploadRes.data.imageUrl,
        prompt: analyzePrompt || "Describe this image in detail"
      });
      
      setAnalyzeResult(analyzeRes.data.analysis);
      await refreshMe();
      toast.success("Image analyzed");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to analyze image");
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {mode === "generate" ? "Text to Image" : "Image to Text"}
          </h2>
          <div className="flex gap-2">
            <Button
              variant={mode === "generate" ? "default" : "ghost"}
              onClick={() => setMode("generate")}
              className="px-4 py-2"
            >
              Text to Image
            </Button>
            <Button
              variant={mode === "analyze" ? "default" : "ghost"}
              onClick={() => setMode("analyze")}
              className="px-4 py-2"
            >
              Image to Text
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-stretch">
          {mode === "generate" ? (
            <>
              <div>
                <p className="mt-2 text-white/65">
                  Describe anything. We'll generate an image, store it securely, and add it to your history.
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
            </>
          ) : (
            <>
              <div>
                <p className="mt-2 text-white/65">
                  Upload an image and get AI-powered analysis, descriptions, or text extraction.
                </p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/50 mb-2">Upload Image</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                  />

                  {analyzeImage && (
                    <div className="mt-4 aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950/40">
                      <img src={analyzeImage} alt="Uploaded" className="h-full w-full object-cover" />
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="text-xs text-white/50 mb-2">Analysis Instructions (optional)</div>
                    <textarea
                      value={analyzePrompt}
                      onChange={(e) => setAnalyzePrompt(e.target.value)}
                      placeholder="Enter specific instructions (e.g., 'extract all text', 'describe the scene')"
                      className="min-h-20 w-full resize-none rounded-xl border border-white/10 bg-zinc-950/50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/60"
                    />
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
                    <div className="text-sm text-white/70">
                      Credits: <span className="font-bold text-white">{credits}</span>
                    </div>
                    <Button className="min-w-44" disabled={busy} onClick={onAnalyze}>
                      {busy ? (
                        <span className="inline-flex items-center gap-2">
                          <Spinner />
                          Analyzing...
                        </span>
                      ) : (
                        "Analyze"
                      )}
                    </Button>
                  </div>

                  {!isLoggedIn ? (
                    <div className="mt-4 text-xs text-white/50">
                      Login required to analyze. New users start with <span className="text-white/80 font-semibold">5 free credits</span>.
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold mb-3">Analysis Result</div>

                  <div className="min-h-[400px] rounded-xl border border-white/10 bg-zinc-950/40 p-4">
                    {analyzeResult ? (
                      <div className="text-sm text-white/90 whitespace-pre-wrap">{analyzeResult}</div>
                    ) : (
                      <div className="text-sm text-white/50 px-6 text-center flex items-center justify-center h-full">
                        Analysis result will appear here.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-3 gap-3 text-xs text-white/65">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="font-semibold text-white">AI Vision</div>
                    <div className="mt-1">Powered by GPT-4 Vision API.</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="font-semibold text-white">Credits</div>
                    <div className="mt-1">1 credit per analysis.</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="font-semibold text-white">Custom prompts</div>
                    <div className="mt-1">Specify what to extract or describe.</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

