"""
Rich sample enterprise data for StockWise AI.
Used for initial seeding in MongoDB Atlas or instant fallback in Demo Mode.
"""
from datetime import datetime, timedelta
import random

SAMPLE_SUPPLIERS = [
    {
        "id": "SUP-101",
        "name": "Apex Electronics Supply Co.",
        "contact_email": "orders@apexelectronics.com",
        "phone": "+1 (555) 234-5678",
        "lead_time_days": 5,
        "rating": 4.8,
        "categories_supplied": ["Electronics", "Computing", "Peripherals"],
        "status": "Active"
    },
    {
        "id": "SUP-102",
        "name": "Nova Peripheral Labs",
        "contact_email": "procurement@novaperipherals.io",
        "phone": "+1 (555) 876-5432",
        "lead_time_days": 7,
        "rating": 4.6,
        "categories_supplied": ["Accessories", "Ergonomics"],
        "status": "Active"
    },
    {
        "id": "SUP-103",
        "name": "Quantum Audio & Video Tech",
        "contact_email": "sales@quantumaudio.com",
        "phone": "+1 (555) 345-6789",
        "lead_time_days": 10,
        "rating": 4.9,
        "categories_supplied": ["Audio", "Electronics"],
        "status": "Active"
    },
    {
        "id": "SUP-104",
        "name": "ErgoWork Dynamic Logistics",
        "contact_email": "b2b@ergowork.com",
        "phone": "+1 (555) 456-7890",
        "lead_time_days": 8,
        "rating": 4.4,
        "categories_supplied": ["Ergonomics", "Accessories"],
        "status": "Active"
    },
    {
        "id": "SUP-105",
        "name": "Vanguard Cable & Power Systems",
        "contact_email": "support@vanguardcable.com",
        "phone": "+1 (555) 567-8901",
        "lead_time_days": 4,
        "rating": 4.7,
        "categories_supplied": ["Accessories", "Power"],
        "status": "Active"
    }
]

