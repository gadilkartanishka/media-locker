import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function MediaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await api.get(`/media/${id}`);
      setMedia(res.data);
    } catch (err) {
      setError("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    try {
      setUnlocking(true);
      await api.post(`/media/${id}/unlock`);
      await fetchMedia();
    } catch (err) {
      setError(err.response?.data?.error || "Unlock failed");
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  const canSeeOriginal = media.is_owner || media.is_unlocked;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/feed")} style={styles.back} className="back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back
      </button>

      <div style={styles.card}>
        <img
          src={canSeeOriginal ? media.original_url : media.blurred_url}
          alt={media.title}
          style={styles.image}
        />

        <div style={styles.info}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>{media.title}</h2>
          <p style={styles.price}>Unlock price: {media.unlock_price} coins</p>

          <div>
            {media.is_owner ? (
              <div style={styles.statusBadgeOwner}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Your upload
              </div>
            ) : media.is_unlocked ? (
              <div style={styles.statusBadgeUnlocked}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                </svg>
                Unlocked
              </div>
            ) : (
              <div style={styles.statusBadgeLocked}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Locked
              </div>
            )}
          </div>

          {!media.is_owner && !media.is_unlocked && (
            <button
              style={styles.button}
              onClick={handleUnlock}
              disabled={unlocking}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
              </svg>
              {unlocking
                ? "Unlocking..."
                : `Unlock for ${media.unlock_price} coins`}
            </button>
          )}

          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "680px", margin: "0 auto", padding: "2.5rem 1.5rem" },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "16px",
    fontWeight: "500",
    color: "#64748b",
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
    marginBottom: "1.25rem",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
  },
  image: { width: "100%", height: "420px", objectFit: "cover" },
  info: {
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  price: { color: "#e11d48", fontSize: "15px", fontWeight: "600" },
  statusBadgeOwner: {
    display: "inline-flex",
    alignItems: "center",
    alignSelf: "flex-start",
    padding: "0.4rem 0.8rem",
    background: "#f1f5f9",
    color: "#475569",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
  },
  statusBadgeUnlocked: {
    display: "inline-flex",
    alignItems: "center",
    alignSelf: "flex-start",
    padding: "0.4rem 0.8rem",
    background: "#ffe4e6",
    color: "#e11d48",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
  },
  statusBadgeLocked: {
    display: "inline-flex",
    alignItems: "center",
    alignSelf: "flex-start",
    padding: "0.4rem 0.8rem",
    background: "#f8fafc",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.875rem 1.5rem",
    background: "#e11d48",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  error: { color: "#ef4444", fontSize: "13px", textAlign: "center" },
};

export default MediaDetail;
