// High-fidelity fallback dataset for StockWise AI
// Ensures 100% realistic experience even on cold-start or static preview deployments.

export const MOCK_CATEGORIES = ["Electronics", "Accessories", "Ergonomics", "Audio", "Power"];

export const MOCK_SUPPLIERS = [
  {
    id: "SUP-101",
    name: "Apex Electronics Supply Co.",
    contact_email: "orders@apexelectronics.com",
    phone: "+1 (555) 234-5678",
    lead_time_days: 5,
    rating: 4.8,
    categories_supplied: ["Electronics", "Computing", "Peripherals"],
    status: "Active"
  },
  {
    id: "SUP-102",
    name: "Nova Peripheral Labs",
    contact_email: "procurement@novaperipherals.io",
    phone: "+1 (555) 876-5432",
    lead_time_days: 7,
    rating: 4.6,
    categories_supplied: ["Accessories", "Ergonomics"],
    status: "Active"
  },
  {
    id: "SUP-103",
    name: "Quantum Audio & Video Tech",
    contact_email: "sales@quantumaudio.com",
    phone: "+1 (555) 345-6789",
    lead_time_days: 10,
    rating: 4.9,
    categories_supplied: ["Audio", "Electronics"],
    status: "Active"
  },
  {
    id: "SUP-104",
    name: "ErgoWork Dynamic Logistics",
    contact_email: "b2b@ergowork.com",
    phone: "+1 (555) 456-7890",
    lead_time_days: 8,
    rating: 4.4,
    categories_supplied: ["Ergonomics", "Accessories"],
    status: "Active"
  },
  {
    id: "SUP-105",
    name: "Vanguard Cable & Power Systems",
    contact_email: "support@vanguardcable.com",
    phone: "+1 (555) 567-8901",
    lead_time_days: 4,
    rating: 4.7,
    categories_supplied: ["Accessories", "Power"],
    status: "Active"
  }
];

