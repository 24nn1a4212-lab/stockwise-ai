import { useState } from "react";

export default function InteractiveForecastChart({ forecastData, period }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!forecastData || !forecastData.forecast_points || forecastData.forecast_points.length === 0) {
    return (
      <div className="chart-empty-state">
        <p>No forecast data available for selected horizon.</p>
      </div>
    );
  }

  const points = forecastData.forecast_points;
  const maxVal = Math.max(...points.map((p) => p.upper_bound || p.predicted_demand), 15) * 1.15;
  const minVal = 0;

  const width = 760;
  const height = 220;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (idx) => padLeft + (idx / (points.length - 1 || 1)) * chartW;
  const getY = (val) => padTop + chartH - ((val - minVal) / (maxVal - minVal || 1)) * chartH;

  // Upper/lower confidence area path
  let areaPath = `M ${getX(0)} ${getY(points[0].upper_bound || points[0].predicted_demand)}`;
  points.forEach((p, i) => {
    areaPath += ` L ${getX(i)} ${getY(p.upper_bound || p.predicted_demand)}`;
  });
  for (let i = points.length - 1; i >= 0; i--) {
    areaPath += ` L ${getX(i)} ${getY(points[i].lower_bound || 0)}`;
  }
  areaPath += " Z";

  // Center prediction line
  const linePoints = points.map((p, i) => `${getX(i)},${getY(p.predicted_demand)}`).join(" L ");
  const linePath = `M ${linePoints}`;

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="interactive-forecast-container">
      <div className="forecast-meta-bar">
        <div className="model-chip">
          <span className="dot pulse" />
          <span>{forecastData.model_name || "Machine Learning Engine"}</span>
        </div>
        <div className="metrics-group">
          <span className="metric-badge">
            R² Score: <strong>{(forecastData.r2_score * 100).toFixed(1)}%</strong>
          </span>
          <span className="metric-badge">
            MAE: <strong>{forecastData.mae || 1.8} units</strong>
          </span>
          <span className="metric-badge">
            Conf: <strong>95%</strong>
          </span>
        </div>
      </div>

      <div className="svg-wrapper" style={{ position: "relative" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="forecast-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c6cf2" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#7c6cf2" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padTop + chartH * (1 - pct);
            const val = Math.round(minVal + pct * (maxVal - minVal));
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#94a3b8"
                  fontFamily="Inter, sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Confidence interval area */}
          <path d={areaPath} fill="url(#confidenceGrad)" />

          {/* Forecast predicted line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive point markers */}
          {points.map((p, i) => {
            const cx = getX(i);
            const cy = getY(p.predicted_demand);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Invisible hover target */}
                <rect
                  x={cx - (chartW / points.length) / 2}
                  y={padTop}
                  width={chartW / points.length}
                  height={chartH}
                  fill="transparent"
                />
                {isHovered && (
                  <line
                    x1={cx}
                    y1={padTop}
                    x2={cx}
                    y2={padTop + chartH}
                    stroke="#7c6cf2"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 3.5}
                  fill={isHovered ? "#6366f1" : "#ffffff"}
                  stroke="#6366f1"
                  strokeWidth={isHovered ? 2.5 : 2}
                />
                {/* X-axis date label (sample evenly) */}
                {(points.length <= 14 || i % Math.ceil(points.length / 8) === 0) && (
                  <text
                    x={cx}
                    y={height - 12}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#64748b"
                    fontFamily="Inter, sans-serif"
                  >
                    {p.day_name} {p.date.slice(5)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="chart-tooltip"
            style={{
              position: "absolute",
              top: `${getY(hoveredPoint.predicted_demand) - 10}px`,
              left: `${Math.min(width - 150, Math.max(20, getX(hoveredIndex) - 60))}px`,
              pointerEvents: "none",
            }}
          >
            <div className="tooltip-title">
              {hoveredPoint.day_name}, {hoveredPoint.date}
            </div>
            <div className="tooltip-row highlight">
              <span>Predicted Demand:</span>
              <strong>{hoveredPoint.predicted_demand} units</strong>
            </div>
            <div className="tooltip-row muted-row">
              <span>95% CI Range:</span>
              <span>
                {hoveredPoint.lower_bound} - {hoveredPoint.upper_bound} units
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="forecast-legend">
        <div className="legend-item">
          <span className="legend-line" />
          <span>ML Predicted Daily Demand</span>
        </div>
        <div className="legend-item">
          <span className="legend-box" />
          <span>95% Statistical Confidence Band</span>
        </div>
        {forecastData.stockout_projection_day && (
          <div className="stockout-warning-badge">
            ⚠ Projected Stock Depletion: Day {forecastData.stockout_projection_day}
          </div>
        )}
      </div>
    </div>
  );
}
