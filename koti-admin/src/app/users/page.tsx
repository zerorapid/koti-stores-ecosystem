"use client";

import { useState, useMemo, useEffect } from "react";
import { db } from "@/lib/koti-firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { 
  Search, 
  Filter, 
  MapPin, 
  Award,
  ArrowRight,
  UserCheck,
  Ban,
  TrendingUp,
  ShieldCheck,
  Zap,
  XCircle,
  Home,
  Briefcase,
  Star,
  Package,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Mail,
  MessageSquare,
  Smartphone,
  Trash2,
  Lock,
  Plus,
  Bell,
  Clock,
  X
} from "lucide-react";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [tierFilter, setTierFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredAndSortedUsers = useMemo(() => {
    let result = users.filter(u => {
      const matchesSearch = (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.id || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = tierFilter === 'All' || u.tier === tierFilter;
      return matchesSearch && matchesTier;
    });

    if (sortConfig) {
      result.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [users, searchTerm, tierFilter, sortConfig]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <UsersIcon size={18} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Synchronized Profiles</span>
           </div>
           <h2 className="text-3xl font-black text-foreground tracking-tighter">User Intelligence Hub</h2>
           <p className="text-muted-foreground font-medium mt-1 text-sm">Managing {users.length} active customer profiles with real-time loyalty tracking.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-5 py-2 bg-card border border-border rounded-lg shadow-sm flex items-center gap-3">
              <div className={`w-2 h-2 ${isLoading ? 'bg-amber-500' : 'bg-green-500'} rounded-full animate-pulse`} />
              <p className="text-[10px] font-black text-foreground tracking-tight uppercase">Sync Status: {isLoading ? 'SYNCING...' : 'HEALTHY'}</p>
           </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <MetricCard label="Diamond Users" value={users.filter(u => u.tier === 'Diamond').length} icon={Zap} color="text-violet-500" />
         <MetricCard label="Loyalty Score" value="8.4" icon={Star} color="text-amber-500" />
         <MetricCard label="Avg. Spend" value={`₹${users.length > 0 ? (users.reduce((sum, u) => sum + (u.totalSpent || 0), 0) / users.length).toFixed(0) : 0}`} icon={TrendingUp} color="text-primary" />
         <MetricCard label="Growth Rate" value="+14.2%" icon={ShieldCheck} color="text-blue-500" />
      </div>

      {/* Advanced Control Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-center gap-4">
         <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
            <input 
               type="text" 
               placeholder="Find users by ID, Name or Contact..."
               className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-input rounded-lg text-[13px] font-bold focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-2">
            <button 
              onClick={() => setTierFilter('All')}
              className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${tierFilter === 'All' ? 'bg-primary text-white shadow-sm border border-primary/10' : 'bg-muted/50 text-muted-foreground hover:bg-border border border-transparent'}`}
            >
               All
            </button>
            <button 
              onClick={() => setTierFilter('Diamond')}
              className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${tierFilter === 'Diamond' ? 'bg-violet-500 text-white shadow-sm border border-violet-600/10' : 'bg-muted/50 text-muted-foreground hover:bg-border border border-transparent'}`}
            >
               Diamond
            </button>
            <button 
              onClick={() => setTierFilter('Gold')}
              className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${tierFilter === 'Gold' ? 'bg-amber-500 text-white shadow-sm border border-amber-600/10' : 'bg-muted/50 text-muted-foreground hover:bg-border border border-transparent'}`}
            >
               Gold
            </button>
         </div>
      </div>

      {/* User Table - Shadcn Style */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/30 border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <th className="px-8 py-5">Customer Profile</th>
              <th className="px-8 py-5 text-center">Membership</th>
              <th className="px-8 py-5 text-center">Orders</th>
              <th className="px-8 py-5 text-right">LTV</th>
              <th className="px-8 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredAndSortedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-secondary/50 transition-colors group cursor-pointer" onClick={() => setSelectedUser(user)}>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center font-black text-primary text-[15px] border border-primary/10 shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-foreground leading-tight tracking-tight">{user.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">ID: {user.id} • {user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                   <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      user.tier === 'Diamond' ? 'bg-violet-50 text-violet-600 border-violet-100 shadow-sm' :
                      user.tier === 'Platinum' ? 'bg-slate-50 text-slate-600 border-slate-100' :
                      user.tier === 'Gold' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-muted text-muted-foreground border-border'
                   }`}>
                      <Award size={10} />
                      {user.tier}
                   </div>
                </td>
                <td className="px-8 py-6 text-center">
                   <p className="text-[13px] font-black text-foreground">{user.orders}</p>
                </td>
                <td className="px-8 py-6 text-right">
                   <p className="text-[13px] font-black text-foreground">₹{(user.totalSpent || 0).toLocaleString()}</p>
                </td>
                <td className="px-8 py-6 text-right">
                   <button className="p-2 bg-secondary text-muted-foreground rounded-lg border border-border hover:bg-primary hover:text-white transition-all shadow-sm">
                      <ArrowRight size={16} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal - Shadcn Style */}
      {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-foreground/60 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="bg-background w-full max-w-xl rounded-xl overflow-hidden shadow-2xl border border-border relative">
                <button onClick={() => setSelectedUser(null)} className="absolute top-5 right-5 p-2 bg-muted rounded-full hover:text-red-500 transition-all z-10 border border-border">
                   <X size={18} />
                </button>
                <div className="p-8">
                   <div className="flex items-center gap-5 mb-8 pb-8 border-b border-border">
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl font-black border border-primary/10 shadow-sm">
                         {selectedUser.name.charAt(0)}
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-foreground tracking-tighter leading-none">{selectedUser.name}</h3>
                         <p className="text-muted-foreground font-bold text-[10px] mt-2 uppercase tracking-widest">{selectedUser.tier} Membership Tier</p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-5 bg-secondary/30 rounded-xl border border-border">
                         <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Lifetime Spend</p>
                         <p className="text-xl font-black text-foreground tracking-tighter">₹{(selectedUser.totalSpent || 0).toLocaleString()}</p>
                      </div>
                      <div className="p-5 bg-secondary/30 rounded-xl border border-border">
                         <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Order Volume</p>
                         <p className="text-xl font-black text-foreground tracking-tighter">{selectedUser.orders} Orders</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Engagement Performance</h4>
                      <div className="p-6 bg-card rounded-xl border border-border space-y-5 shadow-sm">
                         <div className="flex justify-between items-center">
                            <p className="text-[12px] font-bold text-muted-foreground">Joined Date</p>
                            <p className="text-[12px] font-black text-foreground uppercase tracking-tight">{selectedUser.join}</p>
                         </div>
                         <div className="flex justify-between items-center">
                            <p className="text-[12px] font-bold text-muted-foreground">App Client</p>
                            <p className="text-[12px] font-black text-foreground uppercase tracking-tight">v4.2.1 Stable</p>
                         </div>
                         <div className="flex justify-between items-center">
                            <p className="text-[12px] font-bold text-muted-foreground">Push Delivery</p>
                            <p className="text-[11px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded border border-green-100">Synchronized</p>
                         </div>
                      </div>
                   </div>

                   <button className="w-full py-4 bg-primary text-white rounded-lg font-black text-[11px] uppercase tracking-widest shadow-sm hover:opacity-90 active:scale-95 transition-all mt-8">
                      Push Promotional Payload
                   </button>
                </div>
             </div>
          </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-5 hover:border-primary/20 transition-all h-28 group">
       <div className={`p-3 bg-muted rounded-lg ${color} shadow-sm border border-border/10 group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
       </div>
       <div>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 leading-none">{label}</p>
          <p className="text-2xl font-black text-foreground tracking-tighter">{value}</p>
       </div>
    </div>
  );
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
