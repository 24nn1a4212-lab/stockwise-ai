import { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Sparkles,
  Printer,
  ShieldCheck
} from "lucide-react";
import { api } from "../api";

export default function ReportsView({ showToast }) {
  const [downloading, setDownloading] = useState("");

  const reports = [
    {
      id: "inventory-csv",
      title: "Inventory Master Status & Asset Valuation",
      format: "CSV Spreadsheet",
      type: "inventory-csv",
      icon: FileSpreadsheet,
      color: "purple",
      desc: "Complete itemized inventory list including SKUs, on-hand units, procurement costs, retail prices, total asset value, reorder thresholds, and active supplier lead times.",
      fields: ["Product ID", "SKU", "Name", "Category", "Stock", "Unit Cost", "Unit Price", "Total Valuation", "Status", "Supplier"]
    },
    {
      id: "sales-csv",
      title: "Sales Orders & Fulfillment Transaction Log",
      format: "CSV Spreadsheet",
      type: "sales-csv",
      icon: FileSpreadsheet,
      color: "blue",
      desc: "Full customer transaction journal over the trailing 90 days. Includes order IDs, timestamps, customer accounts, channel breakdown, payment methods, line items, and gross amounts.",
      fields: ["Order ID", "Date", "Customer Name", "Channel", "Payment Method", "Items Count", "Items Breakdown", "Total Amount", "Status"]
    },
    {
      id: "executive-pdf",
      title: "Executive Operations Intelligence Briefing",
      format: "ReportLab Styled PDF",
      type: "executive-pdf",
      icon: FileText,
      color: "green",
      desc: "Official corporate briefing document generated directly by the backend ReportLab engine. Features executive KPI summary cards, stock health alerts table, AI Reorder matrix with EOQ, and forecast notes.",
      fields: ["Executive KPI Cards", "Critical Stock Alerts", "Top Revenue Drivers", "AI Reorder Matrix", "Model Accuracy Sign-off"]
    }
  ];

  function handleDownload(rep) {
    setDownloading(rep.id);
    const url = api.getDownloadUrl(rep.type);
    
    // Create hidden anchor
    const a = document.createElement("a");
    a.href = url;
    a.download = `stockwise_${rep.id}.${rep.format.toLowerCase().includes("pdf") ? "pdf" : "csv"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setDownloading("");
      showToast("success", "Download Started", `${rep.title} is downloading.`);
    }, 800);
  }

  return (
    <div className="reports-view">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Data Reports & Document Export Center</h2>
            <p>Export live inventory ledgers, transaction records, and formatted PDF executive summaries.</p>
          </div>
          <span className="ai-badge"><ShieldCheck size={12} /> Compliance Ready</span>
        </div>

        <div className="reports-grid">
          {reports.map((rep) => {
            const Icon = rep.icon;
            const isWorking = downloading === rep.id;

            return (
              <div key={rep.id} className="report-card">
                <div className="report-card-top">
                  <div className={`report-icon-box ${rep.color}`}>
                    <Icon size={22} />
                  </div>
                  <span className="format-tag">{rep.format}</span>
                </div>

                <h3>{rep.title}</h3>
                <p className="report-desc">{rep.desc}</p>

                <div className="schema-chips">
                  <strong>Included Columns:</strong>
                  <div className="chips-wrapper">
                    {rep.fields.map((f, i) => (
                      <span key={i} className="field-chip">{f}</span>
                    ))}
                  </div>
                </div>

                <button
                  className="download-report-btn"
                  onClick={() => handleDownload(rep)}
                  disabled={isWorking}
                >
                  <Download size={15} />
                  <span>{isWorking ? "Generating..." : `Download ${rep.format.split(" ")[0]}`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* PDF Generation Diagnostics */}
      <section className="panel pdf-engine-panel">
        <div className="panel-heading">
          <div>
            <h3>Enterprise Document Engine Architecture</h3>
            <p>How StockWise AI generates presentation-ready executive documents.</p>
          </div>
          <Printer size={18} className="text-purple" />
        </div>

        <div className="diagnostics-list">
          <div className="diag-item">
            <div className="diag-label">
              <strong>PDF Rendering Engine</strong>
              <span>Python ReportLab Flowable Engine with corporate layout styles</span>
            </div>
            <span className="status healthy">Production Active</span>
          </div>
          <div className="diag-item">
            <div className="diag-label">
              <strong>Data Freshness</strong>
              <span>Dynamically compiles real-time state from database or demo store</span>
            </div>
            <span className="diag-val">100% Real-time</span>
          </div>
          <div className="diag-item">
            <div className="diag-label">
              <strong>CSV Streaming Protocol</strong>
              <span>RFC 4180 compliant streamed output with custom attachment headers</span>
            </div>
            <span className="diag-val">Streaming</span>
          </div>
        </div>
      </section>
    </div>
  );
}
