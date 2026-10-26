import { useState, useMemo } from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  Download,
  CreditCard,
  Building,
  User,
  Trash2,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { api } from "../api";

export default function SalesView({
  sales = [],
  products = [],
  onRefresh,
  showToast
}) {
  const [search, setSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("All");
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // New Sale Form state
  const [customerName, setCustomerName] = useState("");
  const [channel, setChannel] = useState("Online Store");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [items, setItems] = useState([
    { product_id: products[0]?.id || "", quantity: 1 }
  ]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchSearch = `${s.order_id} ${s.customer_name} ${s.payment_method}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchChannel = selectedChannel === "All" || s.channel === selectedChannel;
      return matchSearch && matchChannel;
    });
  }, [sales, search, selectedChannel]);

  const totalFilteredRevenue = filteredSales.reduce((acc, s) => acc + (s.total_amount || 0), 0);

  function addItemRow() {
    setItems([...items, { product_id: products[0]?.id || "", quantity: 1 }]);
  }

  function removeItemRow(index) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    const next = [...items];
    next[index][field] = value;
    setItems(next);
  }

  // Calculate dynamic order total
  const calculatedTotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const prod = products.find((p) => p.id === it.product_id);
      const price = prod?.unit_price || 0;
      return sum + price * (parseInt(it.quantity) || 1);
    }, 0);
  }, [items, products]);

  async function handleRecordSale(e) {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast("error", "Validation Error", "Customer name is required.");
      return;
    }

    // Format items
    const lineItems = [];
    for (const it of items) {
      const prod = products.find((p) => p.id === it.product_id);
      if (!prod) continue;
      const qty = parseInt(it.quantity) || 1;
      if (prod.stock < qty) {
        showToast(
          "error",
          "Insufficient Stock",
          `Cannot fulfill order. '${prod.name}' has only ${prod.stock} units available.`
        );
        return;
      }
      lineItems.push({
        product_id: prod.id,
        sku: prod.sku,
        product_name: prod.name,
        category: prod.category,
        quantity: qty,
        unit_price: prod.unit_price,
        unit_cost: prod.unit_cost,
        total: roundToTwo(qty * prod.unit_price)
      });
    }

    if (lineItems.length === 0) {
      showToast("error", "Error", "Order must contain valid items.");
      return;
    }

    try {
      const payload = {
        customer_name: customerName,
        channel,
        payment_method: paymentMethod,
        items: lineItems
      };
      const created = await api.recordSale(payload);
      showToast(
        "success",
        "Order Processed",
        `Order ${created.order_id} recorded for $${created.total_amount.toFixed(2)}. Inventory automatically decremented!`
      );
      setIsRecordModalOpen(false);
      setCustomerName("");
      setItems([{ product_id: products[0]?.id || "", quantity: 1 }]);
      onRefresh();
    } catch (err) {
      showToast("error", "Failed to Process Sale", err.message);
    }
  }

  function roundToTwo(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  return (
    <div className="sales-view">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Sales & Order Fulfillment Hub</h2>
            <p>Real-time customer transactions with automated inventory deduction.</p>
          </div>
          <div className="action-buttons">
            <a
              href={api.getDownloadUrl("sales-csv")}
              className="secondary-btn export-btn"
              download
            >
              <Download size={14} />
              <span>Export Sales CSV</span>
            </a>
            <button className="primary-btn" onClick={() => setIsRecordModalOpen(true)}>
              <Plus size={15} />
              <span>Record New Sale</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="inventory-toolbar">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="search"
              placeholder="Search by Order ID, customer name, payment method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              aria-label="Filter by sales channel"
            >
              <option value="All">All Channels</option>
              <option value="Online Store">Online Store</option>
              <option value="B2B Direct">B2B Direct</option>
              <option value="Enterprise Wholesale">Enterprise Wholesale</option>
              <option value="Retail Outlet">Retail Outlet</option>
            </select>
          </div>

          <div className="sales-summary-pill">
            <span>Filtered Revenue:</span>
            <strong>${totalFilteredRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            <span className="muted">({filteredSales.length} orders)</span>
          </div>
        </div>

        {/* Orders Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>DATE & TIME</th>
                <th>CUSTOMER</th>
                <th>CHANNEL</th>
                <th>PAYMENT</th>
                <th>ITEMS ORDERED</th>
                <th>TOTAL AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s) => {
                const itemsCount = s.items?.reduce((tot, it) => tot + it.quantity, 0) || 0;
                const formattedDate = s.date ? new Date(s.date).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "Recent";

                return (
                  <tr key={s.id || s.order_id}>
                    <td><strong className="order-id-badge">{s.order_id}</strong></td>
                    <td>{formattedDate}</td>
                    <td>
                      <div className="customer-cell">
                        <strong>{s.customer_name}</strong>
                      </div>
                    </td>
                    <td><span className="channel-pill">{s.channel}</span></td>
                    <td>{s.payment_method}</td>
                    <td>
                      <div className="items-summary-cell" title={s.items?.map(i => `${i.product_name} (${i.quantity})`).join(", ")}>
                        <strong>{itemsCount} units</strong>
                        <span className="cell-sub">
                          {s.items?.[0]?.product_name}
                          {s.items?.length > 1 ? ` +${s.items.length - 1} more` : ""}
                        </span>
                      </div>
                    </td>
                    <td><strong>${(s.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                    <td>
                      <span className="status healthy">
                        {s.status || "Completed"}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "36px" }}>
                    <p className="muted">No sales orders found matching your search filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Record New Sale Modal */}
      {isRecordModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Record New Customer Order</h3>
              <button className="modal-close" onClick={() => setIsRecordModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleRecordSale} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Customer Name / Account *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Horizon Media Works"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Sales Channel *</label>
                  <select value={channel} onChange={(e) => setChannel(e.target.value)}>
                    <option value="Online Store">Online Store</option>
                    <option value="B2B Direct">B2B Direct</option>
                    <option value="Enterprise Wholesale">Enterprise Wholesale</option>
                    <option value="Retail Outlet">Retail Outlet</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Method *</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Corporate Invoice">Corporate Invoice (Net 30)</option>
                    <option value="ACH Transfer">ACH Wire Transfer</option>
                    <option value="PayPal">PayPal Business</option>
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div className="line-items-section">
                <div className="line-items-header">
                  <h4>Order Line Items</h4>
                  <button type="button" className="text-button" onClick={addItemRow}>
                    + Add Another Item
                  </button>
                </div>

                {items.map((item, idx) => {
                  const selectedProd = products.find((p) => p.id === item.product_id);
                  const price = selectedProd?.unit_price || 0;
                  const available = selectedProd?.stock || 0;
                  const lineTotal = price * (parseInt(item.quantity) || 1);

                  return (
                    <div key={idx} className="line-item-row">
                      <div className="form-group flex-2">
                        <label>Product</label>
                        <select
                          value={item.product_id}
                          onChange={(e) => updateItem(idx, "product_id", e.target.value)}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku}) — ${p.unit_price} (Stock: {p.stock})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group flex-1">
                        <label>Quantity (Max: {available})</label>
                        <input
                          type="number"
                          min="1"
                          max={available}
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div className="line-item-total">
                        <label>Line Total</label>
                        <strong>${lineTotal.toFixed(2)}</strong>
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          className="item-delete-btn"
                          onClick={() => removeItemRow(idx)}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="order-total-callout">
                <span>Calculated Order Total:</span>
                <strong>${calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setIsRecordModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Confirm & Deduct Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