export const MOCK_PRODUCTS = [
  {
    id: "P001",
    sku: "SKU-WM-001",
    name: "Wireless Ergonomic Mouse",
    category: "Electronics",
    description: "Ergonomic 2.4GHz + Bluetooth rechargeable vertical mouse with precision optical sensor.",
    stock: 14,
    unit_cost: 24.50,
    unit_price: 59.99,
    reorder_point: 25,
    target_stock: 80,
    supplier_id: "SUP-101",
    supplier_name: "Apex Electronics Supply Co.",
    lead_time_days: 5,
    daily_demand: 12,
    status: "Critical"
  },
  {
    id: "P002",
    sku: "SKU-MK-002",
    name: "Mechanical RGB Gaming Keyboard",
    category: "Electronics",
    description: "Tactile brown switch mechanical keyboard with per-key RGB backlighting and aircraft aluminum frame.",
    stock: 28,
    unit_cost: 55.00,
    unit_price: 129.99,
    reorder_point: 30,
    target_stock: 90,
    supplier_id: "SUP-101",
    supplier_name: "Apex Electronics Supply Co.",
    lead_time_days: 6,
    daily_demand: 8,
    status: "Low Stock"
  },
  {
    id: "P003",
    sku: "SKU-HUB-003",
    name: "10-in-1 USB-C Pro Docking Hub",
    category: "Accessories",
    description: "Dual 4K HDMI, 100W Power Delivery, Gigabit Ethernet, SD card reader, and 3x USB 3.2 ports.",
    stock: 72,
    unit_cost: 38.00,
    unit_price: 89.99,
    reorder_point: 20,
    target_stock: 75,
    supplier_id: "SUP-102",
    supplier_name: "Nova Peripheral Labs",
    lead_time_days: 7,
    daily_demand: 9,
    status: "Healthy"
  },
  {
    id: "P004",
    sku: "SKU-LS-004",
    name: "Aluminum Folding Laptop Stand",
    category: "Ergonomics",
    description: "Aerospace-grade aluminum folding riser with silicone padding and 6-level height adjustment.",
    stock: 9,
    unit_cost: 16.00,
    unit_price: 44.99,
    reorder_point: 25,
    target_stock: 70,
    supplier_id: "SUP-104",
    supplier_name: "ErgoWork Dynamic Logistics",
    lead_time_days: 8,
    daily_demand: 11,
    status: "Critical"
  },
  {
    id: "P005",
    sku: "SKU-HP-005",
    name: "Active Noise Cancelling Headphones",
    category: "Audio",
    description: "Wireless over-ear headphones with hybrid ANC, 40hr battery life, and Hi-Res LDAC support.",
    stock: 46,
    unit_cost: 85.00,
    unit_price: 199.99,
    reorder_point: 20,
    target_stock: 60,
    supplier_id: "SUP-103",
    supplier_name: "Quantum Audio & Video Tech",
    lead_time_days: 10,
    daily_demand: 6,
    status: "Healthy"
  },
  {
    id: "P006",
    sku: "SKU-WC-006",
    name: "4K Ultra-HD Conference Webcam",
    category: "Electronics",
    description: "Sony Starvis CMOS sensor webcam with dual stereo noise-reducing microphones and HDR autofocus.",
    stock: 22,
    unit_cost: 62.00,
    unit_price: 139.99,
    reorder_point: 25,
    target_stock: 65,
    supplier_id: "SUP-103",
    supplier_name: "Quantum Audio & Video Tech",
    lead_time_days: 10,
    daily_demand: 7,
    status: "Low Stock"
  },
  {
    id: "P007",
    sku: "SKU-TB-007",
    name: "Thunderbolt 4 High-Speed Cable (2m)",
    category: "Accessories",
    description: "Intel certified 40Gbps data transfer, 100W PD fast charging, 8K display support braided cable.",
    stock: 110,
    unit_cost: 11.50,
    unit_price: 32.99,
    reorder_point: 35,
    target_stock: 120,
    supplier_id: "SUP-105",
    supplier_name: "Vanguard Cable & Power Systems",
    lead_time_days: 4,
    daily_demand: 14,
    status: "Healthy"
  },
  {
    id: "P008",
    sku: "SKU-DP-008",
    name: "Dual-Sided Eco-Leather Desk Pad",
    category: "Accessories",
    description: "90x45cm waterproof and scratch-resistant desk blotter protector with non-slip suede base.",
    stock: 58,
    unit_cost: 9.20,
    unit_price: 26.99,
    reorder_point: 20,
    target_stock: 80,
    supplier_id: "SUP-102",
    supplier_name: "Nova Peripheral Labs",
    lead_time_days: 7,
    daily_demand: 8,
    status: "Healthy"
  },
  {
    id: "P009",
    sku: "SKU-MC-009",
    name: "Pro Ergonomic Lumbar Mesh Chair",
    category: "Ergonomics",
    description: "Dynamic self-adjusting lumbar support chair with 4D armrests, breathable Korean mesh, and tilt lock.",
    stock: 5,
    unit_cost: 175.00,
    unit_price: 389.99,
    reorder_point: 12,
    target_stock: 35,
    supplier_id: "SUP-104",
    supplier_name: "ErgoWork Dynamic Logistics",
    lead_time_days: 8,
    daily_demand: 3,
    status: "Critical"
  },
  {
    id: "P010",
    sku: "SKU-QC-010",
    name: "3-in-1 Magnetic Fast Wireless Charger",
    category: "Power",
    description: "15W MagSafe compatible folding charging station for phone, smartwatch, and wireless earbuds.",
    stock: 65,
    unit_cost: 21.00,
    unit_price: 49.99,
    reorder_point: 25,
    target_stock: 85,
    supplier_id: "SUP-105",
    supplier_name: "Vanguard Cable & Power Systems",
    lead_time_days: 4,
    daily_demand: 10,
    status: "Healthy"
  },
  {
    id: "P011",
    sku: "SKU-MS-011",
    name: "Heavy-Duty Gas Spring Monitor Arm",
    category: "Ergonomics",
    description: "Counterbalance single monitor mount holding up to 34-inch screens with integrated cable management.",
    stock: 19,
    unit_cost: 31.00,
    unit_price: 79.99,
    reorder_point: 20,
    target_stock: 50,
    supplier_id: "SUP-104",
    supplier_name: "ErgoWork Dynamic Logistics",
    lead_time_days: 8,
    daily_demand: 5,
    status: "Low Stock"
  },
  {
    id: "P012",
    sku: "SKU-PL-012",
    name: "Smart RGB Desk Ambient Light Bar",
    category: "Electronics",
    description: "Monitor-mounted anti-glare screenbar with ambient backlighting, wireless rotary dial, and auto-dimming.",
    stock: 42,
    unit_cost: 29.00,
    unit_price: 69.99,
    reorder_point: 18,
    target_stock: 55,
    supplier_id: "SUP-101",
    supplier_name: "Apex Electronics Supply Co.",
    lead_time_days: 5,
    daily_demand: 7,
    status: "Healthy"
  }
];

