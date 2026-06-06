import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Wallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const res = await api.get("/wallet");
      setBalance(res.data.balance);
      setTransactions(res.data.transactions);
    } catch (err) {
      setError("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div style={styles.center}>Loading wallet...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/feed")} style={styles.back} className="back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Feed
      </button>

      <div style={styles.card}>
        <div style={styles.balanceSection}>
          <p style={styles.balanceLabel}>Current Balance</p>
          <div style={styles.balanceRow}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
            </svg>
            <h1 style={styles.balanceText}>{balance} coins</h1>
          </div>
        </div>

        <div style={styles.historySection}>
          <h3 style={styles.historyTitle}>Transaction History</h3>
          {transactions.length === 0 ? (
            <p style={styles.noTransactions}>No transactions yet.</p>
          ) : (
            <div style={styles.list}>
              {transactions.map((tx) => {
                const isDebit = tx.type === "debit";
                return (
                  <div key={tx.id} style={styles.item}>
                    <div style={styles.itemLeft}>
                      <p style={styles.txDesc}>{tx.description}</p>
                      <p style={styles.txDate}>{formatDate(tx.created_at)}</p>
                    </div>
                    <span style={isDebit ? styles.debitAmount : styles.creditAmount}>
                      {isDebit ? "-" : "+"}{tx.amount} coins
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "600px", margin: "0 auto", padding: "2.5rem 1.5rem" },
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
    padding: "2rem",
  },
  balanceSection: {
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "1.5rem",
    marginBottom: "1.5rem",
  },
  balanceLabel: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500",
    marginBottom: "0.5rem",
  },
  balanceRow: {
    display: "flex",
    alignItems: "center",
  },
  balanceText: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#0f172a",
  },
  historySection: {},
  historyTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "1rem",
  },
  noTransactions: {
    fontSize: "14px",
    color: "#64748b",
    textAlign: "center",
    padding: "2rem 0",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #f1f5f9",
  },
  itemLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  txDesc: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#0f172a",
  },
  txDate: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  debitAmount: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ef4444",
    background: "#fef2f2",
    padding: "0.25rem 0.5rem",
    borderRadius: "6px",
  },
  creditAmount: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#10b981",
    background: "#ecfdf5",
    padding: "0.25rem 0.5rem",
    borderRadius: "6px",
  },
};

export default Wallet;
