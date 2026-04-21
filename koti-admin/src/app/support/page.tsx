"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/koti-firebase";
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { 
  Search, 
  MessageSquare, 
  User, 
  Clock, 
  Shield, 
  ChevronRight, 
  Send, 
  MoreVertical, 
  Filter, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Mail,
  History,
  Tag,
  Users,
  Webhook,
  AppWindow,
  Star, 
  Ticket as TicketIcon,
  X,
  Activity,
  ArrowUpRight,
  MapPin,
  Loader2,
  TrendingUp,
  Target,
  LifeBuoy
} from "lucide-react";
const QUICK_REPLIES = [
  "Checking with the rider now. Update in 2m.",
  "Initiated ₹50 wallet credit.",
  "Refund processed. Reflects in 24h.",
  "Escalating to store manager.",
  "SLA breach apology voucher sent."
];

export default function SupportConsole() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Firestore Sync - Tickets
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "support_tickets"), (snapshot) => {
      const ticketList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTickets(ticketList);
      if (!activeId && ticketList.length > 0) setActiveId(ticketList[0].id);
      setIsLoading(false);
    });
    return () => unsub();
  }, [activeId]);

  // Firestore Sync - Users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const userMap: Record<string, any> = {};
      snapshot.forEach(doc => { userMap[doc.id] = doc.data(); });
      setUsers(userMap);
    });
    return () => unsub();
  }, []);

  const activeTicket = tickets.find(t => t.id === activeId);
  const customer = activeTicket ? (users[activeTicket.userId] || { name: "Koti User", tier: "Silver" }) : { name: "No Active Ticket", tier: "Silver" };

  // --- SLA ENGINE ---
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets(prev => prev.map(t => {
        if (t.status === 'open' && (t.slaMin || 15) > -100) {
          return { ...t, slaMin: (t.slaMin || 15) - 0.1 };
        }
        return t;
      }));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTicket?.history, activeId]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || !activeId) return;
    const msg = { 
      from: "agent", 
      text, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };
    
    try {
      await updateDoc(doc(db, "support_tickets", activeId), {
        history: arrayUnion(msg),
        lastUpdated: Date.now()
      });
      if (text === input) setInput("");
    } catch (err) {
      console.error("Chat Failed:", err);
    }
  };

  const filteredTickets = tickets.filter(t => {
     if (filter === 'all') return true;
     if (filter === 'diamond') return users[t.userId]?.tier === 'Diamond';
     if (filter === 'critical') return t.priority === 'critical';
     if (filter === 'pending') return t.status === 'open' && !t.agent;
     return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-background animate-in fade-in duration-500">
      
      {/* 1. Header & Stats Bar (Combined for high-density) */}
      <div className="border border-border rounded-xl mb-6 bg-card shadow-sm overflow-hidden">
         <div className="px-8 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
               <LifeBuoy className="text-primary animate-pulse" size={20} />
               <h1 className="text-lg font-black text-foreground tracking-tighter">Support Console | Priority Routing</h1>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
               <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Agent: Vikram S. | Online</span>
            </div>
         </div>
         <div className="grid grid-cols-4 divide-x divide-border bg-muted/5">
            <StatItem label="Open Tickets" value={tickets.filter(t => t.status === 'open').length} />
            <StatItem label="Diamond Waiting" value={tickets.filter(t => users[t.userId]?.tier === 'Diamond' && t.status === 'open').length} color="text-amber-600" />
            <StatItem label="Avg Response" value="3.2m" />
            <StatItem label="SLA Hit Rate" value="94%" color="text-green-600" />
         </div>
      </div>

      {/* 2. Main Support Layout (3 Columns) */}
      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Column A: Ticket Queue (320px) */}
        <div className="w-80 flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden">
           <div className="p-4 border-b border-border bg-muted/20 flex gap-2 overflow-x-auto scrollbar-hide">
              <FilterBtn label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
              <FilterBtn label="⭐ Diamond" active={filter === 'diamond'} onClick={() => setFilter('diamond')} />
              <FilterBtn label="🔴 Critical" active={filter === 'critical'} onClick={() => setFilter('critical')} />
              <FilterBtn label="⏳ Pending" active={filter === 'pending'} onClick={() => setFilter('pending')} />
           </div>
           <div className="flex-1 overflow-y-auto divide-y divide-border/50">
              {filteredTickets.map(ticket => {
                 const cust = users[ticket.userId] || { name: "User", tier: "Silver" };
                 const isDiamond = cust.tier === 'Diamond';
                 const lastMsg = ticket.history?.slice(-1)[0]?.text || "No messages yet";
                 return (
                    <div 
                      key={ticket.id}
                      onClick={() => setActiveId(ticket.id)}
                      className={`p-5 cursor-pointer transition-all hover:bg-secondary/50 relative border-l-4 ${
                         activeId === ticket.id 
                           ? 'bg-secondary/80 border-primary' 
                           : isDiamond ? 'bg-amber-50/30 border-amber-400' : 'border-transparent'
                      }`}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                             ticket.priority === 'critical' ? 'bg-red-50 text-red-600 border-red-100' :
                             ticket.priority === 'high' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                             'bg-muted text-muted-foreground border-border'
                          }`}>
                             {ticket.priority}
                          </span>
                          <span className="text-[10px] font-black text-muted-foreground/50 tracking-widest">{ticket.id}</span>
                       </div>
                       <h3 className="text-[13px] font-black text-foreground tracking-tight truncate">
                          {isDiamond ? '⭐ ' : ''}{ticket.subject}
                       </h3>
                       <p className="text-[11px] font-medium text-muted-foreground truncate mt-1">
                          {lastMsg} • <span className="font-bold">{ticket.agent}</span>
                       </p>
                    </div>
                 );
              })}
           </div>
        </div>

        {/* Column B: Chat Interface (1fr) */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden">
           {/* Chat Header */}
           <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/5">
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center font-black text-primary border border-border shadow-sm">
                    {customer.name.charAt(0)}
                 </div>
                 <div>
                    <h2 className="text-[14px] font-black text-foreground tracking-tight">{customer.name}</h2>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                       {activeTicket?.id || "N/A"} <span className="w-1 h-1 bg-muted-foreground rounded-full"></span> {activeTicket?.priority || "Normal"}
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <ActionBtn label="Assign" icon={User} onClick={() => {}} />
                 <ActionBtn label="Escalate" icon={Zap} onClick={() => {}} />
                 <ActionBtn label="Resolve" icon={CheckCircle2} primary onClick={async () => {
                    if (activeId) {
                       await updateDoc(doc(db, "support_tickets", activeId), { status: 'closed', resolvedAt: Date.now() });
                    }
                 }} />
              </div>
           </div>

           {/* Chat Messages */}
           <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-secondary/5">
              {activeTicket?.history?.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.from === 'agent' ? 'justify-end' : msg.from === 'system' ? 'justify-center' : 'justify-start'}`}>
                   <div className={`msg max-w-[75%] p-4 rounded-xl text-[13px] leading-relaxed shadow-sm border ${
                      msg.from === 'agent' 
                        ? 'bg-primary text-white border-primary/10 rounded-br-none' 
                        : msg.from === 'system'
                        ? 'bg-muted/80 text-muted-foreground border-border text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full'
                        : 'bg-background text-foreground border-border rounded-bl-none'
                   }`}>
                      <p className="font-medium tracking-tight">{msg.text}</p>
                      {msg.from !== 'system' && (
                        <div className={`flex items-center gap-2 mt-2 ${msg.from === 'agent' ? 'justify-end' : ''}`}>
                           <span className={`text-[8px] font-black uppercase tracking-[1px] ${msg.from === 'agent' ? 'text-white/50' : 'text-muted-foreground'}`}>{msg.time}</span>
                           {msg.from === 'agent' && <CheckCircle2 size={10} className="text-white/40" />}
                        </div>
                      )}
                   </div>
                </div>
              ))}
              {!activeTicket && (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40">
                  <MessageSquare size={48} className="mb-4" />
                  <h3 className="text-lg font-black tracking-tighter">No Active Ticket</h3>
                  <p className="text-sm font-medium">Select a customer query from the queue to start responding.</p>
                </div>
              )}
              <div ref={chatEndRef} />
           </div>

           {/* Input Area */}
           <div className="p-6 border-t border-border bg-background">
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                 {QUICK_REPLIES.map((reply, i) => (
                   <button 
                     key={i} 
                     onClick={() => handleSend(reply)}
                     className="whitespace-nowrap px-4 py-1.5 bg-muted/40 border border-border rounded-full text-[9px] font-black text-muted-foreground hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all uppercase tracking-widest"
                   >
                     {reply}
                   </button>
                 ))}
              </div>
              <div className="flex gap-4">
                 <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Type mission response..." 
                    rows={2}
                    className="flex-1 px-5 py-3 bg-muted/20 border border-input rounded-xl text-[13px] font-bold focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30 resize-none" 
                 />
                 <button 
                   onClick={() => handleSend()}
                   className="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
                 >
                    <Send size={22} />
                 </button>
              </div>
           </div>
        </div>

        {/* Column C: Customer Intelligence (300px) */}
        <div className="w-[300px] flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-y-auto p-8">
           <div className="text-center mb-8 pb-8 border-b border-border/50">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-primary text-3xl font-black mx-auto mb-4 border border-border shadow-sm">
                 {customer.name.charAt(0)}
              </div>
              <h3 className="text-base font-black text-foreground tracking-tighter">{customer.name}</h3>
              <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                 customer.tier === 'Diamond' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-muted text-muted-foreground border border-border'
              }`}>
                 <Star size={10} className="fill-current" /> {customer.tier} User
              </div>
           </div>

           <div className="space-y-6">
              <div className="grid gap-4">
                 <InfoRow label="Phone" value={customer.phone || "No Phone"} />
                 <InfoRow label="Orders (LTV)" value={`${customer.orders || 0} (₹${(customer.totalSpent || 0).toLocaleString()})`} />
                 <InfoRow label="Joined" value={customer.join || "New User"} />
              </div>

              <div className="p-4 bg-muted/10 rounded-xl border border-border">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 leading-none">⏱️ Response SLA</p>
                 <p className={`text-2xl font-black tracking-tighter leading-none ${activeTicket?.slaMin < 5 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
                    {activeTicket?.slaMin > 0 ? `${Math.ceil(activeTicket.slaMin)}m` : 'READY'}
                 </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border/50">
                 <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">📝 Internal Agent Notes</h4>
                 <div className="space-y-2 max-h-40 overflow-y-auto">
                    {activeTicket?.notes?.map((n: string, i: number) => (
                      <div key={i} className="p-3 bg-secondary/50 rounded-lg text-[11px] font-medium text-foreground border border-border">
                         📝 {n}
                      </div>
                    ))}
                 </div>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add note..."
                      className="flex-1 px-3 py-2 bg-muted/30 border border-input rounded-lg text-[11px] outline-none focus:border-primary transition-all"
                      onKeyPress={async (e) => {
                         if (e.key === 'Enter' && activeId) {
                            const val = (e.target as HTMLInputElement).value;
                            if (val) {
                               await updateDoc(doc(db, "support_tickets", activeId), {
                                 notes: arrayUnion(val)
                               });
                               (e.target as HTMLInputElement).value = '';
                            }
                         }
                      }}
                    />
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

function StatItem({ label, value, color = "text-foreground" }: { label: string, value: any, color?: string }) {
  return (
    <div className="py-4 text-center">
       <p className={`text-xl font-black ${color} tracking-tighter leading-none mb-1.5`}>{value}</p>
       <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">{label}</p>
    </div>
  );
}

function FilterBtn({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
        active ? 'bg-primary text-white border-primary shadow-sm' : 'bg-background text-muted-foreground border-border hover:bg-muted'
      }`}
    >
       {label}
    </button>
  );
}

function ActionBtn({ label, icon: Icon, onClick, primary = false }: { label: string, icon: any, onClick: () => void, primary?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
        primary 
          ? 'bg-primary text-white border-primary shadow-sm hover:opacity-90' 
          : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted'
      }`}
    >
       <Icon size={12} /> {label}
    </button>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center px-1">
       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
       <span className="text-[12px] font-black text-foreground tracking-tight">{value}</span>
    </div>
  );
}
