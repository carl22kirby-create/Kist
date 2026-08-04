import { useState, useRef } from "react";
import { Upload, Trash2, FileText } from "lucide-react";
import { uploadEvidenceFile } from "../utils/upload.js";

export default function EvidenceUploader({ client, data, setData, stage }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef(null);
  const files = (client.evidenceFiles || []).filter((f) => f.stage === stage);

  function updateEvidenceFiles(next) {
    setData({ ...data, clients: data.clients.map((c) => c.id === client.id ? { ...c, evidenceFiles: next } : c) });
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
          caption: "", includeInReport: false, stage
        });
      }
      updateEvidenceFiles([...(client.evidenceFiles || []), ...uploaded]);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function updateFile(id, updates) {
    updateEvidenceFiles((client.evidenceFiles || []).map((f) => f.id === id ? { ...f, ...updates } : f));
  }
  function removeFile(id) {
    updateEvidenceFiles((client.evidenceFiles || []).filter((f) => f.id !== id));
  }

  return (
    <div className="evidence-uploader">
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple onChange={handleFilesSelected} className="evidence-file-input" id={`evidence-input-${stage}`} />
      <label htmlFor={`evidence-input-${stage}`} className="secondary evidence-upload-button">
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
