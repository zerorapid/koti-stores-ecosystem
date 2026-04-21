import { db } from "./koti-firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

async function seedEverything() {
  console.log("🌱 STARTING MASTER DATABASE SEEDING...");

  try {
    // 1. Seed Riders
    const riders = [
      { name: "Ramesh Kumar", phone: "+91 98765 43210", status: "online", vehicle: "Ather 450X" },
      { name: "Suresh Raina", phone: "+91 98888 77777", status: "online", vehicle: "Activa 6G" }
    ];
    for (const r of riders) {
      await addDoc(collection(db, "riders"), { ...r, createdAt: Date.now() });
      console.log(`✅ Rider added: ${r.name}`);
    }

    // 2. Seed Support Tickets
    const tickets = [
      { 
        userName: "Jayapal", 
        userPhone: "+91 90000 11111", 
        subject: "Where is my order?", 
        status: "open", 
        priority: "high",
        messages: [
          { role: "user", text: "My order #KT123 is delayed by 15 mins.", time: Date.now() }
        ]
      }
    ];
    for (const t of tickets) {
      await addDoc(collection(db, "support_tickets"), { ...t, createdAt: Date.now() });
      console.log(`✅ Ticket added: ${t.subject}`);
    }

    // 3. Seed Coupons
    const coupons = [
      { code: "KOTINEW", rate: 0.2, limit: 1000, used: 42, expiry: "2026-12-31" },
      { code: "FREESHIP", rate: 0.0, limit: 500, used: 12, expiry: "2026-06-30" }
    ];
    for (const c of coupons) {
      await addDoc(collection(db, "coupons"), { ...c, createdAt: Date.now() });
      console.log(`✅ Coupon added: ${c.code}`);
    }

    // 4. Seed Notifications
    const notifs = [
      { title: "Fresh Veggies at 20% Off!", body: "Grab them before they are gone.", target: "All Users", status: "Completed", delivered: 1420, opened: 380 }
    ];
    for (const n of notifs) {
      await addDoc(collection(db, "notifications"), { ...n, createdAt: Date.now() });
      console.log(`✅ Notification added: ${n.title}`);
    }

    console.log("\n💎 SEEDING COMPLETE: YOUR DATABASE IS NOW ALIVE!");
  } catch (err) {
    console.error("❌ SEEDING FAILED:", err);
  }
}

seedEverything();
