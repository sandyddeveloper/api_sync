"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("app-update");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [wish, setWish] = useState("I wish for infinite possibilities.");

  const fetchData = async (endpoint: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${endpoint}`);
      const json = await res.json();
      if (endpoint === "vault/approve") {
        setVaultUnlocked(json.unlocked);
      } else {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData("vault/approve"); // Check vault status on load
    if (activeTab === "app-update") fetchData("app/update");
    if (activeTab === "permissions") fetchData("email/permission");
  }, [activeTab]);

  const [recipientEmail, setRecipientEmail] = useState("santhoshrajk1812@gmail.com");

  const triggerPush = async (type: "email" | "push") => {
    setStatus(`Sending ${type}...`);
    try {
      const endpoint = type === "email" ? "email/push" : "notifications/push";
      const body = type === "email" 
        ? { to: recipientEmail, subject: "Nila: Approval Required", body: "A new administrative action requires your approval to proceed.", type: "approval" }
        : { title: "New Update", message: "A new version of Nila Dashboard is available!", playerIds: ["user_123"] };

      const res = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      setStatus(json.message);
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus("Error sending push");
    }
  };

  const triggerVaultRequest = async () => {
    setStatus("Requesting Vault Access...");
    try {
      const res = await fetch("/api/vault/request", { method: "POST" });
      const json = await res.json();
      setStatus(json.message || json.error);
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus("Failed to send request");
    }
  };

  const triggerWishTransmission = async () => {
    setStatus("Transmitting Wish...");
    try {
      const res = await fetch("/api/wish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wish,
          name: "Santhosh",
          recipient: recipientEmail,
          timestamp: new Date().toLocaleString()
        }),
      });
      const json = await res.json();
      setStatus(json.message || (json.success ? "Success" : "Failed"));
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus("Failed to transmit wish");
    }
  };

  return (
    <main className="dashboard-container">
      <header className="glass-header">
        <h1>Nila Admin API Dashboard</h1>
        <p>Manage app updates, email permissions, and push notifications.</p>
      </header>

      <div className="tabs">
        <button onClick={() => setActiveTab("app-update")} className={activeTab === "app-update" ? "active" : ""}>App Update</button>
        <button onClick={() => setActiveTab("permissions")} className={activeTab === "permissions" ? "active" : ""}>Permissions</button>
        <button onClick={() => setActiveTab("actions")} className={activeTab === "actions" ? "active" : ""}>Trigger Actions</button>
      </div>

      <div className="content-card glass">
        {loading ? (
          <div className="loader">Loading...</div>
        ) : (
          <div className="data-view">
            {activeTab === "app-update" && data && (
              <div className="update-info">
                <h3>Latest Version: <span className="highlight">{data.version}</span></h3>
                <p>Build: {data.buildNumber}</p>
                <p>Notes: {data.releaseNotes}</p>
                <a href={data.updateUrl} target="_blank" className="btn-primary">View on Play Store</a>
              </div>
            )}

            {activeTab === "permissions" && data && (
              <div className="permissions-list">
                <h3>Current Permissions</h3>
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </div>
            )}

            {activeTab === "actions" && (
              <div className="actions-view">
                <div className="input-group">
                  <label>Recipient Email</label>
                  <input 
                    type="email" 
                    value={recipientEmail} 
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="input-group">
                  <label>Wish to Transmit</label>
                  <input 
                    type="text" 
                    value={wish} 
                    onChange={(e) => setWish(e.target.value)}
                    placeholder="Enter your wish..."
                  />
                </div>
                <div className="actions-grid">
                  <div className="action-card">
                    <h4>Email Push</h4>
                    <p>Send an approval request email.</p>
                    <button onClick={() => triggerPush("email")} className="btn-secondary">Send Email</button>
                  </div>
                  <div className="action-card">
                    <h4>Push Notification</h4>
                    <p>Send a OneSignal notification.</p>
                    <button onClick={() => triggerPush("push")} className="btn-secondary">Trigger Push</button>
                  </div>
                  <div className="action-card">
                    <h4>Sanctuary Vault</h4>
                    <p>Status: <span className={vaultUnlocked ? "status-unlocked" : "status-locked"}>{vaultUnlocked ? "UNLOCKED" : "LOCKED"}</span></p>
                    <button onClick={() => triggerVaultRequest()} className="btn-danger">Request Access</button>
                  </div>
                  <div className="action-card">
                    <h4>Wish Transmission</h4>
                    <p>Send a cosmic wish via email.</p>
                    <button onClick={() => triggerWishTransmission()} className="btn-primary" style={{marginTop: 0}}>Transmit Wish</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {status && (
        <div className="toast">
          {status}
        </div>
      )}

      <style jsx global>{`
        :root {
          --bg-color: #05070a;
          --accent: #6366f1;
          --accent-hover: #4f46e5;
          --text-primary: #f8fafc;
          --text-secondary: #94a3b8;
          --glass: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(255, 255, 255, 0.1);
        }

        body {
          margin: 0;
          font-family: 'Inter', system-ui, sans-serif;
          background: var(--bg-color);
          color: var(--text-primary);
          background-image: radial-gradient(circle at 50% -20%, #1e1b4b 0%, #05070a 60%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .dashboard-container {
          width: 100%;
          max-width: 900px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .glass-header {
          text-align: center;
        }

        .glass-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, #fff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .glass-header p {
          color: var(--text-secondary);
        }

        .tabs {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .tabs button {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .tabs button.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
        }

        .glass {
          background: var(--glass);
          backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 2rem;
        }

        .content-card {
          min-height: 300px;
          display: flex;
          flex-direction: column;
        }

        .highlight {
          color: var(--accent);
          font-weight: bold;
        }

        .btn-primary {
          display: inline-block;
          margin-top: 1.5rem;
          background: var(--accent);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          text-decoration: none;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: var(--accent-hover);
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid var(--accent);
          color: var(--accent);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: var(--accent);
          color: white;
        }

        .btn-danger {
          background: transparent;
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-danger:hover {
          background: #ef4444;
          color: white;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
        }

        .status-locked {
          color: #ef4444;
          font-weight: bold;
        }

        .status-unlocked {
          color: #22c55e;
          font-weight: bold;
        }

        .input-group {
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .input-group label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-group input {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s;
        }

        .input-group input:focus {
          border-color: var(--accent);
        }

        .actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .action-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          padding: 1.5rem;
          border-radius: 16px;
          text-align: center;
        }

        .action-card h4 {
          margin-bottom: 0.5rem;
        }

        .action-card p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .toast {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--accent);
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 99px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }

        pre {
          background: rgba(0,0,0,0.2);
          padding: 1rem;
          border-radius: 12px;
          overflow-x: auto;
          color: #a5b4fc;
        }
      `}</style>
    </main>
  );
}
