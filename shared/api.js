const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Helper to read/write DB
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
  const initialData = {
    config: { serviceFee: 12, gstPercent: 5 },
    loyaltyTiers: [
      { id: "gold", name: "Gold", discount: 25, threshold: 500, color: "#D4AF37" },
      { id: "platinum", name: "Platinum", discount: 30, threshold: 1000, color: "#708090" },
      { id: "diamond", name: "Diamond", discount: 35, threshold: 2000, color: "#7C3AED" },
    ],
    categories: [
      { id: 'fruits', name: 'Fruits & Veggies', icon: '🥦' },
      { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛' },
      { id: 'beverages', name: 'Beverages', icon: '🧃' },
      { id: 'snacks', name: 'Snacks', icon: '🍪' },
      { id: 'meat', name: 'Meat & Seafood', icon: '🍗' },
      { id: 'bakery', name: 'Bakery', icon: '🍞' },
      { id: 'staples', name: 'Staples', icon: '🌾' },
      { id: 'personal', name: 'Personal Care', icon: '🧴' },
    ],
    products: [
      {
        id: '1',
        name: 'Fresh Banana',
        price: 80,
        category: 'fruits',
        stock: 120,
        status: 'In Stock',
        labels: ['Organic', 'Local'],
        img: 'https://images.unsplash.com/photo-1571771894821-ad996211fdf4?w=400'
      },
      {
        id: '2',
        name: 'Organic Milk',
        price: 75,
        category: 'dairy',
        stock: 45,
        status: 'In Stock',
        labels: ['Organic'],
        img: 'https://images.unsplash.com/photo-1563636619-e910ef4a8b9b?w=400'
      }
    ],
    banners: [
      { id: 'B-1', title: 'Summer Splash Sale', img: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=1080', slot: 'Hero' }
    ],
    orders: [],
    tickets: []
  };
  writeDB(initialData);
}

// Routes
app.get('/api/db', (req, res) => res.json(readDB()));

app.get('/api/products', (req, res) => res.json(readDB().products));
app.post('/api/products', (req, res) => {
  const db = readDB();
  const newProduct = { ...req.body, id: `sku-${Date.now()}` };
  db.products.push(newProduct);
  writeDB(db);
  res.json(newProduct);
});
app.put('/api/products/:id', (req, res) => {
  const db = readDB();
  db.products = db.products.map(p => p.id === req.params.id ? { ...p, ...req.body } : p);
  writeDB(db);
  res.json({ success: true });
});

app.get('/api/orders', (req, res) => res.json(readDB().orders));
app.post('/api/orders', (req, res) => {
  const db = readDB();
  const newOrder = { ...req.body, id: `ORD-${Date.now()}`, time: 'Just Now' };
  db.orders.unshift(newOrder);
  writeDB(db);
  res.json(newOrder);
});

app.get('/api/loyalty', (req, res) => res.json(readDB().loyaltyTiers));
app.post('/api/loyalty', (req, res) => {
  const db = readDB();
  db.loyaltyTiers = req.body;
  writeDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Koti Sync Server running on http://localhost:${PORT}`));
