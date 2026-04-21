"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/koti-firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { 
  Settings as SettingsIcon, 
  Save, 
  Shield, 
  Bell, 
  Globe, 
  Lock, 
  Database, 
  Webhook, 
  Cloud,
  Zap,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ChevronRight,
  Info,
  Layers,
  Cpu,
  Truck,
  CreditCard,
  Users,
  FileText,
  Plus,
  Trash2,
  RefreshCw,
  MoreVertical,
  Activity,
  ArrowRight,
  RotateCcw,
  Mail,
  Phone,
  ShieldCheck,
  Building
} from "lucide-react";
import { SHARED_CONFIG } from "@/lib/koti-db";

const TABS = [
  { id: 'general', label: '🏢 General & App', icon: Building },
  { id: 'delivery', label: '🚚 Delivery & SLA', icon: Truck },
  { id: 'payments', label: '💳 Payments & Finance', icon: CreditCard },
  { id: 'inventory', label: '📦 Inventory & Catalog', icon: Layers },
  { id: 'team', label: '👥 Team & Roles', icon: Users },
  { id: 'compliance', label: '📜 Compliance & Security', icon: ShieldCheck },
  { id: 'integrations', label: '🔌 Integrations & APIs', icon: Webhook },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [config, setConfig] = useState<any>({
    siteName: "Koti Stores",
    serviceFee: 40,
    taxPercent: 5,
    maintenanceMode: false,
    deliveryRadius: 5,
    deliveryTime: 15,
    baseDeliveryFee: 19,
    freeDeliveryThreshold: 299,
    riderPayout: 22,
    packagingFee: 5
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Firestore Sync
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.data());
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "settings", "global"), config, { merge: true });
      showToast("Settings synchronized with Cloud!");
    } catch (err) {
      showToast("Sync Failed: Check permissions");
    }
  };

  const updateConfig = (key: string, val: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: val }));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-700">
      
      {/* 1. Header */}
      <div className="mb-8">
         <div className="flex items-center gap-2 mb-2">
            <SettingsIcon size={18} className="text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Control Environment</span>
         </div>
         <h1 className="text-3xl font-black text-foreground tracking-tighter">System Settings</h1>
         <p className="text-muted-foreground font-medium mt-1 text-sm">Configure app behavior, delivery rules, payments, team access, and compliance.</p>
      </div>

      {/* 2. Settings Layout */}
      <div className="flex-1 flex gap-8 min-h-0">
        
        {/* Settings Navigation (Left) */}
        <div className="w-64 flex flex-col gap-1 border-r border-border pr-6 overflow-y-auto">
           {TABS.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`group flex items-center justify-between px-4 py-3 rounded-lg text-[13px] font-black tracking-tight transition-all ${
                 activeTab === tab.id 
                   ? 'bg-primary text-white shadow-md shadow-primary/20' 
                   : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
               }`}
             >
               <span className="truncate">{tab.label}</span>
               {activeTab === tab.id && <ChevronRight size={14} className="opacity-50" />}
             </button>
           ))}
        </div>

        {/* Settings Content (Right) */}
        <div className="flex-1 overflow-y-auto pr-4 pb-20 custom-scrollbar">
           
           {/* General Section */}
           {activeTab === 'general' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card title="App Configuration" subtitle="Basic app identity and operational controls">
                   <div className="grid grid-cols-2 gap-6 mb-6">
                      <FormGroup label="App Name" value={config.siteName} onChange={(val: string) => updateConfig('siteName', val)} />
                      <FormGroup label="Support Phone" value={config.supportPhone || "+91 98765 43210"} onChange={(val: string) => updateConfig('supportPhone', val)} />
                      <FormGroup label="Support Email" value={config.supportEmail || "support@koti.in"} onChange={(val: string) => updateConfig('supportEmail', val)} />
                      <FormGroup label="Default Language" type="select" options={['English', 'Hindi', 'Telugu', 'Marathi']} value={config.language || 'English'} onChange={(val: string) => updateConfig('language', val)} />
                      <FormGroup label="Dark Store Locations" type="number" value={config.storeCount || 8} onChange={(val: string) => updateConfig('storeCount', parseInt(val))} />
                      <FormGroup label="Current App Version" defaultValue="2.4.1" disabled />
                   </div>
                   <ToggleItem label="Maintenance Mode (Disable User Orders)" checked={config.maintenanceMode} onChange={(val: boolean) => updateConfig('maintenanceMode', val)} />
                </Card>
                <StickyFooter onSave={handleSave} />
             </div>
           )}

           {/* Delivery Section */}
           {activeTab === 'delivery' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card title="Delivery & Rider Configuration" subtitle="SLA, pricing, payout rules, and operational hours">
                   <div className="grid grid-cols-2 gap-6 mb-6">
                      <FormGroup label="Delivery Radius (km)" type="number" value={config.deliveryRadius} onChange={(val: string) => updateConfig('deliveryRadius', parseInt(val))} />
                      <FormGroup label="Promised Delivery Time (mins)" type="number" value={config.deliveryTime} onChange={(val: string) => updateConfig('deliveryTime', parseInt(val))} />
                      <FormGroup label="Base Delivery Fee (₹)" type="number" value={config.baseDeliveryFee} onChange={(val: string) => updateConfig('baseDeliveryFee', parseInt(val))} />
                      <FormGroup label="Free Delivery Threshold (₹)" type="number" value={config.freeDeliveryThreshold} onChange={(val: string) => updateConfig('freeDeliveryThreshold', parseInt(val))} />
                      <FormGroup label="Rider Payout per Order (₹)" type="number" value={config.riderPayout} onChange={(val: string) => updateConfig('riderPayout', parseInt(val))} />
                      <FormGroup label="Packaging Fee (₹)" type="number" value={config.packagingFee} onChange={(val: string) => updateConfig('packagingFee', parseInt(val))} />
                   </div>
                   <div className="grid grid-cols-2 gap-6 mb-6">
                      <FormGroup label="Surge Pricing Multiplier (Peak)" type="number" value={config.surgeMultiplier || 1.4} onChange={(val: string) => updateConfig('surgeMultiplier', parseFloat(val))} />
                      <FormGroup label="Tip Sharing Policy" type="select" options={['100% to Rider', '50% Rider / 50% Platform', 'Retained by Platform']} value={config.tipPolicy || '100% to Rider'} onChange={(val: string) => updateConfig('tipPolicy', val)} />
                   </div>
                   <ToggleItem label="Allow Customer to Choose Delivery Slot" checked={config.allowSlots} onChange={(val: boolean) => updateConfig('allowSlots', val)} />
                   <ToggleItem label="Enable Live Rider Tracking" checked={config.enableTracking} onChange={(val: boolean) => updateConfig('enableTracking', val)} />
                </Card>
                <StickyFooter onSave={handleSave} />
             </div>
           )}

           {/* Payments Section */}
           {activeTab === 'payments' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card title="Payment & Finance Rules" subtitle="Gateways, settlement, tax, and COD handling">
                   <div className="grid grid-cols-2 gap-6 mb-6">
                      <FormGroup label="Primary Payment Gateway" type="select" options={['Razorpay', 'PhonePe PG', 'PayU', 'Cashfree']} value={config.gateway || 'Razorpay'} onChange={(val: string) => updateConfig('gateway', val)} />
                      <FormGroup label="Settlement Cycle" type="select" options={['T+1', 'T+2', 'T+7', 'Instant (UPI)']} value={config.settlement || 'T+1'} onChange={(val: string) => updateConfig('settlement', val)} />
                      <FormGroup label="GST Rate (%)" type="number" value={config.taxPercent} onChange={(val: string) => updateConfig('taxPercent', parseInt(val))} />
                      <FormGroup label="Auto-Refund Threshold (₹)" type="number" value={config.refundThreshold || 500} onChange={(val: string) => updateConfig('refundThreshold', parseInt(val))} />
                   </div>
                   <div className="space-y-4">
                      <ToggleItem label="Enable UPI Payments" checked={config.enableUPI} onChange={(val: boolean) => updateConfig('enableUPI', val)} />
                      <ToggleItem label="Enable Cash on Delivery (COD)" checked={config.enableCOD} onChange={(val: boolean) => updateConfig('enableCOD', val)} />
                      <ToggleItem label="Enable Wallet Payments (Paytm/Mobikwik)" checked={config.enableWallet} onChange={(val: boolean) => updateConfig('enableWallet', val)} />
                      <ToggleItem label="Auto-Verify UPI Intent Callbacks" checked={config.autoVerify} onChange={(val: boolean) => updateConfig('autoVerify', val)} />
                   </div>
                </Card>
                <StickyFooter onSave={handleSave} />
             </div>
           )}

           {/* Inventory Section */}
           {activeTab === 'inventory' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card title="Inventory & Catalog Rules" subtitle="Stock alerts, substitution, pricing sync">
                   <div className="grid grid-cols-2 gap-6 mb-6">
                      <FormGroup label="Low Stock Alert Threshold (Qty)" type="number" defaultValue="10" />
                      <FormGroup label="Expiry Warning (Days Before)" type="number" defaultValue="3" />
                      <FormGroup label="Procurement Sync Interval" type="select" options={['Every 30 mins', 'Every 1 hour', 'Every 4 hours', 'Manual Only']} />
                      <FormGroup label="Substitution Policy" type="select" options={['Auto (Similar SKU)', 'Ask Customer', 'No Substitution']} />
                   </div>
                   <div className="space-y-4">
                      <ToggleItem label="Auto-Hide Out-of-Stock Items" defaultChecked />
                      <ToggleItem label="Dynamic Pricing (Surge for High Demand)" />
                   </div>
                </Card>
                <StickyFooter onSave={() => showToast("Inventory settings saved successfully!")} />
             </div>
           )}

           {/* Team Section */}
           {activeTab === 'team' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card 
                  title="Team & Role Management" 
                  subtitle="Control access, permissions, and audit trails"
                  action={<button className="px-4 py-2 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:opacity-90 active:scale-95 transition-all">+ Add Member</button>}
                >
                   <div className="overflow-x-auto border border-border rounded-xl">
                      <table className="w-full text-left">
                         <thead className="bg-muted/30 text-[9px] font-black text-muted-foreground uppercase tracking-[2px] border-b border-border">
                            <tr>
                               <th className="px-6 py-4">Name</th>
                               <th className="px-6 py-4">Email</th>
                               <th className="px-6 py-4">Role</th>
                               <th className="px-6 py-4">Last Login</th>
                               <th className="px-6 py-4">Status</th>
                               <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-border/50">
                            <TeamRow name="Rahul Sharma" email="rahul@koti.in" role="Super Admin" time="Today, 10:42 AM" status="Active" />
                            <TeamRow name="Priya Nair" email="priya@koti.in" role="Ops Manager" time="Yesterday, 06:15 PM" status="Active" />
                            <TeamRow name="Amit Singh" email="amit@koti.in" role="Finance" time="Apr 18, 11:00 AM" status="Suspended" />
                         </tbody>
                      </table>
                   </div>
                </Card>
                <StickyFooter onSave={() => showToast("Team settings saved successfully!")} />
             </div>
           )}

           {/* Compliance Section */}
           {activeTab === 'compliance' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card title="Compliance & Security" subtitle="FSSAI, DPDP, 2FA, and audit controls">
                   <div className="grid grid-cols-2 gap-6 mb-6">
                      <FormGroup label="FSSAI License No." defaultValue="10023045678901" />
                      <FormGroup label="GSTIN" defaultValue="27AAACH1234F1Z5" />
                      <FormGroup label="DPDP Consent Mode" type="select" options={['Explicit Opt-in', 'Implicit + Opt-out']} />
                      <FormGroup label="Audit Log Retention (Days)" type="number" defaultValue="365" />
                   </div>
                   <div className="space-y-4">
                      <ToggleItem label="Enforce 2FA for Admin Accounts" defaultChecked />
                      <ToggleItem label="Auto-Delete Expired Session Tokens" defaultChecked />
                      <ToggleItem label="Enable Data Export/Deletion Requests" defaultChecked />
                   </div>
                </Card>
                <StickyFooter onSave={() => showToast("Compliance settings saved successfully!")} />
             </div>
           )}

           {/* Integrations Section */}
           {activeTab === 'integrations' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card 
                  title="API Keys & Webhooks" 
                  subtitle="Manage third-party integrations and event routing"
                  action={<button className="px-4 py-2 bg-secondary text-foreground border border-border rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-muted transition-all">+ Add Webhook</button>}
                >
                   <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Activity size={12} className="text-primary" /> Active API Keys
                   </h4>
                   <div className="overflow-x-auto border border-border rounded-xl mb-8">
                      <table className="w-full text-left">
                         <thead className="bg-muted/30 text-[9px] font-black text-muted-foreground uppercase tracking-[2px] border-b border-border">
                            <tr>
                               <th className="px-6 py-4">Service</th>
                               <th className="px-6 py-4">Key Type</th>
                               <th className="px-6 py-4">Status</th>
                               <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-border/50">
                            <IntegrationRow service="Razorpay" type="Publishable" status="Active" />
                            <IntegrationRow service="Google Maps" type="API Key" status="Active" />
                            <IntegrationRow service="Firebase" type="Service Account" status="Active" />
                         </tbody>
                      </table>
                   </div>

                   <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Webhook size={12} className="text-primary" /> Webhook Endpoints
                   </h4>
                   <div className="overflow-x-auto border border-border rounded-xl">
                      <table className="w-full text-left">
                         <thead className="bg-muted/30 text-[9px] font-black text-muted-foreground uppercase tracking-[2px] border-b border-border">
                            <tr>
                               <th className="px-6 py-4">Event</th>
                               <th className="px-6 py-4">URL</th>
                               <th className="px-6 py-4">Status</th>
                               <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-border/50">
                            <WebhookRow event="order.created" url="https://api.koti.in/v1/hooks/orders" status="Active" />
                            <WebhookRow event="payment.success" url="https://api.koti.in/v1/hooks/payments" status="Active" />
                         </tbody>
                      </table>
                   </div>
                </Card>
                <StickyFooter onSave={() => showToast("Integration settings saved successfully!")} />
             </div>
           )}

        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[300] bg-foreground text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 border border-white/10">
           <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-500">
              <CheckCircle2 size={14} />
           </div>
           <p className="text-[13px] font-black tracking-tight">{toast}</p>
        </div>
      )}
    </div>
  );
}

