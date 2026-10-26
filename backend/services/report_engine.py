"""
CSV and PDF Report Generation Service for StockWise AI.
Generates structured CSV files and styled ReportLab PDF executive reports.
"""
import io
import csv
from datetime import datetime
from typing import List, Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch


class ReportEngine:
    def generate_inventory_csv(self, products: List[dict]) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Product ID", "SKU", "Product Name", "Category",
            "Current Stock", "Unit Cost ($)", "Unit Price ($)",
            "Total Asset Value ($)", "Reorder Point", "Target Stock",
            "Supplier", "Lead Time (Days)", "Status"
        ])

        for p in products:
            cost = p.get("unit_cost", 0.0)
            stock = p.get("stock", 0)
            val = round(cost * stock, 2)
            writer.writerow([
                p.get("id"),
                p.get("sku"),
                p.get("name"),
                p.get("category"),
                stock,
                f"{cost:.2f}",
                f"{p.get('unit_price', 0.0):.2f}",
                f"{val:.2f}",
                p.get("reorder_point"),
                p.get("target_stock"),
                p.get("supplier_name", "N/A"),
                p.get("lead_time_days", 7),
                p.get("status")
            ])

        return output.getvalue()

    def generate_sales_csv(self, sales: List[dict]) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Order ID", "Date", "Customer Name", "Channel",
            "Payment Method", "Items Count", "Items Breakdown",
            "Total Amount ($)", "Status"
        ])

        for s in sales:
            items = s.get("items", [])
            items_str = "; ".join([f"{it.get('product_name')} x{it.get('quantity')}" for it in items])
            writer.writerow([
                s.get("order_id", s.get("id")),
                s.get("date"),
                s.get("customer_name"),
                s.get("channel"),
                s.get("payment_method"),
                len(items),
                items_str,
                f"{s.get('total_amount', 0.0):.2f}",
                s.get("status", "Completed")
            ])

        return output.getvalue()

    def generate_executive_pdf(
        self,
        products: List[dict],
        sales: List[dict],
        recommendations: List[dict],
        kpis: dict
    ) -> bytes:
        """
        Generates a styled, multi-section Executive Intelligence PDF Report.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        # Custom Styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#17233f")
        )
        subtitle_style = ParagraphStyle(
            "DocSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#64748b")
        )
        section_style = ParagraphStyle(
            "SectionHeader",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#1e293b"),
            spaceBefore=14,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            "BodySmall",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#334155")
        )
        badge_crit = ParagraphStyle(
            "CritBadge",
            parent=body_style,
            fontName="Helvetica-Bold",
            textColor=colors.HexColor("#dc2626")
        )
        badge_low = ParagraphStyle(
            "LowBadge",
            parent=body_style,
            fontName="Helvetica-Bold",
            textColor=colors.HexColor("#d97706")
        )

        elements = []

        # Header Title
        elements.append(Paragraph("StockWise AI — Business Operations & Intelligence", title_style))
        elements.append(Spacer(1, 4))
        generated_time = datetime.now().strftime("%B %d, %Y - %I:%M %p")
        elements.append(Paragraph(f"Executive Report · Generated: {generated_time} · System: Production Ready", subtitle_style))
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#7c6cf2"), spaceAfter=14))

        # KPI Summary Table
        elements.append(Paragraph("Executive Performance Metrics", section_style))

        kpi_data = [
            [
                Paragraph("<b>Total Inventory Value</b>", body_style),
                Paragraph(f"${kpis.get('total_inventory_value', 0):,.2f}", body_style),
                Paragraph("<b>Total Units in Stock</b>", body_style),
                Paragraph(f"{kpis.get('total_units_in_stock', 0):,}", body_style),
            ],
            [
                Paragraph("<b>Historical Revenue</b>", body_style),
                Paragraph(f"${kpis.get('total_sales_revenue', 0):,.2f}", body_style),
                Paragraph("<b>Total Sales Orders</b>", body_style),
                Paragraph(f"{kpis.get('total_orders_count', 0):,}", body_style),
            ],
            [
                Paragraph("<b>Critical Stock Alerts</b>", body_style),
                Paragraph(f"<font color='#dc2626'><b>{kpis.get('critical_alerts_count', 0)} items</b></font>", body_style),
                Paragraph("<b>Low Stock Warnings</b>", body_style),
                Paragraph(f"<font color='#d97706'><b>{kpis.get('low_stock_alerts_count', 0)} items</b></font>", body_style),
            ],
            [
                Paragraph("<b>Forecast Accuracy (R²)</b>", body_style),
                Paragraph(f"{kpis.get('avg_forecast_accuracy', 0.92)*100:.1f}%", body_style),
                Paragraph("<b>Active SKUs Tracked</b>", body_style),
                Paragraph(f"{kpis.get('total_products', 0)} products", body_style),
            ]
        ]

        kpi_table = Table(kpi_data, colWidths=[130, 140, 130, 140])
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 14))

        # Critical & Low Stock Alerts Table
        elements.append(Paragraph("Stock Health & Immediate Attention Items", section_style))
        alert_rows = [
            ["SKU", "Product Name", "Category", "Stock", "Reorder Pt", "Status", "Supplier"]
        ]
        
        filtered_alerts = [p for p in products if p.get("status") in ("Critical", "Low Stock")]
        if not filtered_alerts:
            alert_rows.append(["-", "All inventory is within healthy thresholds.", "-", "-", "-", "Healthy", "-"])
        else:
            for p in filtered_alerts[:8]:
                status_p = Paragraph(f"<b>{p.get('status')}</b>", badge_crit if p.get("status") == "Critical" else badge_low)
                alert_rows.append([
                    p.get("sku", ""),
                    p.get("name", "")[:26],
                    p.get("category", ""),
                    str(p.get("stock", 0)),
                    str(p.get("reorder_point", 0)),
                    status_p,
                    p.get("supplier_name", "")[:20]
                ])

        alert_table = Table(alert_rows, colWidths=[65, 150, 75, 45, 60, 65, 80])
        alert_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#17233f")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), "Helvetica-Bold"),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ]))
        elements.append(alert_table)
        elements.append(Spacer(1, 14))

        # Top AI Reorder Recommendations
        elements.append(Paragraph("AI Reorder Recommendations (Economic Order Quantity)", section_style))
        reorder_rows = [
            ["Product Name", "Stock", "Days Left", "EOQ", "Recom. Qty", "Est. Cost", "Urgency"]
        ]

        for rec in recommendations[:7]:
            urg = rec.get("urgency", "OPTIMAL")
            urg_style = badge_crit if urg == "CRITICAL" else (badge_low if urg == "HIGH" else body_style)
            reorder_rows.append([
                rec.get("product_name", "")[:28],
                str(rec.get("current_stock", 0)),
                f"{rec.get('days_of_stock_left', 0):.1f}d",
                str(rec.get("eoq", 0)),
                str(rec.get("recommended_order_qty", 0)),
                f"${rec.get('estimated_order_cost', 0):,.2f}",
                Paragraph(f"<b>{urg}</b>", urg_style)
            ])

        reorder_table = Table(reorder_rows, colWidths=[170, 45, 55, 45, 65, 75, 85])
        reorder_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#334155")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), "Helvetica-Bold"),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ]))
        elements.append(reorder_table)
        elements.append(Spacer(1, 16))

        # Footer note
        elements.append(Paragraph(
            "Confidential · Generated by StockWise AI Intelligence Engine · Powered by Scikit-learn Machine Learning & FastAPI",
            ParagraphStyle("Footer", parent=styles["Normal"], fontName="Helvetica-Oblique", fontSize=7, textColor=colors.HexColor("#94a3b8"), alignment=1)
        ))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()


report_engine = ReportEngine()
