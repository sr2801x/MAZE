const axios = require("axios");
const { AppError } = require("../utils/appError");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getHfConfig() {
  const token = process.env.HF_API_TOKEN;
  const model = process.env.HF_MODEL || "runwayml/stable-diffusion-v1-5";
  const timeoutMs = Number(process.env.HF_TIMEOUT_MS || 120_000);
  if (!token) throw new AppError("Missing HF_API_TOKEN", 500);
  const maxRetries = Number(process.env.HF_MAX_RETRIES || 2);
  return { token, model, timeoutMs, maxRetries };
}

async function generateImageBytes({ prompt }) {
  const { token, model, timeoutMs, maxRetries } = getHfConfig();

  try {
    const url = `https://api-inference.huggingface.co/models/${model}`;
    let lastErr = null;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const resp = await axios.post(
        url,
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "image/png",
          },
          responseType: "arraybuffer",
          timeout: timeoutMs,
          validateStatus: () => true,
        }
      );

      if (resp.status < 400) {
        return Buffer.from(resp.data);
      }

      // HF returns JSON error details sometimes; attempt to decode
      const contentType = resp.headers?.["content-type"] || "";
      const maybeJson = contentType.includes("application/json");
      const text = Buffer.from(resp.data).toString("utf8");

      if (resp.status === 503 && maybeJson) {
        // Common: model is loading. JSON often includes estimated_time.
        try {
          const parsed = JSON.parse(text);
          const estimated = Number(parsed?.estimated_time || 0);
          const waitMs = Math.min(30_000, Math.max(1000, Math.ceil(estimated * 1000)));
          lastErr = new AppError(`Hugging Face model loading. Retrying in ${Math.ceil(waitMs / 1000)}s`, 502);
          if (attempt < maxRetries) {
            await sleep(waitMs);
            continue;
          }
        } catch (_e) {
          lastErr = new AppError(`Hugging Face error: ${text}`, 502);
        }
      } else if (maybeJson) {
        lastErr = new AppError(`Hugging Face error: ${text}`, 502);
      } else if (resp.status === 401 || resp.status === 403) {
        lastErr = new AppError("Hugging Face auth failed (check HF_API_TOKEN)", 502);
      } else {
        lastErr = new AppError(`Hugging Face generation failed (${resp.status})`, 502);
      }

      break;
    }

    throw lastErr || new AppError("Hugging Face generation failed", 502);
  } catch (e) {
    if (e instanceof AppError) throw e;
    if (e?.code === "ECONNABORTED") throw new AppError("Image generation timed out", 504);
    if (e?.response?.status) {
      const status = e.response.status;
      const data = e.response.data;
      const text =
        typeof data === "string"
          ? data
          : Buffer.isBuffer(data)
            ? data.toString("utf8")
            : JSON.stringify(data);
      throw new AppError(`Hugging Face request failed (${status}): ${text}`, 502);
    }
    const details = e?.code ? `${e.code}: ${e.message || "request failed"}` : e?.message || "request failed";
    throw new AppError(`Hugging Face request failed: ${details}`, 502);
  }
}

module.exports = { generateImageBytes };

