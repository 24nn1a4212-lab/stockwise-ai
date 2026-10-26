import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  Filter,
  PlusCircle,
  MinusCircle
} from "lucide-react";
import { api } from "../api";

export default function InventoryView({
  products = [],
  categories = [],
  onRefresh,
  showToast
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "Electronics",
    stock: 20,
    unit_cost: 25.0,
    unit_price: 59.99,
    reorder_point: 20,
    target_stock: 75,
    supplier_name: "Apex Electronics Supply Co.",
    lead_time_days: 7,
    daily_demand: 5,
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = `${p.name} ${p.sku} ${p.category} ${p.supplier_name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchStatus = selectedStatus === "All" || p.status === selectedStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, selectedCategory, selectedStatus]);

  async function handleQuickStockAdjust(productId, delta) {
    try {
      await api.adjustStock(productId, delta, "Quick stepper adjustment");
      onRefresh();
      showToast(
        "success",
        "Stock Updated",
        `Inventory adjusted by ${delta > 0 ? `+${delta}` : delta} units.`
      );
    } catch (err) {
      showToast("error", "Adjustment Failed", err.message);
    }
  }

  function openAddModal() {
    setFormData({
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      name: "",
      category: categories[0] || "Electronics",
      stock: 25,
      unit_cost: 20.0,
      unit_price: 49.99,
      reorder_point: 20,
      target_stock: 80,
      supplier_name: "Apex Electronics Supply Co.",
      lead_time_days: 6,
      daily_demand: 6,
    });
    setIsAddModalOpen(true);
  }

  function openEditModal(prod) {
    setEditingProduct(prod);
    setFormData({
      sku: prod.sku,
      name: prod.name,
      category: prod.category,
      stock: prod.stock,
      unit_cost: prod.unit_cost,
      unit_price: prod.unit_price,
      reorder_point: prod.reorder_point,
      target_stock: prod.target_stock,
      supplier_name: prod.supplier_name || "",
      lead_time_days: prod.lead_time_days || 7,
      daily_demand: prod.daily_demand || 5,
    });
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
        showToast("success", "Product Updated", `${formData.name} was successfully modified.`);
        setEditingProduct(null);
      } else {
        await api.createProduct(formData);
        showToast("success", "Product Created", `${formData.name} added to catalog.`);
        setIsAddModalOpen(false);
      }
      onRefresh();
    } catch (err) {
      showToast("error", "Save Failed", err.message);
    }
  }

  async function handleDeleteProduct() {
    if (!deletingProduct) return;
    try {
      await api.deleteProduct(deletingProduct.id);
      showToast("success", "Product Deleted", `${deletingProduct.name} was removed.`);
      setDeletingProduct(null);
      onRefresh();
    } catch (err) {
      showToast("error", "Delete Failed", err.message);
    }
  }

  return (
    <div className="inventory-view">
      <section className="panel inventory-panel">
        <div className="panel-heading">
          <div>
            <h2>Inventory & Catalog Management</h2>
            <p>Live tracking, thresholds, pricing, and rapid stock adjustments.</p>
          </div>
          <div className="action-buttons">
            <a
              href={api.getDownloadUrl("inventory-csv")}
              className="secondary-btn export-btn"
              download
            >
              <Download size={14} />
              <span>Export CSV</span>
            </a>
            <button className="primary-btn" onClick={openAddModal}>
              <Plus size={15} />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="inventory-toolbar">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="search"
              placeholder="Search by SKU, product name, or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="All">All Categories ({products.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by stock health"
            >
              <option value="All">All Stock Health</option>
              <option value="Healthy">Healthy Only</option>
              <option value="Low Stock">Low Stock Warnings</option>
              <option value="Critical">Critical Alerts Only</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>PRODUCT NAME</th>
                <th>CATEGORY</th>
                <th>STOCK LEVEL</th>
                <th>QUICK ADJUST</th>
                <th>UNIT COST</th>
                <th>UNIT PRICE</th>
                <th>ASSET VALUE</th>
                <th>SUPPLIER / LEAD</th>
                <th>HEALTH STATUS</th>
                <th style={{ textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const assetVal = p.stock * p.unit_cost;
                return (
                  <tr key={p.id}>
                    <td><span className="sku-cell">{p.sku}</span></td>
                    <td>
                      <div className="product-cell">
                        <strong>{p.name}</strong>
                        <span className="cell-sub">{p.id}</span>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>
                      <div className="stock-level-cell">
                        <strong>{p.stock} units</strong>
                        <span className="cell-sub">Alert at {p.reorder_point}</span>
                      </div>
                    </td>
                    <td>
                      <div className="stepper-buttons">
                        <button
                          className="stepper-btn minus"
                          onClick={() => handleQuickStockAdjust(p.id, -1)}
                          disabled={p.stock <= 0}
                          title="Deduct 1 unit"
                        >
                          -1
                        </button>
                        <button
                          className="stepper-btn plus"
                          onClick={() => handleQuickStockAdjust(p.id, +5)}
                          title="Add 5 units"
                        >
                          +5
                        </button>
                      </div>
                    </td>
                    <td>${p.unit_cost.toFixed(2)}</td>
                    <td><strong>${p.unit_price.toFixed(2)}</strong></td>
                    <td>${assetVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                      <div className="supplier-cell">
                        <span>{p.supplier_name || "Primary Vendor"}</span>
                        <span className="cell-sub">{p.lead_time_days || 7}d lead time</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status ${p.status === "Critical" ? "critical" : p.status === "Low Stock" ? "low" : "healthy"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="row-actions">
                        <button
                          className="icon-action-btn"
                          onClick={() => openEditModal(p)}
                          title="Edit product"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="icon-action-btn delete"
                          onClick={() => setDeletingProduct(p)}
                          title="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="11" style={{ textAlign: "center", padding: "36px" }}>
                    <div className="empty-state">
                      <p>No products match your search or filter criteria.</p>
                      <button className="secondary-btn" onClick={() => { setSearch(""); setSelectedCategory("All"); setSelectedStatus("All"); }}>
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingProduct ? "Edit Product Details" : "Add New Catalog Product"}</h3>
              <button
                className="modal-close"
                onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Wireless Ergonomic Mouse"
                  />
                </div>

                <div className="form-group">
                  <label>SKU (Stock Keeping Unit) *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. SKU-WM-001"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Ergonomics">Ergonomics</option>
                    <option value="Audio">Audio</option>
                    <option value="Power">Power</option>
                    <option value="Computing">Computing</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Initial Stock Units *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label>Procurement Unit Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label>Selling Retail Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label>Reorder Point (Threshold) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.reorder_point}
                    onChange={(e) => setFormData({ ...formData, reorder_point: parseInt(e.target.value) || 15 })}
                  />
                </div>

                <div className="form-group">
                  <label>Target Inventory Ceiling *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.target_stock}
                    onChange={(e) => setFormData({ ...formData, target_stock: parseInt(e.target.value) || 60 })}
                  />
                </div>

                <div className="form-group">
                  <label>Supplier Name</label>
                  <input
                    type="text"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                    placeholder="e.g. Apex Electronics Supply Co."
                  />
                </div>

                <div className="form-group">
                  <label>Supplier Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lead_time_days}
                    onChange={(e) => setFormData({ ...formData, lead_time_days: parseInt(e.target.value) || 7 })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="modal-overlay">
          <div className="modal-card mini-modal">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button className="modal-close" onClick={() => setDeletingProduct(null)}>✕</button>
            </div>
            <p style={{ margin: "16px 0", fontSize: "13px", color: "#475569" }}>
              Are you sure you want to delete <strong>{deletingProduct.name}</strong> ({deletingProduct.sku})? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setDeletingProduct(null)}>
                Cancel
              </button>
              <button className="danger-btn" onClick={handleDeleteProduct}>
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
