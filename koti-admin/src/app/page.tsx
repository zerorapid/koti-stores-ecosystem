"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/koti-firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("admin@koti.in");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6 animate-in fade-in duration-1000">
      <div className="w-full max-w-md space-y-10">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto shadow-sm border border-primary/10">
            <span className="text-white font-black text-3xl">K</span>
          </div>
          <div>
             <h1 className="text-3xl font-black text-foreground tracking-tighter">Koti Master Admin</h1>
             <p className="text-muted-foreground font-black mt-1 uppercase tracking-widest text-[10px]">Secure Operations Gateway</p>
          </div>
        </div>

        {/* Login Card - Shadcn Day Mode */}
        <div className="bg-card p-10 rounded-xl shadow-sm border border-border animate-in slide-in-from-bottom-4 duration-700">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] font-bold text-red-700 leading-tight">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Administrator ID (Email)</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-4 h-4" />
                <input 
                   type="email" 
                   placeholder="admin@koti.in" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full bg-muted/30 border border-input rounded-lg py-3.5 pl-11 pr-4 text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                   required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Master Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-4 h-4" />
                <input 
                   type={showPassword ? "text" : "password"} 
                   placeholder="••••••••" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-muted/30 border border-input rounded-lg py-3.5 pl-11 pr-11 text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                   required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-input bg-muted/30 accent-primary" defaultChecked />
                <span className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">Trust this device</span>
              </label>
              <button type="button" className="text-[11px] font-bold text-primary hover:underline">Forgot Access?</button>
            </div>

            <button 
              disabled={isLoading}
              className="w-full bg-primary text-white font-black py-4 rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="text-[11px] uppercase tracking-widest">Authenticate Access</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-card rounded-full border border-border shadow-sm">
            <ShieldCheck size={12} className="text-green-500" />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">End-to-End Encrypted Tunnel</span>
          </div>
          <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">© 2026 Koti Stores Ecosystem</p>
        </div>
      </div>
    </div>
  );
}
