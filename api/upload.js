import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../lib/cookies.js";

const BUCKET = "evidence-files";
const MAX_BYTES = 8 * 1024 * 1024; // matches the bucket's own limit, checked here too for a clearer error message
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!(await requireAuth(req, res, supabase))) return;

  const { fileName, mimeType, base64Data, clientId } = req.body || {};
  if (!fileName || !mimeType || !base64Data || !clientId) {
    return res.status(400).json({ error: "fileName, mimeType, base64Data and clientId are all required" });
  }
  if (!ALLOWED_TYPES.has(mimeType)) {
    return res.status(400).json({ error: `File type ${mimeType} isn't allowed. Use JPEG, PNG, WebP or PDF.` });
  }

  const buffer = Buffer.from(base64Data, "base64");
  if (buffer.length > MAX_BYTES) {
    return res.status(400).json({ error: `File is too large (${Math.round(buffer.length / 1024 / 1024)}MB). Limit is 8MB — try compressing the image first.` });
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${clientId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: mimeType, upsert: false });
  if (uploadError) return res.status(500).json({ error: uploadError.message });

  // Bucket is private — generate a long-lived signed URL rather than making
  // the bucket public, so evidence isn't guessable/accessible without going
  // through this authenticated API in the first place.
  const { data: signedData, error: signError } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 365);
  if (signError) return res.status(500).json({ error: signError.message });

  res.status(200).json({ path, url: signedData.signedUrl, fileName: safeName, mimeType, size: buffer.length });
}
