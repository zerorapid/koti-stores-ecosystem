"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/koti-firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { 
  Award, 
  Plus, 
  Trash2, 
  TrendingDown, 
  Users, 
  Percent, 
  Zap, 
  Star, 
  Crown,
  CheckCircle2,
  XCircle,
  Target,
  Flame,
  AlertCircle,
  Save,
  ChevronRight,
  Info,
  Settings,
  X,
  PlusCircle,
  MinusCircle,
  ArrowRight
} from "lucide-react";

export default function LoyaltyPage() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [editingTier, setEditingTier] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Firestore Sync
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "loyalty", "config"), (snapshot) => {
      if (snapshot.exists()) {
        setTiers(snapshot.data().tiers || []);
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpdateTier = async (updatedTier: any) => {
    const newTiers = tiers.map(t => t.id === updatedTier.id ? updatedTier : t);
    setTiers(newTiers);
    setEditingTier(null);
    try {
      await setDoc(doc(db, "loyalty", "config"), { tiers: newTiers }, { merge: true });
      showToast(`${updatedTier.name} tier updated in Cloud!`);
    } catch (err) {
      showToast("Sync Failed: Check permissions");
    }
  };

  const handleGlobalSync = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "loyalty", "config"), { tiers, updatedAt: Date.now() }, { merge: true });
      showToast("All tiers synchronized with live app.");
    } catch (err) {
      showToast("Global Sync Failed");
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <Award size={18} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Loyalty Engine</span>
           </div>
           <h2 className="text-3xl font-black text-foreground tracking-tighter leading-tight">Membership Tiers</h2>
           <p className="text-muted-foreground font-medium mt-1 text-sm">Configure automated discount thresholds and VIP benefit packages.</p>
        </div>
        <button 
          onClick={handleGlobalSync}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-black text-[11px] uppercase tracking-widest shadow-md hover:opacity-90 transition-all active:scale-95"
        >
           {isSaving ? "Syncing..." : <><Save size={16} /> Sync to App</>}
        </button>
      </div>

      {/* 2. Tier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {tiers.map((tier) => (
           <div key={tier.id} className="bg-card rounded-xl border border-border shadow-sm flex flex-col hover:border-primary/20 transition-all group overflow-hidden">
              <div className="p-8 border-b border-border/50 bg-muted/5">
                 <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 ${tier.bg} rounded-xl border border-border/10 shadow-sm ${tier.color}`}>
                       <tier.icon size={28} />
                    </div>
                    <button 
                      onClick={() => setEditingTier({...tier})}
                      className="p-2 bg-secondary text-muted-foreground rounded-lg border border-border hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90"
                    >
                       <Settings size={18} />
                    </button>
                 </div>
                 <div className="flex justify-between items-end">
                    <div>
                       <h3 className="text-2xl font-black text-foreground tracking-tighter leading-none">{tier.name}</h3>
                       <p className="text-muted-foreground font-black text-[9px] uppercase tracking-widest mt-2">ID: {tier.id.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 leading-none">Threshold</p>
                       <p className="text-2xl font-black text-foreground tracking-tighter">₹{tier.threshold}+</p>
                    </div>
                 </div>
              </div>
              
              <div className="p-8 space-y-6 flex-1">
                 <div className="space-y-4">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-0.5">Active Benefits</p>
                    <div className="space-y-3">
                       {tier.benefits.map((benefit, i) => (
                         <div key={i} className="flex items-center gap-3 group/item">
                            <div className="w-5 h-5 bg-green-50 rounded-md flex items-center justify-center text-green-500 border border-green-100 shadow-sm group-hover/item:scale-110 transition-transform">
                               <CheckCircle2 size={10} />
                            </div>
                            <span className="text-[13px] font-medium text-foreground tracking-tight">{benefit}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="pt-6 border-t border-border/50 mt-auto">
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 leading-none">Global Discount</p>
                          <p className="text-3xl font-black text-primary tracking-tighter">{tier.discount}%</p>
                       </div>
                       <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full border border-border">
                          <Users size={12} className="text-muted-foreground" />
                          <span className="text-[10px] font-black uppercase tracking-widest">1.2K Users</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* 3. Analytics Insight */}
      <div className="bg-foreground rounded-xl p-10 text-white relative overflow-hidden group shadow-sm border border-border/10">
         <div className="absolute top-[-20%] right-[-10%] opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
            <Flame size={200} />
         </div>
         <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 text-center lg:text-left">
               <h4 className="text-2xl font-black tracking-tighter">Gamification Insight</h4>
               <p className="text-white/50 text-[14px] font-medium leading-relaxed max-w-lg">
                  Tier migration analysis shows <span className="text-white">Gold members</span> who receive a "Diamond Sneak-Peek" are 42% more likely to reach the threshold within 30 days.
               </p>
            </div>
            <button className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg font-black text-[11px] uppercase tracking-widest shadow-sm hover:opacity-90 transition-all active:scale-95">
               Launch Retention Campaign <ChevronRight size={14} />
            </button>
         </div>
      </div>

      {/* TIER EDIT MODAL */}
      {editingTier && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setEditingTier(null)} />
           <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-8 py-6 border-b border-border bg-muted/10 flex items-center justify-between">
                 <div>
                    <span className={`text-[10px] font-black ${editingTier.color} uppercase tracking-widest bg-current/5 px-2 py-0.5 rounded-full border border-current/10 mb-2 inline-block`}>Tier Configuration</span>
                    <h3 className="text-xl font-black text-foreground tracking-tighter">Configure {editingTier.name} Level</h3>
                 </div>
                 <button onClick={() => setEditingTier(null)} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
              </div>
              
              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 {/* Range Configuration */}
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Price Range / Threshold (₹)</label>
                       <input 
                         type="number" 
                         value={editingTier.threshold} 
                         onChange={(e) => setEditingTier({...editingTier, threshold: parseInt(e.target.value)})}
                         className="w-full px-4 py-3 bg-muted/30 border border-input rounded-lg text-[13px] font-bold focus:border-primary outline-none transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Global Discount (%)</label>
                       <input 
                         type="number" 
                         value={editingTier.discount} 
                         onChange={(e) => setEditingTier({...editingTier, discount: parseInt(e.target.value)})}
                         className="w-full px-4 py-3 bg-muted/30 border border-input rounded-lg text-[13px] font-bold focus:border-primary outline-none transition-all" 
                       />
                    </div>
                 </div>

                 {/* Benefits Management */}
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Member Benefits</label>
                       <button 
                         onClick={() => setEditingTier({...editingTier, benefits: [...editingTier.benefits, 'New Benefit Item']})}
                         className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline"
                       >
                          <PlusCircle size={12} /> Add Benefit
                       </button>
                    </div>
                    <div className="space-y-3">
                       {editingTier.benefits.map((benefit: string, i: number) => (
                         <div key={i} className="flex items-center gap-3">
                            <div className="flex-1 relative">
                               <input 
                                 type="text" 
                                 value={benefit} 
                                 onChange={(e) => {
                                   const newBenefits = [...editingTier.benefits];
                                   newBenefits[i] = e.target.value;
                                   setEditingTier({...editingTier, benefits: newBenefits});
                                 }}
                                 className="w-full px-4 py-3 bg-muted/30 border border-input rounded-lg text-[13px] font-bold focus:border-primary outline-none transition-all pr-10" 
                               />
                               <CheckCircle2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 opacity-50" />
                            </div>
                            <button 
                              onClick={() => {
                                const newBenefits = editingTier.benefits.filter((_: any, idx: number) => idx !== i);
                                setEditingTier({...editingTier, benefits: newBenefits});
                              }}
                              className="p-3 text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all"
                            >
                               <Trash2 size={16} />
                            </button>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="px-8 py-6 bg-muted/10 border-t border-border flex justify-end gap-3">
                 <button onClick={() => setEditingTier(null)} className="px-6 py-3 bg-secondary text-foreground border border-border rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-muted transition-all">Cancel</button>
                 <button onClick={() => handleUpdateTier(editingTier)} className="px-8 py-3 bg-primary text-white rounded-lg text-[11px] font-black uppercase tracking-widest shadow-md shadow-primary/20 hover:opacity-90 transition-all">Save Changes</button>
              </div>
           </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[600] bg-foreground text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 border border-white/10">
           <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-500">
              <CheckCircle2 size={14} />
           </div>
           <p className="text-[13px] font-black tracking-tight">{toast}</p>
        </div>
      )}

    </div>
  );
}
