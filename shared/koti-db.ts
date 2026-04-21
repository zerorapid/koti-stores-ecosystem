// ─── Koti Ecosystem: Master Shared Database ─────────────────────────────────────

export const SHARED_CONFIG = {
  serviceFee: 12,
  gstPercent: 5,
  loyaltyTiers: [
    { id: "gold", name: "Gold", discount: 25, threshold: 500, color: "#D4AF37" },
    { id: "platinum", name: "Platinum", discount: 30, threshold: 1000, color: "#708090" },
    { id: "diamond", name: "Diamond", discount: 35, threshold: 2000, color: "#7C3AED" },
  ],
};

export const CATEGORIES = [
  { id: 'fruits', name: 'Fruits & Veggies', icon: '🥦' },
  { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛' },
  { id: 'beverages', name: 'Beverages', icon: '🧃' },
  { id: 'snacks', name: 'Snacks', icon: '🍪' },
  { id: 'meat', name: 'Meat & Seafood', icon: '🍗' },
  { id: 'bakery', name: 'Bakery', icon: '🍞' },
  { id: 'staples', name: 'Staples', icon: '🌾' },
  { id: 'household', name: 'Household', icon: '🧹' },
  { id: 'personal', name: 'Personal Care', icon: '🧴' },
  { id: 'frozen', name: 'Frozen Foods', icon: '🧊' },
];

export const PRODUCTS = [
  {
    id: '1',
    name: 'Fresh Banana',
    price: 80,
    category: 'fruits',
    stock: 120,
    status: 'In Stock',
    labels: ['Organic', 'Local', 'Fast Selling'],
    img: 'https://images.unsplash.com/photo-1571771894821-ad996211fdf4?w=400'
  },
  {
    id: '2',
    name: 'Organic Milk',
    price: 75,
    category: 'dairy',
    stock: 45,
    status: 'In Stock',
    labels: ['Organic', 'Most Popular'],
    img: 'https://images.unsplash.com/photo-1563636619-e910ef4a8b9b?w=400'
  },
  {
    id: '3',
    name: 'Red Apples',
    price: 180,
    category: 'fruits',
    stock: 15,
    status: 'Low Stock',
    labels: ['Exotic', 'New Arrival'],
    img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?w=400'
  },
  {
    id: 'sku-sync-test',
    name: '✨ Sync Test Product',
    price: 99,
    category: 'snacks',
    stock: 100,
    status: 'In Stock',
    labels: ['New Arrival', 'Sync Testing'],
    img: 'https://images.unsplash.com/photo-1599490659223-915224cc684d?w=400'
  },
  {
    id: 'sku-mysore-sandal',
    name: 'Mysore Sandal Soap',
    price: 45,
    category: 'personal',
    stock: 250,
    status: 'In Stock',
    labels: ['Fast Selling', 'Traditional', 'Organic'],
    img: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=400'
  }
];

export const BANNERS = [
  { 
    id: 'B-1', 
    title: 'Summer Splash Sale', 
    img: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=1080', 
    slot: 'Hero', 
    city: 'Nashik' 
  },
  { 
    id: 'B-2', 
    title: 'Free Delivery Weekend', 
    img: 'https://images.unsplash.com/photo-1526367790999-0150786486a9?w=1080', 
    slot: 'Sticky', 
    city: 'Vijayawada' 
  }
];

export const USERS = [
  { id: "CUST-101", name: "Arjun Mehta", email: "arjun@example.com", tier: "Diamond", orders: 42, ltv: 28400, totalSpent: 28400, join: "2024-08-12", status: 'Active' },
  { id: "CUST-103", name: "Rahul Verma", email: "rahul@example.com", tier: "Diamond", orders: 35, ltv: 22100, totalSpent: 22100, join: "2024-09-20", status: 'Active' },
];

export const RIDERS = [
  { id: 'R-1', name: 'Rajesh M.', status: 'On Duty', battery: '84%', rating: '4.8' },
];

export const LIVE_ORDERS = [
  {
    id: 'ORD-TEST-1',
    customer: 'Jayapal Reddy',
    items: ['Sync Test Product x 1'],
    total: 99,
    status: 'In Progress',
    rider: 'Rajesh M.',
    time: 'Just Now'
  }
];

export const ORDERS = LIVE_ORDERS;

export const TICKETS = [
  { 
    id: "TK-8841", 
    custId: "CUST-101", 
    subject: "Missing Amul Milk & Tomatoes", 
    status: "open", 
    priority: "high", 
    slaMin: 15, 
    created: Date.now() - 1000*60*8, 
    agent: "Unassigned",
    history: [
      { from: "customer", text: "Hi, my order #ORD-9921 was delivered but Amul milk and tomatoes are missing.", time: "10:15" },
      { from: "agent", text: "Hi Arjun, I'm checking this right now. Could you share the delivery photo?", time: "10:18" }
    ]
  }
];