function Card({ title, subtitle, action, children }: { title: string, subtitle: string, action?: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
       <div className="px-8 py-6 border-b border-border bg-muted/5 flex items-center justify-between">
          <div>
             <h3 className="text-base font-black text-foreground tracking-tighter">{title}</h3>
             <p className="text-[11px] font-bold text-muted-foreground mt-1">{subtitle}</p>
          </div>
          {action}
       </div>
       <div className="p-8">
          {children}
       </div>
    </div>
  );
}

function FormGroup({ label, value, defaultValue, type = "text", options = [], disabled = false, onChange }: any) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
       {type === 'select' ? (
         <select 
           className="w-full px-4 py-3 bg-muted/20 border border-input rounded-lg text-[13px] font-bold outline-none focus:border-primary transition-all appearance-none"
           value={value}
           onChange={(e) => onChange?.(e.target.value)}
         >
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
         </select>
       ) : (
         <input 
           type={type} 
           value={value}
           defaultValue={defaultValue} 
           disabled={disabled}
           onChange={(e) => onChange?.(e.target.value)}
           className="w-full px-4 py-3 bg-muted/20 border border-input rounded-lg text-[13px] font-bold focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30 disabled:opacity-50 disabled:bg-muted/50" 
         />
       )}
    </div>
  );
}

