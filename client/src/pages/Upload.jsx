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
          <h2>Upload Media</h2>
          <button onClick={() => navigate("/feed")} style={styles.back}>
            ← Back
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
  },
  box: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    width: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
  },
  button: {
    padding: "0.75rem",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
  },
  back: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
  },
  error: { color: "red", fontSize: "13px" },
  preview: { width: "100%", borderRadius: "6px", marginTop: "0.5rem" },
  compressionText: { fontSize: "12px", color: "#888", marginTop: "0.5rem" },
};

export default Upload;
