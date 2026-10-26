import { useState } from "react";

export default function RevenueTrendChart({ timeline = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!timeline || timeline.length === 0) {
    return (
      <div className="chart-empty-state">
        <p>No revenue transaction history available.</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...timeline.map((t) => t.revenue), 100) * 1.15;
  const width = 640;
  const height = 180;
  const padLeft = 45;
  const padRight = 15;
  const padTop = 15;
  const padBottom = 28;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const barCount = timeline.length;
  const colWidth = chartW / barCount;
  const barWidth = Math.max(4, Math.min(colWidth * 0.65, 20));

  const hoveredItem = hoveredIdx !== null ? timeline[hoveredIdx] : null;

  return (
    <div className="revenue-chart-container" style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="revenue-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="revBarHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>

        {/* Y Axis Grid lines */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = padTop + chartH * (1 - pct);
          const val = Math.round(pct * maxRevenue);
          return (
            <g key={i}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#edf2f7"
                strokeDasharray="2 2"
              />
              <text
                x={padLeft - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fill="#94a3b8"
                fontFamily="Inter, sans-serif"
              >
                ${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {timeline.map((item, idx) => {
          const barH = (item.revenue / maxRevenue) * chartH;
          const x = padLeft + idx * colWidth + (colWidth - barWidth) / 2;
          const y = padTop + chartH - barH;
          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={padLeft + idx * colWidth}
                y={padTop}
                width={colWidth}
                height={chartH}
                fill="transparent"
              />
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 3)}
                rx="3"
                ry="3"
                fill={isHovered ? "url(#revBarHover)" : "url(#revBarGrad)"}
              />
              {/* Sample X axis labels */}
              {(timeline.length <= 14 || idx % Math.ceil(timeline.length / 7) === 0) && (
                <text
                  x={x + barWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill="#64748b"
                  fontFamily="Inter, sans-serif"
                >
                  {item.date.slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {hoveredItem && (
        <div
          className="chart-tooltip mini-tooltip"
          style={{
            position: "absolute",
            top: "10px",
            right: "20px",
            pointerEvents: "none",
          }}
        >
          <div className="tooltip-title">{hoveredItem.date}</div>
          <div className="tooltip-row highlight">
            <span>Revenue:</span>
            <strong>${hoveredItem.revenue.toLocaleString()}</strong>
          </div>
          <div className="tooltip-row muted-row">
            <span>Orders / Units:</span>
            <span>
              {hoveredItem.orders} orders ({hoveredItem.units} units)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
