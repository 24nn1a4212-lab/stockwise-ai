import { useState } from "react";
import {
  Settings,
  Database,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  ExternalLink,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { api } from "../api";

export default function SettingsView({
  systemStatus,
  onRefresh,
  showToast
}) {
  const [mongoUri, setMongoUri] = useState("");
  const [dbName, setDbName] = useState("stockwise_ai");
  const [testingConnection, setTestingConnection] = useState(false);
  const [resetting, setResetting] = useState(false);

  const isDemo = systemStatus?.demo_mode;
  const isMongo = systemStatus?.mongodb_connected;

  async function handleConnectMongo(e) {
    e.preventDefault();
    if (!mongoUri.trim()) {
      showToast("error", "Validation Error", "MongoDB connection URI cannot be empty.");
      return;
    }

    setTestingConnection(true);
    try {
      const res = await api.connectMongoDB(mongoUri.trim(), dbName.trim());
      showToast(
        "success",
        "Connected to MongoDB Atlas",
        `Successfully linked to database '${res.database_name}'. Real-time cloud sync active!`
      );
      setMongoUri("");
      onRefresh();
    } catch (err) {
      showToast("error", "Connection Failed", err.message);
    } finally {
      setTestingConnection(false);
    }
  }

  async function handleResetData() {
    if (!confirm("Are you sure you want to reset all inventory and sales data to the rich enterprise sample baseline?")) {
      return;
    }

    setResetting(true);
    try {
      const res = await api.resetSeedData();
      showToast("success", "Dataset Reset", res.message);
      onRefresh();
    } catch (err) {
      showToast("error", "Reset Failed", err.message);
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="settings-view">
      {/* System Status Panel */}
      <section className="panel status-overview-panel">
        <div className="panel-heading">
          <div>
            <h2>Database & Architecture Status</h2>
            <p>Active storage engine, operational modes, and environment health.</p>
          </div>
          <div className="db-indicator-pill">
            {isMongo ? (
              <span className="status healthy">Atlas Cloud Connected</span>
            ) : (
              <span className="status low">Offline Demo Mode (JSON Persisted)</span>
            )}
          </div>
        </div>

        <div className="status-grid-cards">
          <div className="status-metric-card">
            <span className="metric-icon"><Database size={17} /></span>
            <div>
              <span className="cell-sub">Active Database</span>
              <strong>{systemStatus?.database_name || "LocalDemoStore"}</strong>
            </div>
          </div>

          <div className="status-metric-card">
            <span className="metric-icon"><Server size={17} /></span>
            <div>
              <span className="cell-sub">Catalog Products</span>
              <strong>{systemStatus?.total_products || 0} active SKUs</strong>
            </div>
          </div>

          <div className="status-metric-card">
            <span className="metric-icon"><Cpu size={17} /></span>
            <div>
              <span className="cell-sub">Fulfillment Sales</span>
              <strong>{systemStatus?.total_sales || 0} orders recorded</strong>
            </div>
          </div>

          <div className="status-metric-card">
            <span className="metric-icon"><ShieldCheck size={17} /></span>
            <div>
              <span className="cell-sub">Storage Mechanism</span>
              <strong>{isMongo ? "MongoDB Atlas SRV" : "Persistent Local JSON"}</strong>
            </div>
          </div>
        </div>

        <div className="status-note-box">
          <p>
            {isDemo ? (
              <>
                <strong>Demo Mode Active:</strong> The application is currently running using its robust local JSON persistent repository.
                All additions, sales transactions, and stock changes are saved to disk (<code>{systemStatus?.storage_file}</code>).
                You can link a MongoDB Atlas cluster below at any time without restarting the application!
              </>
            ) : (
              <>
                <strong>MongoDB Atlas Connected:</strong> The application is streaming reads and writes directly to your cloud MongoDB Atlas cluster.
              </>
            )}
          </p>
        </div>
      </section>

      {/* MongoDB Atlas Setup */}
      <div className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Link MongoDB Atlas Cloud</h2>
              <p>Connect your MongoDB Atlas cluster connection string.</p>
            </div>
            <Key size={18} className="text-purple" />
          </div>

          <form onSubmit={handleConnectMongo} className="settings-form">
            <div className="form-group">
              <label>MongoDB Atlas Connection URI</label>
              <input
                type="text"
                placeholder="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority"
                value={mongoUri}
                onChange={(e) => setMongoUri(e.target.value)}
              />
              <span className="input-hint">
                Provide your MongoDB Atlas connection string with username and password.
              </span>
            </div>

            <div className="form-group">
              <label>Target Database Name</label>
              <input
                type="text"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
              />
            </div>

            <div className="settings-action-row">
              <button
                type="submit"
                className="primary-btn"
                disabled={testingConnection || !mongoUri.trim()}
              >
                {testingConnection ? "Testing & Connecting..." : "Connect to MongoDB Atlas"}
              </button>
            </div>
          </form>
        </section>

        {/* Enterprise Sample Data Manager */}
        <section className="panel seed-control-panel">
          <div className="panel-heading">
            <div>
              <h2>Sample Data & Factory Reset</h2>
              <p>Re-populate rich realistic enterprise catalog and sales history.</p>
            </div>
            <RotateCcw size={18} className="text-purple" />
          </div>

          <div className="seed-content">
            <p className="seed-desc">
              Resets the database to a rich baseline dataset containing 16 diverse products across Electronics, Computing, Ergonomics, Audio, and Accessories, plus ~180 realistic sales orders spanning the last 90 days.
            </p>

            <div className="seed-benefits">
              <div className="benefit-item">
                <CheckCircle2 size={15} className="text-success" />
                <span>Immediate demonstration of Scikit-learn demand forecasting curves</span>
              </div>
              <div className="benefit-item">
                <CheckCircle2 size={15} className="text-success" />
                <span>Populates critical and low stock reorder alerts for EOQ testing</span>
              </div>
              <div className="benefit-item">
                <CheckCircle2 size={15} className="text-success" />
                <span>Restores supplier directory and category margins</span>
              </div>
            </div>

            <button
              className="secondary-btn reset-btn"
              onClick={handleResetData}
              disabled={resetting}
            >
              <RotateCcw size={14} className={resetting ? "spinning" : ""} />
              <span>{resetting ? "Resetting Dataset..." : "Reset to Enterprise Sample Baseline"}</span>
            </button>
          </div>
        </section>
      </div>

      {/* Interactive API Docs Link */}
      <section className="panel api-docs-panel">
        <div className="panel-heading">
          <div>
            <h3>Interactive FastAPI Documentation</h3>
            <p>Explore all OpenAPI / Swagger endpoints and schema definitions directly.</p>
          </div>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="secondary-btn"
          >
            <span>Open Swagger UI</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </section>
    </div>
  );
}
