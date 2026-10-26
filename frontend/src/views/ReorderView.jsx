import { useState, useEffect } from "react";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  Truck,
  ArrowRight,
  ShieldCheck,
  TrendingDown
} from "lucide-react";
import { api } from "../api";

export default function ReorderView({
  onRefresh,
  showToast
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    setLoading(true);
    try {
      const data = await api.getRecommendations();
      setRecommendations(data || []);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      showToast("error", "Error", "Could not load reorder recommendations.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveReorder(rec) {
    setProcessingId(rec.product_id);
    try {
      const res = await api.approveReorder(
        rec.product_id,
        rec.recommended_order_qty || rec.eoq,
        `Approved AI Reorder: EOQ ${rec.eoq}`
      );
      showToast(
        "success",
        "Purchase Order Generated",
        `${res.purchase_order_id}: Stock for '${rec.product_name}' replenished (+${res.units_ordered} units)!`
      );
      await loadRecommendations();
      onRefresh();
    } catch (err) {
      showToast("error", "PO Creation Failed", err.message);
    } finally {
      setProcessingId(null);
    }
  }

  const criticalCount = recommendations.filter((r) => r.urgency === "CRITICAL").length;
  const highCount = recommendations.filter((r) => r.urgency === "HIGH").length;
  const totalRestockCost = recommendations
    .filter((r) => r.urgency === "CRITICAL" || r.urgency === "HIGH")
    .reduce((sum, r) => sum + (r.estimated_order_cost || 0), 0);

  return (
    <div className="reorder-view">
      {/* Reorder Summary Highlights */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <p>Critical Urgent Reorders</p>
            <span className="stat-icon orange"><AlertTriangle size={17} /></span>
          </div>
          <h2 className="text-danger">{criticalCount} SKUs</h2>
          <span className="stat-note warning-text">Supply buffer &lt; supplier lead time</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <p>High Priority Reorders</p>
            <span className="stat-icon purple"><TrendingDown size={17} /></span>
          </div>
          <h2>{highCount} SKUs</h2>
          <span className="stat-note">Nearing threshold this cycle</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <p>Estimated Restock Capital</p>
            <span className="stat-icon blue"><PackageCheck size={17} /></span>
          </div>
          <h2>${totalRestockCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <span className="stat-note">To replenish critical & high priority</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <p>Optimization Algorithm</p>
            <span className="stat-icon green"><Sparkles size={17} /></span>
          </div>
          <h2>Wilson EOQ</h2>
          <span className="stat-note">Economic Order Quantity Model</span>
        </div>
      </section>

      {/* Main Recommendations Matrix */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <div className="panel-title-row">
              <h2>AI Reorder & Supply Chain Recommendations</h2>
              <span className="ai-badge"><Sparkles size={12} /> Optimization Engine</span>
            </div>
            <p>
              Smart Economic Order Quantity (EOQ) calculations balancing holding cost vs ordering setup fees with lead time risk scoring.
            </p>
          </div>
          <button className="secondary-btn" onClick={loadRecommendations} disabled={loading}>
            Refresh Matrix
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>PRODUCT & SKU</th>
                <th>CURRENT STOCK</th>
                <th>DAILY VELOCITY</th>
                <th>DAYS OF BUFFER</th>
                <th>SUPPLIER / LEAD</th>
                <th>OPTIMAL EOQ</th>
                <th>RECOMMENDED QTY</th>
                <th>EST. COST</th>
                <th>STOCKOUT RISK</th>
                <th>URGENCY</th>
                <th style={{ textAlign: "right" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((rec) => {
                const isCrit = rec.urgency === "CRITICAL";
                const isHigh = rec.urgency === "HIGH";
                const isMod = rec.urgency === "MODERATE";
                const isProcessing = processingId === rec.product_id;

                return (
                  <tr key={rec.product_id} className={isCrit ? "crit-row" : ""}>
                    <td>
                      <div className="product-cell">
                        <strong>{rec.product_name}</strong>
                        <span className="cell-sub">{rec.sku} · {rec.category}</span>
                      </div>
                    </td>
                    <td>
                      <div className="stock-level-cell">
                        <strong>{rec.current_stock} units</strong>
                        <span className="cell-sub">Reorder pt: {rec.reorder_point}</span>
                      </div>
                    </td>
                    <td>{rec.daily_velocity} / day</td>
                    <td>
                      <span className={`buffer-tag ${rec.days_of_stock_left <= rec.lead_time_days ? "buffer-danger" : "buffer-ok"}`}>
                        {rec.days_of_stock_left} days
                      </span>
                    </td>
                    <td>
                      <div className="supplier-cell">
                        <span>{rec.supplier_name}</span>
                        <span className="cell-sub"><Truck size={11} style={{ display: "inline", verticalAlign: "middle" }} /> {rec.lead_time_days}d lead time</span>
                      </div>
                    </td>
                    <td>
                      <span className="eoq-badge">{rec.eoq} units</span>
                    </td>
                    <td>
                      <strong>{rec.recommended_order_qty} units</strong>
                    </td>
                    <td>
                      ${rec.estimated_order_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <div className="risk-meter-wrapper">
                        <div className="risk-bar-bg">
                          <div
                            className={`risk-bar-fill ${rec.stockout_risk_score > 75 ? "fill-critical" : rec.stockout_risk_score > 40 ? "fill-high" : "fill-low"}`}
                            style={{ width: `${rec.stockout_risk_score}%` }}
                          />
                        </div>
                        <span className="risk-score-text">{rec.stockout_risk_score}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status ${isCrit ? "critical" : isHigh ? "low" : "healthy"}`}>
                        {rec.urgency}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {rec.urgency !== "OPTIMAL" ? (
                        <button
                          className={`reorder-action-btn ${isCrit ? "crit-btn" : "norm-btn"}`}
                          onClick={() => handleApproveReorder(rec)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? "Placing..." : "Approve & PO"}
                        </button>
                      ) : (
                        <span className="status healthy" style={{ fontSize: "10px" }}>
                          Optimal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {recommendations.length === 0 && (
                <tr>
                  <td colSpan="11" style={{ textAlign: "center", padding: "36px" }}>
                    <p className="muted">Evaluating supply chain models...</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
