"use client";

import { useState, useEffect } from "react";
import { Ticket, Plus, Trash2, CheckCircle2, XCircle, Tag, Percent, Calendar } from "lucide-react";
import { db } from "@/lib/koti-firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: 20,
    type: "percentage", // or "fixed"
    minOrder: 500,
    isActive: true,
    expiry: "2026-12-31"
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "coupons"), (snapshot) => {
      setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleAddCoupon = async () => {
    if (!newCoupon.code) return;
    try {
      await addDoc(collection(db, "coupons"), {
        ...newCoupon,
        code: newCoupon.code.toUpperCase(),
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setNewCoupon({ code: "", discount: 20, type: "percentage", minOrder: 500, isActive: true, expiry: "2026-12-31" });
    } catch (err) {
      console.error("Error adding coupon:", err);
    }
  };

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "coupons", couponId), { isActive: !currentStatus });
  };

  const deleteCoupon = async (id: string) => {
    if (confirm("Delete this coupon?")) {
      await deleteDoc(doc(db, "coupons", id));
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <Ticket size={18} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Growth Engine</span>
           </div>
           <h2 className="text-3xl font-black text-foreground tracking-tighter">Promotions Hub</h2>
           <p className="text-muted-foreground font-medium mt-1 text-sm">Create and manage viral discount codes.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-primary text-white rounded-lg font-black text-[11px] uppercase tracking-widest shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {isAdding && (
        <div className="bg-card p-8 rounded-xl border border-primary/20 shadow-xl animate-in slide-in-from-top-4 duration-300">
           <h3 className="text-sm font-black uppercase tracking-widest mb-6">Create Promotional Code</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                 <label className="block text-[10px] font-black text-muted-foreground uppercase mb-2">Coupon Code</label>
                 <input 
                    className="w-full bg-muted/50 border border-border p-3 rounded-lg font-black text-primary uppercase"
                    placeholder="E.G. FRESH50"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value})}
                 />
              </div>
              <div>
                 <label className="block text-[10px] font-black text-muted-foreground uppercase mb-2">Discount (%)</label>
                 <input 
                    type="number"
                    className="w-full bg-muted/50 border border-border p-3 rounded-lg font-black"
                    value={newCoupon.discount}
                    onChange={(e) => setNewCoupon({...newCoupon, discount: parseInt(e.target.value)})}
                 />
              </div>
              <div>
                 <label className="block text-[10px] font-black text-muted-foreground uppercase mb-2">Min. Order (₹)</label>
                 <input 
                    type="number"
                    className="w-full bg-muted/50 border border-border p-3 rounded-lg font-black"
                    value={newCoupon.minOrder}
                    onChange={(e) => setNewCoupon({...newCoupon, minOrder: parseInt(e.target.value)})}
                 />
              </div>
           </div>
           <div className="flex gap-4">
              <button onClick={handleAddCoupon} className="px-8 py-3 bg-primary text-white rounded-lg font-black text-[10px] uppercase tracking-widest">Save Coupon</button>
              <button onClick={() => setIsAdding(false)} className="px-8 py-3 bg-muted text-foreground rounded-lg font-black text-[10px] uppercase tracking-widest">Cancel</button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div key={c.id} className="bg-card p-6 rounded-xl border border-border shadow-sm group hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-primary/5 rounded-lg text-primary">
                  <Tag size={20} />
               </div>
               <div className="flex gap-2">
                  <button onClick={() => toggleCouponStatus(c.id, c.isActive)} className="p-2 hover:bg-muted rounded-full transition-colors">
                     {c.isActive ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                  </button>
                  <button onClick={() => deleteCoupon(c.id)} className="p-2 hover:bg-red-50 rounded-full transition-colors">
                     <Trash2 size={16} className="text-red-500" />
                  </button>
               </div>
            </div>
            <h4 className="text-xl font-black tracking-tighter text-foreground mb-1">{c.code}</h4>
            <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
               <span className="flex items-center gap-1"><Percent size={12} /> {c.discount}% OFF</span>
               <span className="flex items-center gap-1"><Calendar size={12} /> DEC 2026</span>
            </div>
            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
               <span className="text-[10px] font-black text-muted-foreground uppercase">Min Order: ₹{c.minOrder}</span>
               <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${c.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {c.isActive ? 'Active' : 'Paused'}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
