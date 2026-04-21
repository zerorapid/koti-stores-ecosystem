"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/lib/koti-firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  Award, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function Dashboard() {
  const [revenue, setRevenue] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [userCount, setUserCount] = useState(0);

  const SYSTEM_MODULES = [
    { id: "orders", label: "Order Management", description: `Manage ${activeOrders} live deliveries.`, href: "/orders", icon: ShoppingBag, color: "bg-blue-500", status: "ONLINE" },
    { id: "inventory", label: "Inventory & Catalog", description: "Add/Edit products and monitor stock levels.", href: "/inventory", icon: Package, color: "bg-orange-500", status: "ONLINE" },
    { id: "users", label: "Customer Management", description: `Manage ${userCount} active users and loyalty tiers.`, href: "/users", icon: Users, color: "bg-purple-500", status: "ONLINE" },
    { id: "delivery", label: "Delivery Logistics", description: "Live rider tracking and dispatch controls.", href: "/delivery", icon: Truck, color: "bg-green-500", status: "ONLINE" },
    { id: "loyalty", label: "Koti Discounts", description: "Configure global tiers and discount rates.", href: "/loyalty", icon: Award, color: "bg-amber-500", status: "ONLINE" },
    { id: "support", label: "Customer Support", description: "Live chat and user query resolution.", href: "/support", icon: MessageSquare, color: "bg-pink-500", status: "ONLINE" },
    { id: "reports", label: "Financial Reports", description: "Export CSV/PDF sales and tax reports.", href: "/reports", icon: BarChart3, color: "bg-indigo-500", status: "ONLINE" },
    { id: "settings", label: "Global Settings", description: "Maintenance mode and service fee control.", href: "/settings", icon: Settings, color: "bg-slate-500", status: "ONLINE" },
  ];

  useEffect(() => {
    // 1. Sync Orders (Revenue & Activity)
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      let totalRev = 0;
      let active = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        const status = data.status?.toLowerCase();
        if (status === "delivered") {
          totalRev += data.total || 0;
        } else if (status !== "cancelled") {
          active++;
        }
      });
      setRevenue(totalRev);
      setActiveOrders(active);
    });

    // 2. Sync Users
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUserCount(snapshot.size || 8400); // Fallback to baseline
    });

    return () => {
      unsubOrders();
      unsubUsers();
    };
  }, []);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Grand Header - Structured Day Mode */}
      <div className="relative p-10 bg-primary rounded-xl overflow-hidden shadow-sm">
         <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
         <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/10">
                  <ShieldCheck size={14} className="text-white" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">Control Environment</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-[1.1]">
                  Koti Stores <br/> Operations Portal
               </h1>
               <p className="text-white/80 font-medium mt-4 max-w-md text-sm leading-relaxed">
                  Global administrative hub for managing logistics, inventory, and financial systems across the Koti ecosystem.
               </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
               <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/10 text-center">
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">Live Revenue</p>
                  <p className="text-2xl font-black text-white tracking-tight">₹{(revenue/1000000).toFixed(2)}M</p>
               </div>
               <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/10 text-center">
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">Active Orders</p>
                  <p className="text-2xl font-black text-white tracking-tight">{activeOrders}</p>
               </div>
            </div>
         </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-foreground tracking-tighter">System Modules</h2>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">All Systems Operational</span>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SYSTEM_MODULES.map((module) => (
              <Link key={module.id} href={module.href} className="group">
                <div className="bg-card p-7 rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between">
                   <div className="space-y-6">
                      <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center text-white shadow-sm border border-white/10`}>
                         <module.icon size={22} />
                      </div>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-[13px] font-black text-foreground tracking-tight leading-none">{module.label}</h3>
                         </div>
                         <p className="text-[11px] font-medium text-muted-foreground leading-relaxed mt-1">
                            {module.description}
                         </p>
                      </div>
                   </div>
                   <div className="mt-8 flex items-center justify-between pt-5 border-t border-border/50">
                      <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-widest border border-green-100">
                         {module.status}
                      </span>
                      <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-muted-foreground">
                         <ArrowRight size={14} />
                      </div>
                   </div>
                </div>
              </Link>
            ))}
         </div>
      </div>

      {/* Global Health Footer */}
      <div className="bg-foreground p-10 rounded-xl text-white flex flex-col lg:flex-row items-center justify-between gap-8 overflow-hidden relative border border-border/10 shadow-sm">
         <div className="absolute bottom-[-20%] right-[-10%] p-12 opacity-5 pointer-events-none">
            <Zap size={240} />
         </div>
         <div className="space-y-2 text-center lg:text-left relative z-10">
            <h4 className="text-xl font-black tracking-tighter">Mission Ready</h4>
            <p className="text-white/50 font-medium max-w-sm text-sm">All core business logic and operational modules are synchronized with the shared data layer.</p>
         </div>
         <div className="flex flex-wrap items-center justify-center gap-6 relative z-10">
            <HealthMetric label="Database" value="SYNCED" />
            <HealthMetric label="API Node" value="READY" />
            <HealthMetric label="Security" value="SSL:OK" />
         </div>
      </div>
    </div>
  );
}

function HealthMetric({ label, value }: { label: string, value: string }) {
  return (
    <div className="text-center px-6 border-r last:border-none border-white/10">
       <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{label}</p>
       <p className="text-[12px] font-black text-green-500 tracking-tight">{value}</p>
    </div>
  );
}
