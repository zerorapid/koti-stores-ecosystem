"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Truck, 
  Award, 
  Users,
  MessageSquare,
  BarChart3,
  Settings, 
  LogOut,
  ChevronRight,
  Megaphone,
  Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Users", href: "/users", icon: Users },
  { label: "Delivery", href: "/delivery", icon: Truck },
  { label: "Loyalty", href: "/loyalty", icon: Award },
  { label: "Coupons", href: "/coupons", icon: Ticket },
  { label: "Support", href: "/support", icon: MessageSquare },
  { label: "Marketing", href: "/marketing", icon: Megaphone },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Simulate session cleanup
    setTimeout(() => {
      router.push("/");
    }, 1200);
  };

  return (
    <aside className="w-64 bg-background border-r border-border flex flex-col h-screen sticky top-0 animate-in slide-in-from-left duration-500">
      <div className="p-8 flex items-center gap-4">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm border border-primary/10">
          <span className="text-white font-black text-xl">K</span>
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tighter text-foreground leading-none">Koti Admin</h1>
          <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1.5 leading-none">Master Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-2 space-y-1" aria-label="Main Navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Navigate to ${item.label}`}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-secondary text-primary font-bold shadow-sm" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-4.5 h-4.5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} aria-hidden="true" />
              <span className="text-[13px] tracking-tight flex-1">{item.label}</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-l-full" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border">
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label={isLoggingOut ? "Logging out from session" : "Logout from Master Admin"}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors group disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin text-red-600" aria-hidden="true" />
          ) : (
            <LogOut className="w-4.5 h-4.5 group-hover:text-red-600" aria-hidden="true" />
          )}
          <span className="text-[13px] font-bold">{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}
