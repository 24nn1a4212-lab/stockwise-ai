export default function CategoryBreakdownChart({ categories = [] }) {
  if (!categories || categories.length === 0) {
    return <p className="muted">No category data available.</p>;
  }

  const totalValue = categories.reduce((sum, c) => sum + (c.total_value || 0), 0);
  const totalUnits = categories.reduce((sum, c) => sum + (c.total_units || 0), 0);

  const colors = ["#7c6cf2", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

  return (
    <div className="category-breakdown-list">
      {categories.map((cat, idx) => {
        const valPct = totalValue > 0 ? ((cat.total_value / totalValue) * 100).toFixed(1) : 0;
        const color = colors[idx % colors.length];

        return (
          <div key={cat.category} className="cat-breakdown-row">
            <div className="cat-row-header">
              <div className="cat-title-group">
                <span className="cat-dot" style={{ background: color }} />
                <strong>{cat.category}</strong>
                <span className="cat-count">({cat.product_count} SKUs)</span>
              </div>
              <div className="cat-value-group">
                <span className="cat-val">${cat.total_value.toLocaleString()}</span>
                <span className="cat-pct">{valPct}%</span>
              </div>
            </div>
            <div className="cat-progress-bg">
              <div
                className="cat-progress-fill"
                style={{ width: `${valPct}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
