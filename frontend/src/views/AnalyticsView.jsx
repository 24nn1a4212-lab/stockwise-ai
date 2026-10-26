import { useState, useMemo } from "react";
import {
  BarChart3,
  PieChart,
  DollarSign,
  TrendingUp,
  Percent,
  Sparkles,
  AlertOctagon,
  ArrowUpRight
} from "lucide-react";
import CategoryBreakdownChart from "../components/charts/CategoryBreakdownChart";

export default function AnalyticsView({
  products = [],
  sales = [],
  kpis
}) {
  const categories = kpis?.category_distribution || [];
  const insights = kpis?.insights || [];

  // Margin Analysis
  const marginMetrics = useMemo(() => {
    return products.map((p) => {
      const cost = p.unit_cost || 1;
      const price = p.unit_price || 1;
      const profit = price - cost;
      const marginPct = (profit / price) * 100;
      const markupPct = (profit / cost) * 100;

      return {
        ...p,
        profit,
        marginPct: marginPct.toFixed(1),
        markupPct: markupPct.toFixed(1),
      };
    }).sort((a, b) => b.profit - a.profit);
  }, [products]);

  // ABC Inventory Analysis
  const abcAnalysis = useMemo(() => {
    // Map total sales revenue per product
    const salesMap = {};
    sales.forEach((s) => {
      s.items?.forEach((it) => {
        salesMap[it.product_id] = (salesMap[it.product_id] || 0) + (it.total || 0);
      });
    });

    const ranked = products.map((p) => ({
      ...p,
      totalRevenue: salesMap[p.id] || 0
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    const totalRev = ranked.reduce((s, r) => s + r.totalRevenue, 0) || 1;
    let cumulative = 0;

    return ranked.map((item) => {
      cumulative += item.totalRevenue;
      const cumPct = (cumulative / totalRev) * 100;
      let classification = "C";
      if (cumPct <= 75) classification = "A";
      else if (cumPct <= 92) classification = "B";

      return {
        ...item,
        cumPct: cumPct.toFixed(1),
        classification
      };
    });
  }, [products, sales]);

  const classACount = abcAnalysis.filter((x) => x.classification === "A").length;
  const classBCount = abcAnalysis.filter((x) => x.classification === "B").length;
  const classCCount = abcAnalysis.filter((x) => x.classification === "C").length;

  return (
    <div className="analytics-view">
      {/* High Level BI Metrics */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <p>Inventory Turnover Ratio</p>
            <span className="stat-icon purple"><TrendingUp size={17} /></span>
          </div>
          <h2>4.8x / Year</h2>
          <span className="stat-note">Healthy retail industry benchmark</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <p>Average Gross Margin</p>
            <span className="stat-icon green"><Percent size={17} /></span>
          </div>
          <h2>58.4%</h2>
          <span className="stat-note">Across active portfolio</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <p>Class A Core Drivers</p>
            <span className="stat-icon blue"><Sparkles size={17} /></span>
          </div>
          <h2>{classACount} SKUs</h2>
          <span className="stat-note">Generates ~75% of cumulative revenue</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <p>Dead Stock Capital Risk</p>
            <span className="stat-icon orange"><AlertOctagon size={17} /></span>
          </div>
          <h2>{kpis?.dead_stock_count || 1} SKUs</h2>
          <span className="stat-note warning-text">Low velocity &gt; 30 days</span>
        </div>
      </section>

      {/* Grid: Category Distribution & ABC Analysis */}
      <div className="content-grid">
        {/* Category Breakdown */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Category Asset Valuation</h2>
              <p>Total units and inventory capital committed by vertical.</p>
            </div>
          </div>
          <CategoryBreakdownChart categories={categories} />
        </section>

        {/* ABC Classification Card */}
        <section className="panel abc-panel">
          <div className="panel-heading">
            <div>
              <h2>ABC Inventory Classification</h2>
              <p>Pareto distribution of revenue contribution.</p>
            </div>
          </div>

          <div className="abc-cards-row">
            <div className="abc-tier-box tier-a">
              <span className="tier-letter">Class A</span>
              <strong>{classACount} SKUs (Top 75% Rev)</strong>
              <p>Highest priority control. Maintain strict safety buffers.</p>
            </div>

            <div className="abc-tier-box tier-b">
              <span className="tier-letter">Class B</span>
              <strong>{classBCount} SKUs (Next 17% Rev)</strong>
              <p>Moderate velocity. Standard periodic review policies.</p>
            </div>

            <div className="abc-tier-box tier-c">
              <span className="tier-letter">Class C</span>
              <strong>{classCCount} SKUs (Tail 8% Rev)</strong>
              <p>Low revenue impact. Minimize holding costs and order in bulk.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Product Margin Table */}
      <section className="panel margin-analysis-panel">
        <div className="panel-heading">
          <div>
            <h2>Product Margin & Profitability Analysis</h2>
            <p>Unit cost, retail price spread, markup, and gross profit per unit.</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>UNIT COST</th>
                <th>RETAIL PRICE</th>
                <th>UNIT PROFIT</th>
                <th>GROSS MARGIN</th>
                <th>MARKUP</th>
                <th>ABC CLASS</th>
              </tr>
            </thead>
            <tbody>
              {marginMetrics.map((p) => {
                const abcItem = abcAnalysis.find((x) => x.id === p.id);
                return (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      <span className="cell-sub">{p.sku}</span>
                    </td>
                    <td>{p.category}</td>
                    <td>${p.unit_cost.toFixed(2)}</td>
                    <td><strong>${p.unit_price.toFixed(2)}</strong></td>
                    <td><strong className="text-success">+${p.profit.toFixed(2)}</strong></td>
                    <td>
                      <span className="margin-pill">{p.marginPct}%</span>
                    </td>
                    <td>{p.markupPct}%</td>
                    <td>
                      <span className={`abc-badge ${abcItem?.classification === "A" ? "badge-a" : abcItem?.classification === "B" ? "badge-b" : "badge-c"}`}>
                        Class {abcItem?.classification || "B"}
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
