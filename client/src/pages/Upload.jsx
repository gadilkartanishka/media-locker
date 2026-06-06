import { useState } from "react";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import api from "../api/axios";

function Upload() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB");
      return;
    }

    setError("");
    const originalSize = (selected.size / 1024 / 1024).toFixed(2);

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressed = await imageCompression(selected, options);
      const compressedSize = (compressed.size / 1024 / 1024).toFixed(2);

      setCompressionInfo({ originalSize, compressedSize });
      setFile(compressed);

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(compressed);
    } catch (err) {
      setError("Image processing failed");
    }
  };

  const handleUpload = async () => {
    if (!title || !price || !file) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("unlock_price", price);
      formData.append("image", file);

      await api.post("/media/upload", formData);
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.header}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>Upload Media</h2>
          <button onClick={() => navigate("/feed")} style={styles.back} className="back-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button>
        </div>

        <input
          style={styles.input}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Unlock price (coins)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          style={styles.input}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />

        {preview && (
          <div>
            <img src={preview} alt="Preview" style={styles.preview} />
            {compressionInfo && (
              <p style={styles.compressionText}>
                Compressed: {compressionInfo.originalSize}MB →{" "}
                {compressionInfo.compressedSize}MB
              </p>
            )}
          </div>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.button} onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "2rem 1rem",
  },
  box: {
    background: "#fff",
    padding: "2.5rem",
    borderRadius: "12px",
    width: "420px",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  input: {
    padding: "0.875rem 1rem",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    background: "#f8fafc",
    color: "#0f172a",
  },
  button: {
    padding: "0.875rem 1rem",
    background: "#e11d48",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  back: {
    display: "inline-flex",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#64748b",
  },
  error: { color: "#ef4444", fontSize: "13px", textAlign: "center" },
  preview: { width: "100%", borderRadius: "8px", marginTop: "0.5rem", border: "1px solid #e2e8f0" },
  compressionText: {
    fontSize: "12px",
    color: "#e11d48",
    fontWeight: "500",
    marginTop: "0.5rem",
    background: "#ffe4e6",
    padding: "0.5rem 0.75rem",
    borderRadius: "6px",
    textAlign: "center",
  },
};

export default Upload;
