import { db } from "./koti-firebase";
import { collection, getDocs } from "firebase/firestore";

async function runHealthCheck() {
  console.log("🛰️ INITIALIZING CLOUD HEALTH CHECK...");
  
  try {
    const collections = ["orders", "products", "users", "support_tickets"];
    
    for (const col of collections) {
      const snapshot = await getDocs(collection(db, col));
      console.log(`✅ [${col.toUpperCase()}] Connection: OK | Documents Found: ${snapshot.size}`);
    }
    
    console.log("\n🚀 VERDICT: CLOUD CONNECTION IS 100% HEALTHY");
  } catch (err) {
    console.error("❌ CLOUD CONNECTION FAILED:", err);
  }
}

runHealthCheck();
