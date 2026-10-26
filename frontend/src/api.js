/**
 * StockWise AI - API Client
 * Connects React frontend to FastAPI backend.
 */
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errDetail = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errorJson = await res.json();
        errDetail = errorJson.detail || errorJson.message || errDetail;
      } catch (e) {
        // ignore fallback
      }
      throw new Error(errDetail);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on [${options.method || "GET"} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // System & Health
  async getHealth() {
    return request("/health");
  },
  async getSystemStatus() {
    return request("/system/status");
  },
  async resetSeedData() {
    return request("/system/seed/reset", { method: "POST" });
  },
  async connectMongoDB(mongodb_uri, db_name = "stockwise_ai") {
    return request("/system/connect-mongodb", {
      method: "POST",
      body: JSON.stringify({ mongodb_uri, db_name }),
    });
  },
  async getSuppliers() {
    return request("/system/suppliers");
  },

  // Products & Inventory
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== "All") query.append("category", params.category);
    if (params.search) query.append("search", params.search);
    if (params.status && params.status !== "All") query.append("status", params.status);
    const qs = query.toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },
  async getCategories() {
    return request("/products/categories/list");
  },
  async getProduct(id) {
    return request(`/products/${id}`);
  },
  async createProduct(data) {
    return request("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  async updateProduct(id, updates) {
    return request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },
  async deleteProduct(id) {
    return request(`/products/${id}`, {
      method: "DELETE",
    });
  },
  async adjustStock(id, delta, reason = "Manual adjustment") {
    return request(`/products/${id}/adjust-stock`, {
      method: "POST",
      body: JSON.stringify({ delta, reason }),
    });
  },

  // Sales
  async getSales(params = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.append("limit", params.limit);
    if (params.channel && params.channel !== "All") query.append("channel", params.channel);
    const qs = query.toString();
    return request(`/sales${qs ? `?${qs}` : ""}`);
  },
  async recordSale(saleData) {
    return request("/sales", {
      method: "POST",
      body: JSON.stringify(saleData),
    });
  },
  async getTopPerformers(limit = 5) {
    return request(`/sales/top-performers?limit=${limit}`);
  },

  // Forecasting
  async getProductForecast(productId, days = 14) {
    return request(`/forecast/product/${productId}?days=${days}`);
  },
  async getAggregateForecast(days = 14) {
    return request(`/forecast/aggregate?days=${days}`);
  },

  // AI Reorder Recommendations
  async getRecommendations() {
    return request("/recommendations");
  },
  async approveReorder(productId, quantity, notes = "") {
    return request("/recommendations/reorder", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity, notes }),
    });
  },

  // Analytics & Dashboard
  async getDashboardKPIs() {
    return request("/analytics/dashboard");
  },
  async getInsights() {
    return request("/analytics/insights");
  },
  async getRevenueTrends(days = 30) {
    return request(`/analytics/revenue-trends?days=${days}`);
  },

  // Reports
  getDownloadUrl(reportType) {
    if (reportType === "inventory-csv") return `${API_BASE}/reports/inventory/csv`;
    if (reportType === "sales-csv") return `${API_BASE}/reports/sales/csv`;
    if (reportType === "executive-pdf") return `${API_BASE}/reports/executive/pdf`;
    return "";
  },
};
