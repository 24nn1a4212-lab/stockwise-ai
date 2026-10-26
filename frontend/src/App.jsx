import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Toast from "./components/Toast";
import DashboardView from "./views/DashboardView";
import InventoryView from "./views/InventoryView";
import SalesView from "./views/SalesView";
import ForecastView from "./views/ForecastView";
import ReorderView from "./views/ReorderView";
import AnalyticsView from "./views/AnalyticsView";
import ReportsView from "./views/ReportsView";
import SettingsView from "./views/SettingsView";
import { api } from "./api";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sales, setSales] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Dispatcher
  const showToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Main Data Refresh function
  const loadData = useCallback(async () => {
    try {
      const [prodRes, catsRes, salesRes, kpiRes, statusRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getSales({ limit: 100 }),
        api.getDashboardKPIs(),
        api.getSystemStatus(),
      ]);

      setProducts(prodRes.products || []);
      setCategories(catsRes || []);
      setSales(salesRes.sales || []);
      setKpis(kpiRes);
      setSystemStatus(statusRes);
      setConnectionError(null);
    } catch (err) {
      console.error("Initial data load error:", err);
      setConnectionError(
        "Could not connect to FastAPI backend at http://127.0.0.1:8000. Please ensure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Urgent alerts count for sidebar badge
  const alertCount = products.filter((p) => p.status === "Critical" || p.status === "Low Stock").length;

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        alertCount={alertCount}
        systemStatus={systemStatus}
      />

      <main className="main-content">
        <Header
          activePage={activePage}
          systemStatus={systemStatus}
          onRefresh={loadData}
          loading={loading}
          setActivePage={setActivePage}
        />

        {connectionError && (
          <div className="backend-offline-banner">
            <div>
              <strong>Backend Disconnected:</strong> {connectionError}
            </div>
            <button className="primary-btn mini-btn" onClick={loadData}>
              Retry Connection
            </button>
          </div>
        )}

        {/* View Switching */}
        {activePage === "Dashboard" && (
          <DashboardView
            kpis={kpis}
            setActivePage={setActivePage}
            onAdjustStock={loadData}
          />
        )}

        {activePage === "Inventory" && (
          <InventoryView
            products={products}
            categories={categories}
            onRefresh={loadData}
            showToast={showToast}
          />
        )}

        {activePage === "Sales" && (
          <SalesView
            sales={sales}
            products={products}
            onRefresh={loadData}
            showToast={showToast}
          />
        )}

        {activePage === "Forecast" && (
          <ForecastView products={products} />
        )}

        {activePage === "Reorder" && (
          <ReorderView
            onRefresh={loadData}
            showToast={showToast}
          />
        )}

        {activePage === "Analytics" && (
          <AnalyticsView
            products={products}
            sales={sales}
            kpis={kpis}
          />
        )}

        {activePage === "Reports" && (
          <ReportsView showToast={showToast} />
        )}

        {activePage === "Settings" && (
          <SettingsView
            systemStatus={systemStatus}
            onRefresh={loadData}
            showToast={showToast}
          />
        )}

        <footer>
          StockWise AI · Business Operations and Intelligence Platform · Scikit-Learn Predictive Engine · MongoDB Atlas / Resilient Demo Mode
        </footer>
      </main>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
