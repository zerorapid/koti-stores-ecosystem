"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle, 
  Printer, 
  MoreVertical,
  Phone,
  MessageSquare,
  ShieldCheck,
  Zap,
  XCircle,
  Search,
  Filter,
  User,
  Battery,
  FileText,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Receipt,
  ArrowRight,
  TrendingUp,
  Package,
  Mail,
  MoreHorizontal,
  X
} from "lucide-react";
import { ORDERS as INITIAL_ORDERS, RIDERS } from "@/lib/koti-db";
import { db } from "@/lib/koti-firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';

const STATUS_BADGES: any = {
  'Pending': 'bg-amber-50 text-amber-600 border-amber-100',
  'Processing': 'bg-blue-50 text-blue-600 border-blue-100',
  'Dispatch': 'bg-purple-50 text-purple-600 border-purple-100',
  'Delivered': 'bg-green-50 text-green-600 border-green-100',
  'Cancelled': 'bg-red-50 text-red-600 border-red-100',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    // 2. LISTEN FOR LIVE ORDERS
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const orderList = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        // Map fields for Admin UI compatibility
        customer: doc.data().userName || doc.data().customer || 'Koti Customer',
        total: doc.data().total || 0,
        status: doc.data().status ? (doc.data().status.charAt(0).toUpperCase() + doc.data().status.slice(1)) : 'Pending',
        rider: doc.data().driverName || null,
        timeline: [
          { time: '12:42 PM', stage: 'Order Placed', completed: true },
          { time: '12:45 PM', stage: 'Payment Verified', completed: true },
          { time: '1:05 PM', stage: 'Processing at Hub', completed: doc.data().status !== 'pending' },
          { time: 'TBD', stage: 'Out for Delivery', completed: doc.data().status === 'Out for Delivery' },
        ]
      }));
      setOrders(orderList);
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus.toLowerCase(),
        updatedAt: Date.now()
      });
      showToast(`Order ${orderId} updated to ${newStatus}`);
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            o.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === 'Pending').length,
    processing: filteredOrders.filter(o => o.status === 'Processing' || o.status === 'Dispatch').length,
    delivered: filteredOrders.filter(o => o.status === 'Delivered').length,
    revenue: filteredOrders.reduce((sum, o) => sum + o.total, 0)
  }), [filteredOrders]);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <ShoppingBag size={18} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Fulfillment Cycle</span>
           </div>
           <h2 className="text-3xl font-black text-foreground tracking-tighter leading-tight">Order Management</h2>
           <p className="text-muted-foreground font-medium mt-1 text-sm">Manage and track all Koti Stores fulfillment cycles.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-lg text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all shadow-sm">
              <Printer size={16} /> Batch Export
           </button>
           <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-lg border border-border shadow-sm">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-black text-xs">A</div>
              <div>
                 <p className="text-[10px] font-black text-foreground uppercase tracking-tight leading-none mb-1">Admin Hub</p>
                 <p className="text-[10px] font-bold text-muted-foreground leading-none">Super Operations</p>
              </div>
           </div>
        </div>
      </div>

      {/* Analytical Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard label="Total Orders" value={stats.total} icon={ShoppingBag} color="text-foreground" border="border-border" subtitle="Live queue" />
         <StatCard label="Pending/Processing" value={stats.pending + stats.processing} icon={Clock} color="text-amber-500" border="border-amber-100" subtitle="Awaiting action" />
         <StatCard label="Fulfillment Rate" value="94.2%" icon={CheckCircle2} color="text-green-500" border="border-green-100" subtitle="Target: 98%" />
         <StatCard label="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={TrendingUp} color="text-primary" border="border-primary/20" subtitle="Gross Sales" />
      </div>

      {/* Advanced Controls */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-center gap-4">
         <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input 
              type="text" 
              placeholder="Search by Order ID, Customer, or Item..."
              className="w-full pl-12 pr-4 py-3.5 bg-muted/30 border border-input rounded-lg text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-3">
            <select 
              className="bg-muted/30 border border-input px-6 py-3.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground focus:border-primary outline-none appearance-none transition-all"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
               <option value="all">All Statuses</option>
               <option value="Pending">Pending</option>
               <option value="Processing">Processing</option>
               <option value="Dispatch">Dispatch</option>
               <option value="Delivered">Delivered</option>
               <option value="Cancelled">Cancelled</option>
            </select>
            <select className="bg-muted/30 border border-input px-6 py-3.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground focus:border-primary outline-none appearance-none transition-all">
               <option value="all">All Time</option>
               <option value="today">Today</option>
               <option value="week">This Week</option>
               <option value="month">This Month</option>
            </select>
         </div>
      </div>

      {/* High-Density Orders Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-muted/30 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
              <tr>
                <th className="px-8 py-5">Order ID</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Items Preview</th>
                <th className="px-8 py-5">Logistics</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/50 transition-all group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-primary">#{order.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center font-black text-muted-foreground text-xs uppercase border border-border">
                          {order.customer.charAt(0)}
                       </div>
                       <div>
                          <p className="text-[13px] font-black text-foreground leading-tight">{order.customer}</p>
                          <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">+91 98765 43210</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                       <p className="text-[13px] font-black text-foreground">{order.items.length} Items</p>
                       <p className="text-[11px] font-bold text-muted-foreground truncate max-w-[150px]">
                          {order.items[0].name}{order.items.length > 1 ? ', ...' : ''}
                       </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     {order.rider ? (
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center border border-blue-100">
                              <Truck size={14} />
                           </div>
                           <div>
                              <p className="text-[11px] font-black text-foreground tracking-tight">{order.rider}</p>
                              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">En Route</p>
                           </div>
                        </div>
                     ) : (
                        <span className="text-[11px] font-bold text-muted-foreground/50 italic">Not Assigned</span>
                     )}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_BADGES[order.status]}`}>
                       {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[13px] font-black text-foreground">₹{order.total.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2.5 bg-secondary text-muted-foreground rounded-lg border border-border hover:bg-primary hover:text-white transition-all shadow-sm">
                          <ChevronRight size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info */}
        <div className="p-6 border-t border-border flex items-center justify-between">
           <p className="text-[11px] font-bold text-muted-foreground">Showing {filteredOrders.length} of {orders.length} orders</p>
           <div className="flex gap-2">
              <button className="px-4 py-2 border border-border rounded-lg text-[10px] font-black text-muted-foreground hover:text-foreground transition-all">Previous</button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-[10px] font-black shadow-sm">1</button>
              <button className="px-4 py-2 border border-border rounded-lg text-[10px] font-black text-muted-foreground hover:text-foreground transition-all">Next</button>
           </div>
        </div>
      </div>

      {/* High-Fidelity Order Detail Modal - Shadcn Style */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-foreground/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative bg-background w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col animate-in zoom-in-95 duration-500">
              
              {/* Modal Header */}
              <div className="p-8 border-b border-border flex items-center justify-between bg-background sticky top-0 z-10">
                 <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/10">
                       <ShoppingBag size={24} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-foreground tracking-tighter">Order Intelligence: {selectedOrder.id}</h3>
                       <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">Placed on 20th April, 2026 • 12:42 PM</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedOrder(null)} className="p-2.5 bg-muted rounded-full text-muted-foreground hover:text-red-500 transition-all">
                    <X size={20} />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                 
                 {/* Section 1: Customer & Delivery Info */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                          <User size={12} /> Customer Intelligence
                       </h4>
                       <div className="p-6 bg-secondary/30 rounded-xl border border-border space-y-5">
                          <div>
                             <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Name</p>
                             <p className="text-base font-black text-foreground">{selectedOrder.customer}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Contact</p>
                                <p className="text-xs font-bold text-foreground">+91 98765 43210</p>
                             </div>
                             <div>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Tier</p>
                                <p className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded border border-primary/10 inline-block">Diamond Member</p>
                             </div>
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Delivery Address</p>
                             <p className="text-xs font-medium text-muted-foreground leading-relaxed">Flat 302, Green Valley Apartments, Cyber Hub, Gurugram, 122003</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                          <Truck size={12} /> Logistics Hub
                       </h4>
                       <div className="p-6 bg-secondary/30 rounded-xl border border-border flex items-center gap-5">
                          {selectedOrder.rider ? (
                             <>
                                <div className="w-14 h-14 bg-card rounded-xl flex items-center justify-center font-black text-primary text-xl border border-border shadow-sm">
                                   {selectedOrder.rider.charAt(0)}
                                </div>
                                <div>
                                   <p className="text-base font-black text-foreground leading-tight">{selectedOrder.rider}</p>
                                   <p className="text-[11px] font-bold text-muted-foreground mt-1">📱 +91 98765 43211</p>
                                   <div className="flex items-center gap-2 mt-2">
                                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">En Route</span>
                                      <div className="flex items-center gap-1 text-[9px] font-black text-orange-500">
                                         <Battery size={10} /> 82%
                                      </div>
                                   </div>
                                </div>
                             </>
                          ) : (
                             <div className="flex-1 text-center py-4 text-muted-foreground font-bold text-[11px] uppercase tracking-widest italic">
                                No Rider Assigned Yet
                             </div>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* Section 2: Items & Totals */}
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                       <ShoppingBag size={12} /> Itemization
                    </h4>
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                       <div className="divide-y divide-border/50">
                          {selectedOrder.items.map((item: any, idx: number) => (
                             <div key={idx} className="p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                                <div className="flex items-center gap-4">
                                   <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center text-muted-foreground font-black text-[10px] border border-border">
                                      {idx + 1}
                                   </div>
                                   <div>
                                      <p className="text-[13px] font-black text-foreground leading-tight">{item.name}</p>
                                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Qty: {item.qty} units</p>
                                   </div>
                                </div>
                                <p className="text-[13px] font-black text-foreground">₹{item.price * item.qty}</p>
                             </div>
                          ))}
                       </div>
                       <div className="p-8 bg-foreground text-white flex items-center justify-between">
                          <div>
                             <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Billable</p>
                             <h4 className="text-3xl font-black text-white tracking-tighter">₹{selectedOrder.total}</h4>
                          </div>
                          <div className="text-right space-y-1">
                             <p className="text-[11px] font-bold text-white/50 uppercase">Payment: {selectedOrder.payment}</p>
                             <p className="text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded border border-green-500/20">PAID & VERIFIED</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Section 3: Logistics Timeline */}
                 <div className="space-y-4 pb-20">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                       <Clock size={12} /> Fulfillment Timeline
                    </h4>
                    <div className="relative pl-8 space-y-8">
                       <div className="absolute left-3 top-2 bottom-2 w-[1px] bg-border" />
                       {selectedOrder.timeline.map((step: any, idx: number) => (
                          <div key={idx} className="relative">
                             <div className={`absolute -left-8 w-6 h-6 rounded-full border-4 border-background flex items-center justify-center shadow-sm transition-all z-10 ${
                                step.completed ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                             }`}>
                                {step.completed ? <CheckCircle2 size={10} /> : <div className="w-1 h-1 rounded-full bg-current" />}
                             </div>
                             <div>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{step.time}</p>
                                <p className={`text-[13px] font-black ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>{step.stage}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Sticky Footer Status Update */}
              <div className="p-6 border-t border-border bg-background flex flex-col md:flex-row items-center justify-between gap-6 absolute bottom-0 inset-x-0 z-20">
                 <div className="flex items-center gap-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Update Status</p>
                    <select 
                      className="bg-muted/50 border border-input px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary focus:border-primary outline-none appearance-none transition-all"
                      value={selectedOrder.status}
                      onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                    >
                       <option value="Pending">Pending</option>
                       <option value="Processing">Processing</option>
                       <option value="Dispatch">Dispatch</option>
                       <option value="Delivered">Completed</option>
                       <option value="Cancelled">Cancelled</option>
                    </select>
                 </div>
                 <div className="flex items-center gap-3">
                    <button className="px-8 py-3 bg-foreground text-white rounded-lg font-black text-[11px] uppercase tracking-widest shadow-sm hover:opacity-90 transition-all">
                       Download Invoice
                    </button>
                    <button onClick={() => setSelectedOrder(null)} className="px-6 py-3 bg-secondary text-foreground rounded-lg font-black text-[11px] uppercase tracking-widest border border-border">Close</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[300] bg-foreground text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 border border-white/10">
           <div className={`w-6 h-6 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
              <CheckCircle2 size={14} />
           </div>
           <p className="text-[13px] font-black tracking-tight">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, border, subtitle }: any) {
  return (
    <div className={`bg-card p-6 rounded-xl border border-border shadow-sm border-l-4 ${border} transition-all hover:shadow-md group`}>
       <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
          <Icon className={`${color} opacity-20 group-hover:opacity-100 transition-opacity`} size={20} />
       </div>
       <h4 className="text-2xl font-black text-foreground tracking-tighter">{value}</h4>
       <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">{subtitle}</p>
    </div>
  );
}