SAMPLE_PRODUCTS = [
    {
        "id": "P001",
        "sku": "SKU-WM-001",
        "name": "Wireless Ergonomic Mouse",
        "category": "Electronics",
        "description": "Ergonomic 2.4GHz + Bluetooth rechargeable vertical mouse with precision optical sensor.",
        "stock": 14,
        "unit_cost": 24.50,
        "unit_price": 59.99,
        "reorder_point": 25,
        "target_stock": 80,
        "supplier_id": "SUP-101",
        "supplier_name": "Apex Electronics Supply Co.",
        "lead_time_days": 5,
        "daily_demand": 12,
        "status": "Critical",
        "created_at": (datetime.now() - timedelta(days=120)).isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "P002",
        "sku": "SKU-MK-002",
        "name": "Mechanical RGB Gaming Keyboard",
        "category": "Electronics",
        "description": "Tactile brown switch mechanical keyboard with per-key RGB backlighting and aircraft aluminum frame.",
        "stock": 28,
        "unit_cost": 55.00,
        "unit_price": 129.99,
        "reorder_point": 30,
        "target_stock": 90,
        "supplier_id": "SUP-101",
        "supplier_name": "Apex Electronics Supply Co.",
        "lead_time_days": 6,
        "daily_demand": 8,
        "status": "Low Stock",
        "created_at": (datetime.now() - timedelta(days=115)).isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "P003",
        "sku": "SKU-HUB-003",
        "name": "10-in-1 USB-C Pro Docking Hub",
        "category": "Accessories",
        "description": "Dual 4K HDMI, 100W Power Delivery, Gigabit Ethernet, SD card reader, and 3x USB 3.2 ports.",
        "stock": 72,
        "unit_cost": 38.00,
        "unit_price": 89.99,
        "reorder_point": 20,
        "target_stock": 75,
        "supplier_id": "SUP-102",
        "supplier_name": "Nova Peripheral Labs",
        "lead_time_days": 7,
        "daily_demand": 9,
        "status": "Healthy",
        "created_at": (datetime.now() - timedelta(days=110)).isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "P004",
        "sku": "SKU-LS-004",
        "name": "Aluminum Folding Laptop Stand",
        "category": "Ergonomics",
        "description": "Aerospace-grade aluminum folding riser with silicone padding and 6-level height adjustment.",
        "stock": 9,
        "unit_cost": 16.00,
        "unit_price": 44.99,
        "reorder_point": 25,
        "target_stock": 70,
        "supplier_id": "SUP-104",
        "supplier_name": "ErgoWork Dynamic Logistics",
        "lead_time_days": 8,
        "daily_demand": 11,
        "status": "Critical",
        "created_at": (datetime.now() - timedelta(days=105)).isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "P005",
        "sku": "SKU-HP-005",
        "name": "Active Noise Cancelling Headphones",
        "category": "Audio",
        "description": "Wireless over-ear headphones with hybrid ANC, 40hr battery life, and Hi-Res LDAC support.",
        "stock": 46,
        "unit_cost": 85.00,
        "unit_price": 199.99,
        "reorder_point": 20,
        "target_stock": 60,
        "supplier_id": "SUP-103",
        "supplier_name": "Quantum Audio & Video Tech",
        "lead_time_days": 10,
        "daily_demand": 6,
        "status": "Healthy",
        "created_at": (datetime.now() - timedelta(days=100)).isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "P006",
        "sku": "SKU-WC-006",
        "name": "4K Ultra-HD Conference Webcam",
        "category": "Electronics",
        "description": "Sony Starvis CMOS sensor webcam with dual stereo noise-reducing microphones and HDR autofocus.",
        "stock": 22,
        "unit_cost": 62.00,
        "unit_price": 139.99,
        "reorder_point": 25,
        "target_stock": 65,
        "supplier_id": "SUP-103",
        "supplier_name": "Quantum Audio & Video Tech",
        "lead_time_days": 10,
        "daily_demand": 7,
        "status": "Low Stock",
        "created_at": (datetime.now() - timedelta(days=95)).isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "P007",
        "sku": "SKU-TB-007",
        "name": "Thunderbolt 4 High-Speed Cable (2m)",
        "category": "Accessories",
        "description": "Intel certified 40Gbps data transfer, 100W PD fast charging, 8K display support braided cable.",
        "stock": 110,
        "unit_cost": 11.50,
        "unit_price": 32.99,
        "reorder_point": 35,
        "target_stock": 120,
        "supplier_id": "SUP-105",
        "supplier_name": "Vanguard Cable & Power Systems",
        "lead_time_days": 4,
        "daily_demand": 14,
        "status": "Healthy",
        "created_at": (datetime.now() - timedelta(days=90)).isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "P008",
        "sku": "SKU-DP-008",
        "name": "Dual-Sided Eco-Leather Desk Pad",
        "category": "Accessories",
        "description": "90x45cm waterproof and scratch-resistant desk blotter protector with non-slip suede base.",
        "stock": 58,
        "unit_cost": 9.20,
        "unit_price": 26.99,
        "reorder_point": 20,
        "target_stock": 80,
        "supplier_id": "SUP-102",
        "supplier_name": "Nova Peripheral Labs",
        "lead_time_days": 7,
        "daily_demand": 8,
        "status": "Healthy",
        "created_at": (datetime.now() - timedelta(days=85)).isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "P009",
        "sku": "SKU-MC-009",
        "name": "Pro Ergonomic Lumbar Mesh Chair",
        "category": "Ergonomics",
        "description": "Dynamic self-adjusting lumbar support chair with 4D armrests, breathable Korean mesh, and tilt lock.",
        "stock": 5,
        "unit_cost": 175.00,
        "unit_price": 389.99,
        "reorder_point": 12,
        "target_stock": 35,
        "supplier_id": "SUP-104",
        "supplier_name": "ErgoWork Dynamic Logistics",
        "lead_time_days": 8,
        "daily_demand": 3,
        "status": "Critical",
        "created_at": (datetime.now() - timedelta(days=80)).isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "P010",
        "sku": "SKU-QC-010",
        "name": "3-in-1 Magnetic Fast Wireless Charger",
        "category": "Power",
        "description": "15W MagSafe compatible folding charging station for phone, smartwatch, and wireless earbuds.",
        "stock": 65,
        "unit_cost": 21.00,
        "unit_price": 49.99,
        "reorder_point": 25,
        "target_stock": 85,
        "supplier_id": "SUP-105",
        "supplier_name": "Vanguard Cable & Power Systems",
        "lead_time_days": 4,
        "daily_demand": 10,
        "status": "Healthy",
        "created_at": (datetime.now() - timedelta(days=75)).isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "P011",
        "sku": "SKU-MS-011",
        "name": "Heavy-Duty Gas Spring Monitor Arm",
        "category": "Ergonomics",
        "description": "Counterbalance single monitor mount holding up to 34-inch screens with integrated cable management.",
        "stock": 19,
        "unit_cost": 31.00,
        "unit_price": 79.99,
        "reorder_point": 20,
        "target_stock": 50,
        "supplier_id": "SUP-104",
        "supplier_name": "ErgoWork Dynamic Logistics",
        "lead_time_days": 8,
        "daily_demand": 4,
        "status": "Low Stock",
        "created_at": (datetime.now() - timedelta(days=70)).isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "P012",
        "sku": "SKU-SP-012",
        "name": "Smart Power Strip with Surge Protection",
        "category": "Power",
        "description": "WiFi connected smart power strip with 4 independent AC outlets, 3 USB-A, 1 USB-C PD 30W port.",
        "stock": 84,
        "unit_cost": 17.50,
        "unit_price": 42.99,
        "reorder_point": 25,
        "target_stock": 90,
        "supplier_id": "SUP-105",
        "supplier_name": "Vanguard Cable & Power Systems",
        "lead_time_days": 4,
        "daily_demand": 7,
        "status": "Healthy",
        "created_at": (datetime.now() - timedelta(days=65)).isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "P013",
        "sku": "SKU-DL-013",
        "name": "Monitor Light Bar Screen Lamp",
        "category": "Accessories",
        "description": "Asymmetric optical design screenbar with touch dimming, auto-light sensor, and no screen glare.",
        "stock": 4,
        "unit_cost": 27.00,
        "unit_price": 64.99,
        "reorder_point": 18,
        "target_stock": 55,
        "supplier_id": "SUP-102",
        "supplier_name": "Nova Peripheral Labs",
        "lead_time_days": 7,
        "daily_demand": 6,
        "status": "Critical",
        "created_at": (datetime.now() - timedelta(days=60)).isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "P014",
        "sku": "SKU-BT-014",
        "name": "USB Bluetooth 5.4 Audio Transmitter",
        "category": "Audio",
        "description": "Ultra low-latency aptX Adaptive dual-link audio transmitter dongle for PC and consoles.",
        "stock": 92,
        "unit_cost": 8.00,
        "unit_price": 22.99,
        "reorder_point": 20,
        "target_stock": 100,
        "supplier_id": "SUP-103",
        "supplier_name": "Quantum Audio & Video Tech",
        "lead_time_days": 10,
        "daily_demand": 5,
        "status": "Healthy",
        "created_at": (datetime.now() - timedelta(days=55)).isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "P015",
        "sku": "SKU-NV-015",
        "name": "PCIe 4.0 NVMe M.2 Enclosure (Tool-Free)",
        "category": "Computing",
        "description": "10Gbps aluminum NVMe external drive case with silicone bumper and thermal cooling pad.",
        "stock": 37,
        "unit_cost": 15.00,
        "unit_price": 36.99,
        "reorder_point": 22,
        "target_stock": 70,
        "supplier_id": "SUP-101",
        "supplier_name": "Apex Electronics Supply Co.",
        "lead_time_days": 5,
        "daily_demand": 6,
        "status": "Healthy",
        "created_at": (datetime.now() - timedelta(days=50)).isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "P016",
        "sku": "SKU-WP-016",
        "name": "Mechanical Wrist Rest Pad",
        "category": "Ergonomics",
        "description": "Cooling memory foam ergonomic wrist support with breathable Lycra fabric and non-skid rubber base.",
        "stock": 50,
        "unit_cost": 6.50,
        "unit_price": 18.99,
        "reorder_point": 20,
        "target_stock": 60,
        "supplier_id": "SUP-104",
        "supplier_name": "ErgoWork Dynamic Logistics",
        "lead_time_days": 8,
        "daily_demand": 5,
        "status": "Healthy",
        "created_at": (datetime.now() - timedelta(days=45)).isoformat(),
        "updated_at": datetime.now().isoformat()
    }
]


