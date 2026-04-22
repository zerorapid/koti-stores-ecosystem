#!/bin/bash

# Koti Stores: Master Inventory Seed
echo "🌱 Seeding Official Grand Opening Data..."

# Note: In a real environment, you'd use firebase-admin, 
# but for this 'head-cooling' setup, we can use a simple node script.

cat <<EOF > seed-data.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // You'll need to download this from Firebase Settings

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const categories = [
  { id: 'veggies', name: 'Fresh Vegetables', img: 'https://images.unsplash.com/photo-1597362868123-d5144e07bf93' },
  { id: 'fruits', name: 'Exotic Fruits', img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf' },
  { id: 'dairy', name: 'A2 Dairy & Milk', img: 'https://images.unsplash.com/photo-1550583724-b26cc28df5d2' },
  { id: 'staples', name: 'Atta & Staples', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff' }
];

const products = [
  { name: 'Organic Roma Tomatoes', category: 'veggies', price: 40, stock: 100, status: 'In Stock', labels: ['Organic', 'Best Seller'], img: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31' },
  { name: 'Kashmiri Royal Apples', category: 'fruits', price: 180, stock: 50, status: 'In Stock', labels: ['Premium', 'New Arrival'], img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6' },
  { name: 'Fresh A2 Cow Milk', category: 'dairy', price: 75, stock: 200, status: 'In Stock', labels: ['Organic', 'Fresh'], img: 'https://images.unsplash.com/photo-1563636619-e9107da5a76a' },
  { name: 'Cold Pressed Sunflower Oil', category: 'staples', price: 210, stock: 30, status: 'Low Stock', labels: ['Healthy'], img: 'https://images.unsplash.com/photo-1474979266404-7eaacbadb8c5' }
];

async function seed() {
  console.log("📤 Uploading Categories...");
  for (const cat of categories) {
    await db.collection('categories').doc(cat.id).set(cat);
  }

  console.log("📤 Uploading Products...");
  for (const prod of products) {
    await db.collection('products').add({ ...prod, createdAt: Date.now() });
  }

  console.log("✅ Database Seeded Successfully!");
  process.exit();
}

seed();
EOF

echo "✨ Seed script created: seed-data.js"
echo "👉 NEXT STEP: Download your 'serviceAccountKey.json' from Firebase Console -> Project Settings -> Service Accounts."
echo "👉 THEN RUN: node seed-data.js"
