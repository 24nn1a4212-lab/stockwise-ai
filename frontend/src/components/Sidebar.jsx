import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Sparkles,
  BarChart3,
  FileText,
  Settings,
  Database,
  CloudCheck,
  AlertTriangle
} from "lucide-react";

export default function Sidebar({
  activePage,
  setActivePage,
  alertCount,
  systemStatus
}) {
  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "Inventory", label: "Inventory", icon: Package },
    { id: "Sales", label: "Sales & Orders", icon: ShoppingCart },
    { id: "Forecast", label: "Demand Forecast", icon: TrendingUp },
    { id: "Reorder", label: "AI Reorder & EOQ", icon: Sparkles },
    { id: "Analytics", label: "Analytics & BI", icon: BarChart3 },
    { id: "Reports", label: "Reports & Exports", icon: FileText },
    { id: "Settings", label: "System & Config", icon: Settings },
  ];

  const isDemo = systemStatus?.demo_mode;
  const isMongo = systemStatus?.mongodb_connected;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">S</div>
        <div>
          <h2>StockWise AI</h2>
          <p>Intelligence Platform</p>
        </div>
      </div>

      <div className="system-status-indicator">
        {isMongo ? (
          <div className="status-pill mongo">
            <span className="live-dot green-dot" />
            <span>Atlas Cloud Connected</span>
          </div>
        ) : (
          <div className="status-pill demo" title={systemStatus?.message || "Running in offline demo mode"}>
            <span className="live-dot amber-dot" />
            <span>Demo Store (Offline)</span>
          </div>
        )}
      </div>

      <p className="menu-label">ENTERPRISE WORKSPACE</p>

      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              className={`nav-link ${isActive ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={17} className="nav-icon" />
              <span>{item.label}</span>
              {item.id === "Inventory" && alertCount > 0 && (
                <span className="nav-count" title={`${alertCount} items need attention`}>
                  {alertCount}
                </span>
              )}
              {item.id === "Reorder" && (
                <span className="ai-tag">AI</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="system-metric-row">
          <span>Storage</span>
          <strong>{isMongo ? "MongoDB Atlas" : "Persistent JSON"}</strong>
        </div>
        <div className="system-metric-row">
          <span>Engine</span>
          <strong>FastAPI + Scikit-Learn</strong>
        </div>
        <div className="connection-health">
          <span className="online-dot" />
          <span>Systems operational</span>
        </div>
      </div>
    </aside>
  );
}
