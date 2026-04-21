"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Truck, 
  MapPin, 
  Users, 
  Clock, 
  Search, 
  ChevronRight, 
  Navigation,
  CheckCircle2,
  AlertCircle,
  Battery,
  Zap,
  MoreVertical,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  ShoppingBag,
  Bike,
  Star,
  XCircle,
  Phone,
  MessageSquare,
  ChevronDown,
  X
} from "lucide-react";
import { db } from "@/lib/koti-firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

export default function DeliveryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [simulationProgress, setSimulationProgress] = useState(0.35);
  
  const [riders, setRiders] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Firestore Sync - Riders
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "riders"), (snapshot) => {
      setRiders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Firestore Sync - Orders
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Derived Data
  const deliveries = useMemo(() => {
    return orders.map(order => ({
      ...order,
      rider: riders.find(r => r.id === order.riderId) || { name: "Unassigned", id: "N/A" },
      distance: order.distance || "2.4 km",
      progress: order.status?.toLowerCase() === 'delivered' ? 1 : 0.35,
      speed: 0.005,
      startCoords: { x: 15, y: 20 },
      endCoords: { x: 85, y: 80 }
    })).filter(d => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        d.id.toLowerCase().includes(searchLower) || 
        (d.customerName || d.userName || "").toLowerCase().includes(searchLower) ||
        (d.rider?.name || "").toLowerCase().includes(searchLower);
        
      const statusLower = d.status?.toLowerCase() || "";
      const matchesStatus = statusFilter === 'all' || statusLower === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [orders, riders, searchTerm, statusFilter]);

  // Live Simulation Effect (Keep for visual feedback if status is processing)
  useEffect(() => {
    let interval: any;
    if (selectedDelivery && selectedDelivery.status?.toLowerCase() === 'processing') {
      interval = setInterval(() => {
        setSimulationProgress(prev => Math.min(0.9, prev + 0.002));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [selectedDelivery]);

  const handleMarkDelivered = async (orderId: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: 'delivered' });
      setSelectedDelivery(prev => prev ? { ...prev, status: 'delivered' } : null);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleAssignRider = async (orderId: string, rider: any) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { 
        riderId: rider.id,
        rider: { id: rider.id, name: rider.name },
        status: 'Processing'
      });
      setSelectedDelivery(prev => prev ? { ...prev, riderId: rider.id, status: 'Processing' } : null);
      alert(`Order assigned to ${rider.name}`);
    } catch (err) {
      console.error("Failed to assign rider:", err);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <Truck size={18} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Fleet Dispatch</span>
           </div>
           <h2 className="text-3xl font-black text-foreground tracking-tighter">Logistics Engine</h2>
           <p className="text-muted-foreground font-medium mt-1 text-sm">Real-time GPS synchronization and fleet orchestration.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-6 py-3 bg-primary text-white rounded-lg font-black text-[11px] uppercase tracking-widest shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2">
              <Zap size={16} /> Auto-Optimize Fleet
           </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard label="Active In Transit" value={deliveries.filter(d => d.status?.toLowerCase() === 'processing').length} trend="+12%" icon={Truck} color="text-primary" />
         <StatCard label="Completed Today" value={deliveries.filter(d => d.status?.toLowerCase() === 'delivered').length} trend="Optimal" icon={CheckCircle2} color="text-green-500" />
         <StatCard label="Failed/Alerts" value="0" trend="Safe" icon={AlertCircle} color="text-red-500" />
         <StatCard label="Avg. Response" value="16.4m" trend="-2.4m" icon={Clock} color="text-blue-500" />
      </div>

      {/* Controls */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-center gap-4">
         <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input 
               type="text" 
               placeholder="Search by Order ID, Customer, or Assigned Rider..."
               className="w-full pl-12 pr-4 py-3.5 bg-muted/30 border border-input rounded-lg text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <select 
            className="px-6 py-3.5 bg-muted/30 border border-input rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground outline-none appearance-none transition-all pr-12 relative"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
         >
            <option value="all">All Statuses</option>
            <option value="processing">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="pending">Pending</option>
         </select>
      </div>

      {/* Delivery Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-muted/30 border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Order ID</th>
              <th className="px-8 py-5">Customer</th>
              <th className="px-8 py-5">Rider</th>
              <th className="px-8 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-center">Live ETA</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {deliveries.map((d) => (
              <tr key={d.id} className="hover:bg-secondary/50 transition-all group cursor-pointer" onClick={() => { setSelectedDelivery(d); setSimulationProgress(d.progress); }}>
                <td className="px-8 py-6">
                  <span className="text-sm font-black text-primary">#{d.id.slice(-6).toUpperCase()}</span>
                </td>
                <td className="px-8 py-6">
                   <p className="text-[13px] font-black text-foreground leading-tight">{d.customerName || d.userName || "Koti Customer"}</p>
                   <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">Contact Sync Active</p>
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center font-black text-primary text-[11px] border border-primary/10">
                         {d.rider.name.charAt(0)}
                      </div>
                      <span className="text-[13px] font-bold text-foreground">{d.rider.name}</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-center">
                   <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      (d.status?.toLowerCase() === 'processing' && d.riderId) ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      d.status?.toLowerCase() === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                      'bg-muted text-muted-foreground border-border'
                   }`}>
                      {(d.status?.toLowerCase() === 'processing' && d.riderId) && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />}
                      {(d.status?.toLowerCase() === 'processing' && d.riderId) ? 'In Transit' : 
                       (d.status?.toLowerCase() === 'processing' && !d.riderId) ? 'Awaiting Rider' : 
                       (d.status || 'Pending')}
                   </div>
                </td>
                <td className="px-8 py-6 text-center">
                   <span className="text-[13px] font-black text-primary font-mono">{d.status?.toLowerCase() === 'processing' ? '14:24' : '--'}</span>
                </td>
                <td className="px-8 py-6 text-right">
                   <button className="p-2.5 bg-secondary text-muted-foreground rounded-lg border border-border hover:bg-primary hover:text-white transition-all shadow-sm">
                      <Navigation size={16} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TRACKING MODAL (Split View) */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center p-6 bg-foreground/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl bg-background h-full max-h-[850px] shadow-2xl rounded-2xl border border-border animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col lg:flex-row">
             
             {/* Left: Info Panel */}
             <div className="flex-1 p-10 overflow-y-auto custom-scrollbar flex flex-col bg-background">
                <div className="flex items-center justify-between mb-10">
                   <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[2px] mb-2">Live Shipment Tracking</p>
                      <h3 className="text-3xl font-black text-foreground tracking-tighter">Order {selectedDelivery.id}</h3>
                   </div>
                   <button onClick={() => setSelectedDelivery(null)} className="p-2.5 bg-muted rounded-full text-muted-foreground hover:text-red-500 transition-all"><X size={20} /></button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                   <DetailItem label="Customer" value={selectedDelivery.customerName || selectedDelivery.userName || "Koti User"} />
                   <DetailItem label="Contact" value={selectedDelivery.userPhone || "No Contact"} />
                   <DetailItem label="Assigned Rider" value={selectedDelivery.rider?.name || "Unassigned"} highlight={!selectedDelivery.rider} />
                   <DetailItem label="Live ETA" value={selectedDelivery.status?.toLowerCase() === 'processing' ? '14 mins' : '--'} highlight />
                </div>

                {/* Rider Assignment Area (If Unassigned) */}
                {!selectedDelivery.riderId && !selectedDelivery.rider && (
                   <div className="mb-10 p-5 bg-primary/5 border border-primary/10 rounded-xl">
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Select Rider for Dispatch</h4>
                      <div className="space-y-3">
                         {riders.map((r) => (
                            <button 
                               key={r.id}
                               onClick={() => handleAssignRider(selectedDelivery.id, r)}
                               className="w-full flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:border-primary transition-all group"
                            >
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center font-black text-primary text-[10px]">{r.name.charAt(0)}</div>
                                  <div className="text-left">
                                     <p className="text-[12px] font-black text-foreground leading-none">{r.name}</p>
                                     <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase">{r.vehicle || 'On Foot'}</p>
                                  </div>
                               </div>
                               <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                         ))}
                         {riders.length === 0 && <p className="text-[10px] font-bold text-muted-foreground text-center">No active riders online</p>}
                      </div>
                   </div>
                )}

                {/* Progress Stages */}
                <div className="space-y-4 mb-10">
                   <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Fulfillment Stages</h4>
                   <div className="flex justify-between relative px-2 py-6">
                      <div className="absolute top-[42px] left-0 right-0 h-1 bg-muted rounded-full -z-0" />
                      <div className="absolute top-[42px] left-0 h-1 bg-primary rounded-full -z-0 transition-all duration-1000" style={{ width: `${simulationProgress * 100}%` }} />
                      
                      <StageDot label="Picked" active={simulationProgress >= 0.1} completed={simulationProgress > 0.3} />
                      <StageDot label="Transit" active={simulationProgress >= 0.4} completed={simulationProgress > 0.7} />
                      <StageDot label="Arriving" active={simulationProgress >= 0.8} completed={simulationProgress > 0.9} />
                      <StageDot label="Delivered" active={simulationProgress >= 1.0} completed={simulationProgress >= 1.0} />
                   </div>
                </div>

                <div className="mt-auto flex gap-3">
                   <button className="flex-1 py-4 bg-muted text-foreground rounded-lg font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-border transition-all border border-border">
                      <Phone size={14} /> Call Rider
                   </button>
                   <button 
                     onClick={() => handleMarkDelivered(selectedDelivery.id)}
                     className="flex-1 py-4 bg-primary text-white rounded-lg font-black text-[11px] uppercase tracking-widest shadow-sm hover:opacity-90 active:scale-95 transition-all"
                   >
                      Mark as Delivered
                   </button>
                </div>
             </div>

             {/* Right: Map Panel */}
             <div className="flex-1 bg-secondary/30 p-10 flex flex-col border-l border-border">
                <div className="flex-1 bg-foreground rounded-xl relative overflow-hidden shadow-md border border-border/10">
                   <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                   
                   {/* Start & End Points */}
                   <div className="absolute top-[20%] left-[15%] w-5 h-5 bg-muted-foreground/40 rounded-full border-2 border-white/10" />
                   <div className="absolute bottom-[20%] right-[15%] w-7 h-7 bg-green-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
                   
                   {/* Route Path (Dashed) */}
                   <div className="absolute top-[20%] left-[15%] right-[15%] bottom-[20%] border-t-[1px] border-dashed border-white/5 -rotate-[35deg] origin-left" />

                   {/* Rider Indicator */}
                   <div 
                      className="absolute w-10 h-10 bg-primary rounded-lg border-2 border-white shadow-xl flex items-center justify-center transition-all duration-1000 ease-linear z-20"
                      style={{ 
                         left: `${15 + (70 * simulationProgress)}%`,
                         top: `${20 + (60 * simulationProgress)}%`,
                         transform: 'translate(-50%, -50%)'
                      }}
                   >
                      <Bike size={18} className="text-white" />
                      <div className="absolute -inset-3 bg-primary/20 rounded-full animate-ping -z-10" />
                   </div>

                   <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                      <div className="px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/5 text-[9px] font-black text-white uppercase tracking-widest">
                         Sector 44 Grid
                      </div>
                      <div className="px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/5 text-[9px] font-black text-white uppercase tracking-widest">
                         24 km/h
                      </div>
                   </div>
                </div>

                <div className="mt-8 space-y-4">
                   <div className="flex justify-between items-center px-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Live Progress</span>
                      <span className="text-[10px] font-black text-primary uppercase">{Math.round(simulationProgress * 100)}% Journey</span>
                   </div>
                   <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${simulationProgress * 100}%` }} />
                   </div>
                </div>
             </div>

          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, trend, icon: Icon, color }: any) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm transition-all hover:shadow-md group">
       <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${color} bg-current/5 group-hover:scale-110 transition-transform`}>
             <Icon size={20} />
          </div>
          <span className="text-[9px] font-black px-2 py-0.5 bg-muted text-muted-foreground rounded-md border border-border/50 uppercase tracking-widest">
             {trend}
          </span>
       </div>
       <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
          <h4 className="text-2xl font-black text-foreground tracking-tighter mt-1">{value}</h4>
       </div>
    </div>
  );
}

function DetailItem({ label, value, highlight }: any) {
  return (
    <div>
       <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 leading-none">{label}</label>
       <span className={`text-[15px] font-black tracking-tight ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}

function StageDot({ label, active, completed }: any) {
  return (
    <div className="flex flex-col items-center gap-2 relative z-10">
       <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-background shadow-sm transition-all duration-500 ${completed ? 'bg-green-500' : (active ? 'bg-primary' : 'bg-muted')}`}>
          {completed ? <CheckCircle2 size={12} className="text-white" /> : <div className="w-1.5 h-1.5 bg-background rounded-full" />}
       </div>
       <span className={`text-[9px] font-black uppercase tracking-widest ${active || completed ? 'text-foreground' : 'text-muted-foreground/50'}`}>{label}</span>
    </div>
  );
}
