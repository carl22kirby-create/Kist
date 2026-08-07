import { useState, useRef } from "react";
import { Upload, Trash2, FileText } from "lucide-react";
import { uploadEvidenceFile } from "../utils/upload.js";

export default function EvidenceUploader({ client, setData, stage, linkedQuestionId }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef(null);
  // When scoped to a specific BPI (from the Assessment screen), show only
  // evidence linked to that exact item. Otherwise fall back to the
  // original stage-based filtering used by the Business Walkthrough and
  // Evidence Review stages — unchanged, so nothing already built on that
  // breaks.
  const files = (client.evidenceFiles || []).filter((f) => linkedQuestionId ? f.linkedQuestionId === linkedQuestionId : f.stage === stage);

  function updateEvidenceFiles(next) {
    // Uses the functional form deliberately — file uploads are async, and
    // by the time one completes, another edit elsewhere (a score, a note,
    // a different upload) may have already committed. Reading from the
    // stale `data` closure captured when the upload started would silently
    // revert whatever changed in between; reading from `current` here
    // always operates on the latest state at the moment this actually runs.
    setData((current) => ({
      ...current,
      clients: current.clients.map((c) => c.id === client.id ? { ...c, evidenceFiles: next(c.evidenceFiles || []) } : c)
    }));
  }

  async function handleFilesSelected(e) {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of selected) {
        const result = await uploadEvidenceFile(file, client.id);
        uploaded.push({
          id: "ev" + Date.now() + Math.random().toString(36).slice(2, 7),
          path: result.path, url: result.url, fileName: result.fileName, mimeType: result.mimeType,
          caption: "", includeInReport: false, stage, linkedQuestionId: linkedQuestionId || null,
          uploadedAt: new Date().toISOString()
        });
      }
      updateEvidenceFiles((currentFiles) => [...currentFiles, ...uploaded]);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function updateFile(id, updates) {
    updateEvidenceFiles((currentFiles) => currentFiles.map((f) => f.id === id ? { ...f, ...updates } : f));
  }
  function removeFile(id) {
    updateEvidenceFiles((currentFiles) => currentFiles.filter((f) => f.id !== id));
  }

  const inputId = `evidence-input-${stage}${linkedQuestionId ? "-" + linkedQuestionId : ""}`;

  return (
    <div className="evidence-uploader">
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple onChange={handleFilesSelected} className="evidence-file-input" id={inputId} />
      <label htmlFor={inputId} className="secondary evidence-upload-button">
        <Upload size={16} /> {uploading ? "Uploading..." : "Add Photos or Documents"}
      </label>
      {error && <p className="evidence-error">{error}</p>}
      {files.length > 0 && (
        <div className="evidence-file-list">
          {files.map((f) => (
            <div className="evidence-file-card" key={f.id}>
              {f.mimeType.startsWith("image/") ? (
                <img src={f.url} alt={f.fileName} className="evidence-thumb" />
              ) : (
                <div className="evidence-thumb evidence-thumb-doc"><FileText size={28} /></div>
              )}
              <div className="evidence-file-details">
                <span className="evidence-file-name">{f.fileName}</span>
                <textarea
                  placeholder="Caption or note for this file"
                  value={f.caption}
                  onChange={(e) => updateFile(f.id, { caption: e.target.value })}
                />
                <label className="check-row evidence-include-row">
                  <input type="checkbox" checked={f.includeInReport} onChange={(e) => updateFile(f.id, { includeInReport: e.target.checked })} />
                  Include in client report
                </label>
              </div>
              <button className="evidence-remove-button" onClick={() => removeFile(f.id)}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
