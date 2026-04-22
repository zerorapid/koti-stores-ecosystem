"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Leaf, 
  Sparkles, 
  MapPin,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  ArrowUpDown,
  Calendar,
  Layers,
  Info,
  Tag,
  Truck,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Image as ImageIcon,
  Flame,
  Star,
  TrendingUp,
  Percent,
  X,
  Package,
  Save,
  Loader2,
  FileText,
  PlusCircle,
  MinusCircle,
  BellRing
} from "lucide-react";
import { db } from "@/lib/koti-firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  query,
  orderBy,
  limit
} from "firebase/firestore";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [globalDiscount, setGlobalDiscount] = useState(30);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // 1. Products Listener
    const q = query(collection(db, "products"), orderBy("name"));
    const unsubProducts = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });

    // 2. Categories Listener
    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      setCategories(snapshot.docs.map(doc => doc.data().name || doc.id));
    });

    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  // Real-time Order Monitor
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty && !snapshot.metadata.hasPendingWrites) {
        setNewOrderAlert(true);
        // Reset alert after 5 seconds
        setTimeout(() => setNewOrderAlert(false), 5000);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        showToast("Listing removed from Cloud Database.");
      } catch (e) {
        showToast("Failed to delete from Cloud");
      }
    }
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      if (editingProduct) {
        const productRef = doc(db, "products", editingProduct.id);
        await updateDoc(productRef, productData);
        showToast(`${productData.name} updated in Cloud!`);
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: Date.now()
        });
        showToast(`${productData.name} pushed to Cloud!`);
      }
    } catch (e) {
      showToast("Cloud Save Failed: " + (e as Error).message);
    }
    setIsEditorOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <Package size={18} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Global Catalog</span>
           </div>
           <h2 className="text-3xl font-black text-foreground tracking-tighter leading-tight">Inventory Intelligence</h2>
           <p className="text-muted-foreground font-medium mt-1 text-sm">Managing {products.length} synchronized SKUs with advanced meta-tagging.</p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => showToast("Exporting catalog to CSV...")} className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all shadow-sm">
              <Download size={14} /> Export
           </button>
           <div className="flex items-center gap-3">
             {newOrderAlert && (
               <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg animate-bounce shadow-lg">
                  <BellRing size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">New Order Received!</span>
               </div>
             )}
             <button 
               onClick={() => { setEditingProduct(null); setIsEditorOpen(true); }}
               className="bg-primary text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
             >
                <PlusCircle size={18} /> Add New SKU
             </button>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard label="Total Valuation" value="₹12.4L" trend="+2.4%" icon={TrendingUp} />
         <StatCard label="Low Stock SKUs" value={products.filter(p => p.stock < 20).length} trend="Critical" icon={AlertTriangle} isCritical />
         <StatCard label="Organic Mix" value="62%" trend="+4%" icon={Leaf} color="text-green-600" />
         <StatCard label="Catalog Health" value="98%" trend="Optimal" icon={ShieldCheck} />
      </div>

      {/* 3. Control Bar */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
         <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex-1 min-w-[300px] relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
               <input 
                 type="text" 
                 placeholder="Search products by SKU, name or category..." 
                 className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-input rounded-lg text-sm font-bold outline-none focus:border-primary transition-all placeholder:text-muted-foreground/30"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            
            <div className="flex items-center gap-6 bg-muted/20 px-6 py-3 rounded-xl border border-border/50">
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Global Promo Control</p>
                  <div className="flex items-center gap-3">
                     <input 
                       type="range" min="0" max="60" value={globalDiscount} 
                       onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                       className="w-32 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                     />
                     <span className="text-sm font-black text-primary">{globalDiscount}% OFF</span>
                  </div>
               </div>
               <div className="h-8 w-px bg-border/50" />
               <div className="text-right">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Status</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${globalDiscount > 30 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600 uppercase tracking-widest'}`}>
                     {globalDiscount > 30 ? 'Aggressive Growth' : 'Baseline active'}
                  </span>
               </div>
            </div>
         </div>
      </div>

      {/* 4. Product Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-muted/30 border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <th className="px-8 py-5">Product Info</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Stock</th>
                  <th className="px-8 py-5 text-right">Price</th>
                  <th className="px-8 py-5 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
               {filteredProducts.map((p) => (
                 <tr key={p.id} className="hover:bg-secondary/50 transition-colors group">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden border border-border flex-shrink-0 shadow-sm relative">
                             <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                             {p.labels?.includes('Organic') && (
                               <div className="absolute bottom-0 right-0 p-0.5 bg-green-500 text-white rounded-tl-md">
                                  <Leaf size={8} />
                               </div>
                             )}
                          </div>
                          <div>
                             <div className="flex items-center gap-2">
                                <p className="text-[13px] font-black text-foreground leading-tight tracking-tight">{p.name}</p>
                                {p.images && p.images.length > 1 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 text-[8px] font-black uppercase leading-none">
                                     <ImageIcon size={8} /> {p.images.length}
                                  </span>
                                )}
                             </div>
                             <div className="flex gap-1 mt-1">
                                {p.labels?.map((l: string) => (
                                  <span key={l} className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-primary/10 text-primary rounded border border-primary/10 leading-none">
                                     {l}
                                  </span>
                                ))}
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/50 px-2 py-1 rounded border border-border/20">
                          {p.category}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                         p.status === 'In Stock' ? 'bg-green-50 text-green-600 border-green-100 shadow-sm' :
                         p.status === 'Low Stock' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' :
                         'bg-red-50 text-red-600 border-red-100'
                       }`}>
                          {p.status}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <p className={`text-[13px] font-black ${p.stock < 20 ? 'text-red-500' : 'text-foreground'}`}>{p.stock}</p>
                       <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 leading-none">Units</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <p className="text-[13px] font-black text-foreground">₹{p.price}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setEditingProduct(p); setIsEditorOpen(true); }}
                            className="p-2 bg-secondary text-muted-foreground rounded-lg border border-border hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90"
                          >
                             <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)}
                            className="p-2 bg-secondary text-muted-foreground rounded-lg border border-border hover:bg-red-50 hover:text-red-500 transition-all shadow-sm active:scale-90"
                          >
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* 5. Expanded Product Editor Modal */}
      {isEditorOpen && (
        <ProductEditor 
          product={editingProduct} 
          categories={categories}
          onClose={() => setIsEditorOpen(false)} 
          onSave={handleSaveProduct} 
        />
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

function ProductEditor({ product, categories, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: product?.category || (categories.length > 0 ? categories[0] : "General"),
    status: product?.status || "In Stock",
    stock: product?.stock || 0,
    price: product?.price || 0,
    description: product?.description || "",
    images: product?.images || [product?.img || ""],
    labels: product?.labels || []
  });

  const toggleLabel = (label: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.includes(label) 
        ? prev.labels.filter((l: string) => l !== label)
        : [...prev.labels, label]
    }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ""] }));
  };

  const updateImage = (index: number, val: string) => {
    const newImages = [...formData.images];
    newImages[index] = val;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
       <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
       <div className="relative w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden my-auto animate-in slide-in-from-bottom-4 duration-300">
          <div className="px-8 py-6 border-b border-border bg-muted/10 flex items-center justify-between">
             <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 mb-2 inline-block">Advanced Catalog Logic</span>
                <h3 className="text-xl font-black text-foreground tracking-tighter">
                   {product ? `Edit ${product.name}` : '✨ Create Master Listing'}
                </h3>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
          </div>
          
          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
             {/* Core Info */}
             <div className="grid grid-cols-2 gap-6">
                <FormItem label="Product Name" value={formData.name} onChange={(v:any) => setFormData({...formData, name: v})} placeholder="e.g., Organic Bananas" colSpan={2} />
                <FormItem label="Category" type="select" value={formData.category} onChange={(v:any) => setFormData({...formData, category: v})} options={categories.length > 0 ? categories : ['Loading...']} />
                <FormItem label="Stock Availability" type="select" value={formData.status} onChange={(v:any) => setFormData({...formData, status: v})} options={['In Stock', 'Low Stock', 'Out of Stock']} />
                <FormItem label="Inventory Stock (Units)" type="number" value={formData.stock} onChange={(v:any) => setFormData({...formData, stock: parseInt(v)})} />
                <FormItem label="Unit Price (₹)" type="number" value={formData.price} onChange={(v:any) => setFormData({...formData, price: parseInt(v)})} />
             </div>
             
             {/* Profit Margin Calculator */}
             <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Profitability Simulator</p>
                      <h4 className="text-sm font-black text-foreground">30% Flat Discount Model</h4>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Net Selling Price</p>
                      <p className="text-2xl font-black text-primary tracking-tighter">₹{Math.round(formData.price * 0.7)}</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Est. Purchase Cost (₹)</label>
                      <input 
                         type="number" 
                         placeholder="Wholesale price..."
                         className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-[13px] font-bold focus:border-primary outline-none transition-all shadow-sm"
                         onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                      />
                   </div>
                   <div className="flex items-center justify-end">
                      {formData.costPrice > 0 && (
                        <div className="text-right">
                           <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Net Margin</p>
                           <p className={`text-lg font-black ${(formData.price * 0.7) - formData.costPrice > 0 ? 'text-green-600' : 'text-red-500'}`}>
                              ₹{Math.round((formData.price * 0.7) - formData.costPrice)}
                              <span className="text-[10px] ml-1 opacity-60">({Math.round((((formData.price * 0.7) - formData.costPrice) / (formData.price * 0.7)) * 100)}%)</span>
                           </p>
                        </div>
                      )}
                   </div>
                </div>
             </div>

             {/* Description */}
             <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                   <FileText size={12} className="text-primary" /> Product Description
                </label>
                <textarea 
                   value={formData.description}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
                   placeholder="Enter detailed product description, nutritional facts, or procurement details..."
                   className="w-full px-4 py-3 bg-muted/20 border border-input rounded-lg text-[13px] font-bold focus:border-primary outline-none transition-all h-24 resize-none placeholder:text-muted-foreground/30"
                />
             </div>

             {/* Meta Labels */}
             <div className="space-y-4">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Meta-Tags & Badges</label>
                <div className="flex flex-wrap gap-2">
                   {['Fast Selling', 'Most Popular', 'Organic', 'New Arrival', 'Best Seller', 'Locally Sourced'].map(label => (
                     <button 
                       key={label}
                       onClick={() => toggleLabel(label)}
                       className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                         formData.labels.includes(label) 
                           ? 'bg-primary text-white border-primary shadow-md' 
                           : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/30'
                       }`}
                     >
                        {label}
                     </button>
                   ))}
                </div>
             </div>

             {/* Multi-Image Manager */}
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Product Media Gallery (URLs)</label>
                   <button onClick={addImageField} className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline">
                      <PlusCircle size={12} /> Add Image Slot
                   </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {formData.images.map((img: string, idx: number) => (
                     <div key={idx} className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-muted rounded-lg border border-border flex-shrink-0 overflow-hidden shadow-sm">
                           {img ? <img src={img} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="m-3.5 opacity-10" />}
                        </div>
                        <input 
                           type="text" 
                           placeholder="https://cdn.koti.in/assets/..."
                           value={img}
                           onChange={(e) => updateImage(idx, e.target.value)}
                           className="flex-1 px-4 py-3 bg-muted/20 border border-input rounded-lg text-[13px] font-bold focus:border-primary outline-none transition-all" 
                        />
                        {idx > 0 && (
                          <button onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_: string, i: number) => i !== idx) }))} className="p-3 text-red-500 hover:bg-red-50 rounded-lg">
                             <Trash2 size={16} />
                          </button>
                        )}
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="px-8 py-6 bg-muted/10 border-t border-border flex justify-end gap-3">
             <button onClick={onClose} className="px-6 py-3 bg-secondary text-foreground border border-border rounded-lg text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-muted transition-all">Cancel</button>
             <button 
               onClick={() => onSave({
                 ...formData,
                 img: formData.images[0] || 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=200&h=200&fit=crop',
                 type: formData.labels // Keep 'type' for compatibility with table view if needed
               })}
               className="px-8 py-3 bg-primary text-white rounded-lg text-[11px] font-black uppercase tracking-widest shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
             >
                <Save size={16} /> Finalize Listing
             </button>
          </div>
       </div>
    </div>
  );
}

function StatCard({ label, value, trend, icon: Icon, isCritical = false, color = "text-primary" }: any) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between h-32 hover:border-primary/20 transition-all group">
       <div className="flex justify-between items-start">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">{label}</p>
          <div className={`p-2 bg-muted rounded-lg ${color} shadow-sm border border-border/10 group-hover:scale-110 transition-transform`}>
             <Icon size={16} />
          </div>
       </div>
       <div className="flex items-end justify-between">
          <p className="text-2xl font-black text-foreground tracking-tighter leading-none">{value}</p>
          <p className={`text-[9px] font-black uppercase tracking-widest ${isCritical ? 'text-red-500' : 'text-green-500'} bg-muted px-2 py-0.5 rounded border border-border/50`}>{trend}</p>
       </div>
    </div>
  );
}

function FormItem({ label, placeholder, type = "text", options = [], colSpan = 1, value, onChange }: any) {
  return (
    <div className={`space-y-2 ${colSpan === 2 ? 'col-span-2' : ''}`}>
       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
       {type === 'select' ? (
         <select 
           value={value} 
           onChange={(e) => onChange(e.target.value)}
           className="w-full px-4 py-3 bg-muted/20 border border-input rounded-lg text-[13px] font-bold outline-none focus:border-primary transition-all appearance-none"
         >
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
         </select>
       ) : (
         <input 
           type={type} 
           placeholder={placeholder} 
           value={value}
           onChange={(e) => onChange(e.target.value)}
           className="w-full px-4 py-3 bg-muted/20 border border-input rounded-lg text-[13px] font-bold focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30" 
         />
       )}
    </div>
  );
}