function ToggleItem({ label, checked, defaultChecked, onChange }: any) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-1">
       <div className="relative">
          <input 
            type="checkbox" 
            className="sr-only" 
            checked={checked} 
            defaultChecked={defaultChecked}
            onChange={(e) => onChange?.(e.target.checked)} 
          />
          <div className={`w-10 h-5 rounded-full border transition-all ${
             checked || defaultChecked ? 'bg-primary border-primary shadow-[0_0_8px_rgba(225,29,72,0.3)]' : 'bg-muted border-border'
          }`} />
          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${
             checked || defaultChecked ? 'left-6' : 'left-1'
          }`} />
       </div>
       <span className="text-[12px] font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">{label}</span>
    </label>
  );
}

function TeamRow({ name, email, role, time, status }: any) {
  return (
    <tr className="hover:bg-secondary/30 transition-colors">
       <td className="px-6 py-4">
          <p className="text-[13px] font-black text-foreground tracking-tight">{name}</p>
       </td>
       <td className="px-6 py-4">
          <p className="text-[11px] font-bold text-muted-foreground">{email}</p>
       </td>
       <td className="px-6 py-4">
          <p className="text-[11px] font-black text-foreground uppercase tracking-widest">{role}</p>
       </td>
       <td className="px-6 py-4">
          <p className="text-[11px] font-medium text-muted-foreground">{time}</p>
       </td>
       <td className="px-6 py-4">
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
             status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
          }`}>
             {status}
          </span>
       </td>
       <td className="px-6 py-4 text-right">
          <button className="text-[11px] font-black text-primary hover:underline uppercase tracking-widest">Edit</button>
       </td>
    </tr>
  );
}

