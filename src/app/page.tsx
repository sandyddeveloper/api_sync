"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("app-update");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [wish, setWish] = useState("I wish for infinite possibilities.");

  // Admin & User Authentication State
  const [adminToken, setAdminToken] = useState("nila-admin-secret-2026");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("user");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authResponse, setAuthResponse] = useState<any>(null);
  const [loginResponse, setLoginResponse] = useState<any>(null);

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

  // Push Notification Composer States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [customPushTitle, setCustomPushTitle] = useState("Cosmic Alignment 🌌");
  const [customPushMessage, setCustomPushMessage] = useState("A new celestial shift has occurred in your vault...");
  const [fetchingUsers, setFetchingUsers] = useState(false);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const res = await fetch("/api/admin/list-users", {
        headers: {
          "x-admin-token": adminToken
        }
      });
      const json = await res.json();
      if (json.success) {
        setUsersList(json.users || []);
        if (json.users && json.users.length > 0) {
          setSelectedUser(json.users[0].username);
        }
      } else {
        console.error("Failed to load users:", json.error);
      }
    } catch (err) {
      console.error("Error fetching user list:", err);
    }
    setFetchingUsers(false);
  };

  const triggerCustomPush = async () => {
    if (!selectedUser) {
      setStatus("Error: Please select a user first.");
      return;
    }

    setStatus(`Sending push to ${selectedUser}...`);
    try {
      const user = usersList.find(u => u.username === selectedUser);
      const targetId = user?.subscriptionId || user?.username;

      if (!targetId) {
        setStatus("Error: Target identifier not found.");
        return;
      }

      const res = await fetch("/api/notifications/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: customPushTitle,
          message: customPushMessage,
          playerIds: [targetId]
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus(`Push sent successfully to ${selectedUser}!`);
      } else {
        setStatus(`Failed: ${json.error || "Unknown error"}`);
      }
      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      setStatus("Error transmitting push notification");
    }
  };

  useEffect(() => {
    fetchData("vault/approve"); // Check vault status on load
    if (activeTab === "app-update") fetchData("app/update");
    if (activeTab === "permissions") fetchData("email/permission");
    if (activeTab === "actions") fetchUsers();
  }, [activeTab, adminToken]);

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Creating user...");
    setAuthResponse(null);
    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          username: regUsername,
          password: regPassword,
          role: regRole,
        }),
      });
      const json = await res.json();
      setAuthResponse(json);
      if (json.success) {
        setStatus("User created successfully!");
        setRegUsername("");
        setRegPassword("");
      } else {
        setStatus(`Error: ${json.error}`);
      }
      setTimeout(() => setStatus(null), 4000);
    } catch (err: any) {
      console.error(err);
      setStatus("Failed to connect to API");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Logging in...");
    setLoginResponse(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });
      const json = await res.json();
      setLoginResponse(json);
      if (json.success) {
        setStatus("Login successful!");
      } else {
        setStatus(`Error: ${json.error}`);
      }
      setTimeout(() => setStatus(null), 4000);
    } catch (err: any) {
      console.error(err);
      setStatus("Failed to connect to API");
    }
  };

  return (
    <main className="dashboard-container">
      <header className="glass-header">
        <h1>Nila Admin API Dashboard</h1>
        <p>Manage app updates, user authentications, and push notifications.</p>
      </header>

      <div className="tabs">
        <button onClick={() => setActiveTab("app-update")} className={activeTab === "app-update" ? "active" : ""}>App Update</button>
        <button onClick={() => setActiveTab("permissions")} className={activeTab === "permissions" ? "active" : ""}>Permissions</button>
        <button onClick={() => setActiveTab("actions")} className={activeTab === "actions" ? "active" : ""}>Trigger Actions</button>
        <button onClick={() => setActiveTab("auth")} className={activeTab === "auth" ? "active" : ""}>User Management & Auth</button>
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
                  <div className="action-card full-width-card" style={{ gridColumn: "span 2", padding: "20px" }}>
                    <h4>📣 Targeted Push Notification Composer</h4>
                    <p className="description" style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "16px" }}>
                      Fetch registered accounts, select a target, and broadcast a customized push notification using their OneSignal subscription ID or username alias.
                    </p>
                    
                    <div className="composer-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px", textAlign: "left" }}>
                      <div className="composer-col">
                        <div className="input-group-compact" style={{ marginBottom: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <label style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#60a5fa" }}>Target Recipient</label>
                            <button 
                              onClick={fetchUsers} 
                              className="btn-refresh" 
                              style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontSize: "11px", padding: "0" }}
                            >
                              {fetchingUsers ? "Loading..." : "🔄 Refresh List"}
                            </button>
                          </div>
                          {usersList.length === 0 ? (
                            <div className="no-users-warning" style={{ fontSize: "12px", color: "#f87171", padding: "8px", background: "rgba(248, 113, 113, 0.1)", borderRadius: "6px", border: "1px solid rgba(248,113,113,0.2)" }}>
                              No users found. Ensure admin credentials are correct and users are registered in KV.
                            </div>
                          ) : (
                            <select 
                              value={selectedUser} 
                              onChange={(e) => setSelectedUser(e.target.value)}
                              className="custom-select"
                              style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
                            >
                              {usersList.map((u) => (
                                <option key={u.username} value={u.username} style={{ background: "#111" }}>
                                  {u.username} ({u.role}) — {u.subscriptionId ? "📱 Active Device" : "❌ No Device Token"}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        {selectedUser && (
                          <div className="user-token-info" style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                            Resolved Target: <code style={{ color: "#38bdf8", fontSize: "10px", background: "rgba(0,0,0,0.2)", padding: "2px 4px", borderRadius: "3px" }}>
                              {usersList.find(u => u.username === selectedUser)?.subscriptionId || `alias: ${selectedUser}`}
                            </code>
                          </div>
                        )}
                      </div>

                      <div className="composer-col">
                        <div className="input-group-compact" style={{ marginBottom: "8px" }}>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#60a5fa", marginBottom: "4px" }}>Push Title</label>
                          <input 
                            type="text" 
                            value={customPushTitle} 
                            onChange={(e) => setCustomPushTitle(e.target.value)}
                            placeholder="e.g. Cosmic Alignment"
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
                          />
                        </div>

                        <div className="input-group-compact">
                          <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#60a5fa", marginBottom: "4px" }}>Push Message</label>
                          <input 
                            type="text" 
                            value={customPushMessage} 
                            onChange={(e) => setCustomPushMessage(e.target.value)}
                            placeholder="Message content..."
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={triggerCustomPush} 
                      className="btn-primary" 
                      style={{ width: "100%", padding: "10px", cursor: "pointer", border: "none", marginTop: "8px" }}
                      disabled={usersList.length === 0}
                    >
                      🚀 Broadcast Targeted Push Notification
                    </button>
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

            {activeTab === "auth" && (
              <div className="auth-view">
                <div className="admin-token-section">
                  <h3>🔑 Administrative Credentials</h3>
                  <p className="description">Enter the secret admin token required to invoke the user registration API. By default, it uses the local development token.</p>
                  <div className="input-group" style={{ marginBottom: "0", maxWidth: "100%" }}>
                    <label>Admin Secret Token</label>
                    <input 
                      type="password" 
                      value={adminToken} 
                      onChange={(e) => setAdminToken(e.target.value)}
                      placeholder="Enter admin secret..."
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div className="auth-grid">
                  {/* Left panel: Create User */}
                  <form onSubmit={handleCreateUser} className="auth-card">
                    <h4>✨ Create User Account</h4>
                    <p className="description">Admin registers a new user with username and password in Vercel KV.</p>
                    
                    <div className="input-group-compact">
                      <label>Username</label>
                      <input 
                        type="text" 
                        value={regUsername} 
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="e.g. santhosh_dev"
                        required
                      />
                    </div>
                    
                    <div className="input-group-compact">
                      <label>Password</label>
                      <input 
                        type="password" 
                        value={regPassword} 
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                      />
                    </div>

                    <div className="input-group-compact">
                      <label>Account Role</label>
                      <select 
                        value={regRole} 
                        onChange={(e) => setRegRole(e.target.value)}
                        className="custom-select"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: "1rem", cursor: "pointer", border: "none" }}>
                      Create Account
                    </button>

                    {authResponse && (
                      <div className={`response-box ${authResponse.success ? "success" : "error"}`}>
                        <strong>Response status: {authResponse.success ? "201 Created" : "Bad Request"}</strong>
                        <pre style={{ fontSize: "11px", margin: "5px 0 0 0" }}>{JSON.stringify(authResponse, null, 2)}</pre>
                      </div>
                    )}
                  </form>

                  {/* Right panel: Login User */}
                  <form onSubmit={handleLogin} className="auth-card">
                    <h4>🔒 User Login Gateway</h4>
                    <p className="description">Authenticate credentials against KV database and obtain a session token.</p>
                    
                    <div className="input-group-compact">
                      <label>Username</label>
                      <input 
                        type="text" 
                        value={loginUsername} 
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="Enter username"
                        required
                      />
                    </div>
                    
                    <div className="input-group-compact">
                      <label>Password</label>
                      <input 
                        type="password" 
                        value={loginPassword} 
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: "4.8rem", cursor: "pointer", border: "none" }}>
                      Sign In & Generate Token
                    </button>

                    {loginResponse && (
                      <div className={`response-box ${loginResponse.success ? "success" : "error"}`}>
                        <strong>Response status: {loginResponse.success ? "200 OK" : "401 Unauthorized"}</strong>
                        <pre style={{ fontSize: "11px", margin: "5px 0 0 0" }}>{JSON.stringify(loginResponse, null, 2)}</pre>
                      </div>
                    )}
                  </form>
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
          flex-wrap: wrap;
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
          z-index: 1000;
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

        /* Authentication Page Custom Styles */
        .auth-view {
          display: flex;
          flex-direction: column;
        }

        .admin-token-section {
          background: rgba(99, 102, 241, 0.05);
          border: 1px solid var(--glass-border);
          padding: 1.5rem;
          border-radius: 16px;
          margin-bottom: 2rem;
        }

        .admin-token-section h3 {
          margin: 0 0 0.5rem 0;
          color: #a5b4fc;
        }

        .description {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }

        .auth-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--glass-border);
          padding: 1.5rem;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .auth-card h4 {
          margin: 0;
          font-size: 1.2rem;
          color: #fff;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.5rem;
        }

        .input-group-compact {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .input-group-compact label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-group-compact input, .custom-select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          outline: none;
          font-family: inherit;
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }

        .input-group-compact input:focus, .custom-select:focus {
          border-color: var(--accent);
        }

        .custom-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
          padding-right: 2rem;
        }

        .custom-select option {
          background: #090d16;
          color: white;
        }

        .response-box {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.8rem;
          text-align: left;
        }

        .response-box.success {
          background: rgba(34, 197, 94, 0.06);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: #4ade80;
        }

        .response-box.error {
          background: rgba(239, 68, 68, 0.06);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        @media (max-width: 768px) {
          .auth-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