export const MOCK_SALES = [
  {
    id: "ORD-9421",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    customer_name: "Nexus Global Corp",
    channel: "B2B Direct",
    items: [{ product_id: "P001", sku: "SKU-WM-001", name: "Wireless Ergonomic Mouse", quantity: 6, unit_price: 59.99, subtotal: 359.94 }],
    total_amount: 359.94,
    items_count: 6,
    fulfillment_status: "Completed"
  },
  {
    id: "ORD-9420",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    customer_name: "TechNova Solutions",
    channel: "Enterprise Wholesale",
    items: [
      { product_id: "P003", sku: "SKU-HUB-003", name: "10-in-1 USB-C Pro Docking Hub", quantity: 8, unit_price: 89.99, subtotal: 719.92 },
      { product_id: "P007", sku: "SKU-TB-007", name: "Thunderbolt 4 High-Speed Cable (2m)", quantity: 12, unit_price: 32.99, subtotal: 395.88 }
    ],
    total_amount: 1115.80,
    items_count: 20,
    fulfillment_status: "Completed"
  },
  {
    id: "ORD-9419",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    customer_name: "Sophia Chen",
    channel: "Online Store",
    items: [{ product_id: "P005", sku: "SKU-HP-005", name: "Active Noise Cancelling Headphones", quantity: 1, unit_price: 199.99, subtotal: 199.99 }],
    total_amount: 199.99,
    items_count: 1,
    fulfillment_status: "Completed"
  },
  {
    id: "ORD-9418",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    customer_name: "Vanguard Design Studio",
    channel: "B2B Direct",
    items: [
      { product_id: "P009", sku: "SKU-MC-009", name: "Pro Ergonomic Lumbar Mesh Chair", quantity: 2, unit_price: 389.99, subtotal: 779.98 },
      { product_id: "P004", sku: "SKU-LS-004", name: "Aluminum Folding Laptop Stand", quantity: 4, unit_price: 44.99, subtotal: 179.96 }
    ],
    total_amount: 959.94,
    items_count: 6,
    fulfillment_status: "Completed"
  },
  {
    id: "ORD-9417",
    timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
    customer_name: "Marcus Vance",
    channel: "Retail Outlet",
    items: [{ product_id: "P002", sku: "SKU-MK-002", name: "Mechanical RGB Gaming Keyboard", quantity: 1, unit_price: 129.99, subtotal: 129.99 }],
    total_amount: 129.99,
    items_count: 1,
    fulfillment_status: "Completed"
  }
];

export function getMockKPIs(products = MOCK_PRODUCTS) {
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValue = products.reduce((acc, p) => acc + (p.stock || 0) * (p.unit_cost || 0), 0);
  const critical = products.filter((p) => p.status === "Critical").length;
  const low = products.filter((p) => p.status === "Low Stock").length;

  return {
    total_products: products.length,
    total_stock_units: totalStock,
    total_inventory_valuation: totalValue,
    critical_stock_count: critical,
    low_stock_count: low,
    healthy_stock_count: products.length - critical - low,
    avg_forecast_accuracy: 0.942,
    total_revenue_30d: 48620.50,
    total_sales_count: 87
  };
}

export function getMockForecast(days = 14) {
  const data = [];
  const today = new Date();
  let baseDemand = 78;

  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const factor = isWeekend ? 0.75 : 1.15;
    const noise = Math.sin(i / 2) * 8;
    const predicted = Math.round((baseDemand + noise) * factor);
    const lower = Math.max(10, Math.round(predicted * 0.88));
    const upper = Math.round(predicted * 1.12);

    data.push({
      date: d.toISOString().split("T")[0],
      day_name: d.toLocaleDateString("en-US", { weekday: "short" }),
      predicted_demand: predicted,
      lower_confidence: lower,
      upper_confidence: upper,
      rolling_avg: Math.round(predicted * 0.96)
    });
  }

  const total = data.reduce((acc, item) => acc + item.predicted_demand, 0);

  return {
    forecast_horizon_days: days,
    total_projected_demand: total,
    avg_daily_demand: Math.round(total / days),
    model_name: "Scikit-Learn Random Forest Regressor",
    r2_score: 0.942,
    timeline: data
  };
}

export function getMockRevenueTrends(days = 14) {
  const timeline = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const day = d.getDay();
    const isWeekend = day === 0 || day === 6;
    const base = isWeekend ? 1400 : 3200;
    const variance = (Math.sin(i) * 600) + 200;
    timeline.push({
      date: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: Math.round(base + variance),
      orders: isWeekend ? 4 : 9
    });
  }
  return { timeline, total_revenue: timeline.reduce((acc, t) => acc + t.revenue, 0) };
}

export function getMockRecommendations(products = MOCK_PRODUCTS) {
  return products
    .filter((p) => p.stock <= p.reorder_point)
    .map((p) => {
      const annualDemand = (p.daily_demand || 10) * 365;
      const orderCost = 50;
      const holdingCost = Math.max(1, p.unit_cost * 0.2);
      const eoq = Math.round(Math.sqrt((2 * annualDemand * orderCost) / holdingCost));
      const daysUntilStockout = Math.max(1, Math.round(p.stock / (p.daily_demand || 1)));

      return {
        product_id: p.id,
        sku: p.sku,
        product_name: p.name,
        category: p.category,
        current_stock: p.stock,
        reorder_point: p.reorder_point,
        status: p.status,
        recommended_order_quantity: eoq,
        days_until_stockout: daysUntilStockout,
        urgency: p.status === "Critical" ? "Urgent" : "Medium",
        stockout_risk_score: p.status === "Critical" ? 95 : 68,
        supplier_id: p.supplier_id,
        supplier_name: p.supplier_name,
        estimated_cost: eoq * p.unit_cost
      };
    });
}
