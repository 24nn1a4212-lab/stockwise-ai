import { RefreshCw, Database, FileSpreadsheet, ShieldAlert } from "lucide-react";

export default function Header({
  activePage,
  systemStatus,
  onRefresh,
  loading,
  setActivePage
}) {
  const isDemo = systemStatus?.demo_mode;

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">OPERATIONS INTELLIGENCE / {activePage.toUpperCase()}</p>
        <h1>
          {activePage === "Dashboard" && "Executive Operations Dashboard"}
          {activePage === "Inventory" && "Inventory & Catalog Control"}
          {activePage === "Sales" && "Sales & Transaction Hub"}
          {activePage === "Forecast" && "AI Demand Forecasting Engine"}
          {activePage === "Reorder" && "Smart Reorder & EOQ Optimizer"}
          {activePage === "Analytics" && "Business Intelligence & Margins"}
          {activePage === "Reports" && "Data Exports & Executive Reports"}
          {activePage === "Settings" && "System Configuration & Database"}
        </h1>
        <p className="subtitle">
          Real-time enterprise inventory intelligence and predictive demand decision support.
        </p>
      </div>

      <div className="topbar-actions">
        {isDemo ? (
          <button
            className="header-badge demo-badge"
            onClick={() => setActivePage("Settings")}
            title="Click to configure MongoDB Atlas credentials"
          >
            <ShieldAlert size={14} />
            <span>Demo Mode Active</span>
          </button>
        ) : (
          <div className="header-badge atlas-badge">
            <Database size={14} />
            <span>MongoDB Atlas</span>
          </div>
        )}

        <button
          className={`refresh-btn ${loading ? "spinning" : ""}`}
          onClick={onRefresh}
          title="Refresh real-time data from backend API"
          disabled={loading}
        >
          <RefreshCw size={15} />
          <span>Sync</span>
        </button>

        <div className="profile">
          <div className="avatar">SW</div>
          <div>
            <strong>Operations Director</strong>
            <p>Admin Workspace</p>
          </div>
        </div>
      </div>
    </header>
  );
}