def generate_sample_sales() -> list[dict]:
    """
    Generates ~180 realistic sales orders spanning the last 90 days.
    Simulates realistic day-of-week demand trends and order distributions.
    """
    random.seed(42)  # Deterministic seed for reproducible baseline
    sales = []
    
    customers = [
        "Acme Corp Tech Div", "Global Logistics Partners", "Apex Financial Group",
        "Skyline Media Labs", "Horizon Softworks", "Vanguard Health Systems",
        "Starlight Innovations", "Zenith Retail", "Beacon Consulting Group",
        "Pacific Commerce", "Solarium Tech", "Ironclad Security Ltd",
        "Metro Studio Works", "Summit Cloud Solutions", "Pinnacle Capital",
        "Alex Rivera", "Jordan Lee", "Samantha Chen", "Marcus Vance",
        "Elena Rostova", "David K. Patel", "Chloe Montgomery", "Liam O'Connor"
    ]
    
    channels = ["Online Store", "B2B Direct", "Enterprise Wholesale", "Retail Outlet"]
    payment_methods = ["Corporate Invoice", "Credit Card", "ACH Transfer", "Wire Transfer", "PayPal"]
    
    # 90 days of history
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90)
    
    order_counter = 1001
    current_date = start_date
    
    while current_date <= end_date:
        # Day-of-week factor: weekdays have 2-4 orders, weekends have 1-2 orders
        weekday = current_date.weekday()
        if weekday in (5, 6):  # Weekend
            orders_today = random.randint(1, 2)
        elif weekday in (1, 2, 3):  # Peak mid-week Tue-Thu
            orders_today = random.randint(2, 4)
        else:
            orders_today = random.randint(1, 3)
            
        for _ in range(orders_today):
            customer = random.choice(customers)
            channel = random.choice(channels)
            payment = random.choice(payment_methods)
            
            # Select 1 to 3 items per order
            num_items = random.choices([1, 2, 3], weights=[0.6, 0.3, 0.1])[0]
            selected_products = random.sample(SAMPLE_PRODUCTS, num_items)
            
            order_items = []
            order_total = 0.0
            
            for prod in selected_products:
                # Quantity: retail vs enterprise wholesale
                if channel == "Enterprise Wholesale":
                    qty = random.randint(3, 10)
                else:
                    qty = random.randint(1, 4)
                    
                line_total = round(qty * prod["unit_price"], 2)
                order_total += line_total
                
                order_items.append({
                    "product_id": prod["id"],
                    "sku": prod["sku"],
                    "product_name": prod["name"],
                    "category": prod["category"],
                    "quantity": qty,
                    "unit_price": prod["unit_price"],
                    "unit_cost": prod["unit_cost"],
                    "total": line_total
                })
                
            hour = random.randint(9, 18)
            minute = random.randint(0, 59)
            order_timestamp = current_date.replace(hour=hour, minute=minute, second=0).isoformat()
            
            sales.append({
                "id": f"ORD-{order_counter}",
                "order_id": f"ORD-{order_counter}",
                "date": order_timestamp,
                "customer_name": customer,
                "channel": channel,
                "payment_method": payment,
                "items": order_items,
                "total_amount": round(order_total, 2),
                "status": "Completed"
            })
            order_counter += 1
            
        current_date += timedelta(days=1)
        
    return sales


SAMPLE_SALES = generate_sample_sales()
