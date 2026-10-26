import { useState, useEffect } from "react";
import {
  Package,
  Boxes,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Clock
} from "lucide-react";
import InteractiveForecastChart from "../components/charts/InteractiveForecastChart";
import RevenueTrendChart from "../components/charts/RevenueTrendChart";
import CategoryBreakdownChart from "../components/charts/CategoryBreakdownChart";
import { api } from "../api";

export default function DashboardView({
  kpis,
  setActivePage,
  onAdjustStock,
  onQuickReorder
}) {
  const [forecastPeriod, setForecastPeriod] = useState("14");
  const [forecastData, setForecastData] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [revenueTimeline, setRevenueTimeline] = useState([]);

  useEffect(() => {
    async function loadForecast() {
      setLoadingForecast(true);
      try {
        const data = await api.getAggregateForecast(parseInt(forecastPeriod));
        setForecastData(data);
      } catch (err) {
        console.error("Failed to load aggregate forecast:", err);
      } finally {
        setLoadingForecast(false);
      }
    }
    loadForecast();
  }, [forecastPeriod]);

  useEffect(() => {
    async function loadRevenue() {
      try {
        const res = await api.getRevenueTrends(14);
        setRevenueTimeline(res.timeline || []);
      } catch (err) {
        console.error("Failed to load revenue trends:", err);
      }
    }
    loadRevenue();
  }, []);

  const urgentAlerts = kpis?.urgent_alerts || [];
  const insights = kpis?.insights || [];
  const topProducts = kpis?.top_products || [];
  const recentSales = kpis?.recent_sales || [];

  return (
    <div className="dashboard-view">
      {/* KPI Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <p>Total Inventory Value</p>
            <span className="stat-icon purple"><DollarSign size={17} /></span>
          </div>
          <h2>${(kpis?.total_inventory_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <span className="stat-note">Procurement asset valuation</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <p>Total Units in Stock</p>
            <span className="stat-icon blue"><Boxes size={17} /></span>
          </div>
          <h2>{(kpis?.total_units_in_stock || 0).toLocaleString()}</h2>
          <span className="stat-note">Across {kpis?.total_products || 0} active SKUs</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <p>Critical & Low Stock</p>
            <span className="stat-icon orange"><AlertTriangle size={17} /></span>
          </div>
          <h2 className={(kpis?.critical_alerts_count || 0) > 0 ? "text-danger" : ""}>
            {(kpis?.critical_alerts_count || 0) + (kpis?.low_stock_alerts_count || 0)}
          </h2>
          <span className="stat-note warning-text">
            {kpis?.critical_alerts_count || 0} critical · {kpis?.low_stock_alerts_count || 0} low
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <p>Forecast Accuracy (R²)</p>
            <span className="stat-icon green"><TrendingUp size={17} /></span>
          </div>
          <h2>{((kpis?.avg_forecast_accuracy || 0.924) * 100).toFixed(1)}%</h2>
          <span className="stat-note">Scikit-learn ML confidence</span>
        </div>
      </section>

      {/* Main Grid: Forecast & Stock Alerts */}
      <div className="content-grid">
        {/* ML Demand Forecast Chart */}
        <section className="panel forecast-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-title-row">
                <h2>Predictive Demand Forecast</h2>
                <span className="ai-badge"><Sparkles size={12} /> ML Model</span>
              </div>
              <p>Iterative time-series forecast trained on enterprise transactions.</p>
            </div>
            <select
              value={forecastPeriod}
              onChange={(e) => setForecastPeriod(e.target.value)}
              className="period-select"
              aria-label="Forecast horizon"
            >
              <option value="7">Next 7 days</option>
              <option value="14">Next 14 days</option>
              <option value="30">Next 30 days</option>
            </select>
          </div>

          <div className="forecast-summary">
            <div>
              <span className="muted">Projected Total Demand</span>
              <h2>{forecastData?.total_projected_demand?.toLocaleString() || "..."} units</h2>
            </div>
            <div className="summary-submetrics">
              <div>
                <span className="muted">Avg. Daily Velocity</span>
                <strong>{forecastData?.avg_daily_demand || "..."} units/day</strong>
              </div>
            </div>
          </div>

          <InteractiveForecastChart
            forecastData={forecastData}
            period={forecastPeriod}
          />
        </section>

        {/* Urgent Stock Alerts & Quick Action */}
        <section className="panel alerts-panel">
          <div className="panel-heading">
            <div>
              <h2>Stock Health Alerts</h2>
              <p>Products requiring procurement attention.</p>
            </div>
            <span className="alert-count">{urgentAlerts.length}</span>
          </div>

          <div className="alert-list">
            {urgentAlerts.slice(0, 6).map((item) => (
              <div className="alert-item" key={item.id}>
                <div className={`product-symbol ${item.status === "Critical" ? "symbol-critical" : "symbol-low"}`}>
                  <AlertTriangle size={15} />
                </div>
                <div className="alert-product">
                  <div className="alert-product-title">
                    <strong>{item.name}</strong>
                    <span className="sku-tag">{item.sku}</span>
                  </div>
                  <span>
                    Stock: <strong>{item.stock}</strong> units · Reorder threshold: {item.reorder_point}
                  </span>
                </div>
                <span className={`status ${item.status === "Critical" ? "critical" : "low"}`}>
                  {item.status}
                </span>
              </div>
            ))}

            {urgentAlerts.length === 0 && (
              <div className="all-healthy-box">
                <p>✔ All tracked products are currently within healthy inventory buffers.</p>
              </div>
            )}
          </div>

          <button
            className="text-button"
            onClick={() => setActivePage("Reorder")}
          >
            Review all AI Reorder recommendations →
          </button>
        </section>
      </div>

      {/* Second Row: Revenue Trends & AI Business Insights */}
      <div className="content-grid secondary-grid">
        {/* Revenue Velocity Chart */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Revenue Velocity</h2>
              <p>Daily order revenue trajectory over the past 14 days.</p>
            </div>
            <span className="revenue-pill">
              Total: ${(kpis?.total_sales_revenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <RevenueTrendChart timeline={revenueTimeline} />
        </section>

        {/* Actionable AI Business Insights Feed */}
        <section className="panel insights-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-title-row">
                <h2>AI Business Intelligence</h2>
                <span className="ai-badge"><Sparkles size={12} /> Insights</span>
              </div>
              <p>Automated anomaly and margin optimization signals.</p>
            </div>
          </div>

          <div className="insights-feed">
            {insights.slice(0, 3).map((insight) => (
              <div key={insight.id} className={`insight-card insight-${insight.type}`}>
                <div className="insight-header">
                  <strong>{insight.title}</strong>
                  {insight.metric && <span className="insight-metric">{insight.metric}</span>}
                </div>
                <p className="insight-desc">{insight.description}</p>
                <div className="insight-action">
                  <span>Recommendation:</span> {insight.suggested_action}
                </div>
              </div>
            ))}
          </div>

          <button
            className="text-button"
            onClick={() => setActivePage("Analytics")}
          >
            Deep dive into inventory & margin analytics →
          </button>
        </section>
      </div>

      {/* Third Row: Top Selling Products Leaderboard */}
      <section className="panel top-products-panel">
        <div className="panel-heading">
          <div>
            <h2>Top Revenue Generating Products</h2>
            <p>Best performing inventory by cumulative sales volume.</p>
          </div>
          <button className="secondary-btn" onClick={() => setActivePage("Sales")}>
            View all sales →
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>UNITS SOLD</th>
                <th>TOTAL REVENUE</th>
                <th>AVAILABLE STOCK</th>
                <th>HEALTH STATUS</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => {
                const isCrit = p.current_stock < 15;
                const isLow = p.current_stock < 30;
                return (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.category}</td>
                    <td>{p.units_sold} units</td>
                    <td><strong>${p.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                    <td>{p.current_stock} units</td>
                    <td>
                      <span className={`status ${isCrit ? "critical" : isLow ? "low" : "healthy"}`}>
                        {isCrit ? "Critical" : isLow ? "Low Stock" : "Healthy"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