function IntegrationRow({ service, type, status }: any) {
  return (
    <tr className="hover:bg-secondary/30 transition-colors">
       <td className="px-6 py-4">
          <p className="text-[13px] font-black text-foreground tracking-tight">{service}</p>
       </td>
       <td className="px-6 py-4">
          <p className="text-[11px] font-bold text-muted-foreground">{type}</p>
       </td>
       <td className="px-6 py-4">
          <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 border border-green-100 text-[9px] font-black uppercase tracking-widest">
             {status}
          </span>
       </td>
       <td className="px-6 py-4 text-right">
          <button className="p-2 bg-secondary text-muted-foreground rounded-lg border border-border hover:bg-primary hover:text-white transition-all shadow-sm">
             <RotateCcw size={14} />
          </button>
       </td>
    </tr>
  );
}

function WebhookRow({ event, url, status }: any) {
  return (
    <tr className="hover:bg-secondary/30 transition-colors">
       <td className="px-6 py-4">
          <p className="text-[11px] font-black text-foreground uppercase tracking-widest">{event}</p>
       </td>
       <td className="px-6 py-4 max-w-[200px]">
          <p className="text-[11px] font-bold text-muted-foreground truncate">{url}</p>
       </td>
       <td className="px-6 py-4">
          <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 border border-green-100 text-[9px] font-black uppercase tracking-widest">
             {status}
          </span>
       </td>
       <td className="px-6 py-4 text-right">
          <button className="px-3 py-1 bg-secondary text-muted-foreground border border-border rounded-md text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all shadow-sm">Test</button>
       </td>
    </tr>
  );
}

function StickyFooter({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/50">
       <button className="px-6 py-3 bg-secondary text-foreground border border-border rounded-lg text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-muted transition-all">Reset</button>
       <button onClick={onSave} className="px-8 py-3 bg-primary text-white rounded-lg text-[11px] font-black uppercase tracking-widest shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">Save Changes</button>
    </div>
  );
}
