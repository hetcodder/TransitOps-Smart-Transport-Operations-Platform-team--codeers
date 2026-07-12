import React from "react";
import { 
  LayoutDashboard, 
  Truck, 
  User, 
  Navigation, 
  Send, 
  Wrench, 
  Flame, 
  BarChart2, 
  PlusCircle, 
  LogOut, 
  Settings, 
  UserCircle,
  Moon,
  Sun,
  FileText,
  Bell,
  Calendar,
  HelpCircle,
  Cpu
} from "lucide-react";
import { ActiveTab, User as UserType } from "../types";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  onQuickCreate: () => void;
  currentUser: UserType | null;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onLogout,
  onQuickCreate,
  currentUser,
  theme,
  toggleTheme,
}: SidebarProps) {
  
  const primaryNavItems = [
    { id: "dashboard" as ActiveTab, label: "Dashboard", icon: LayoutDashboard },
    { id: "fleet" as ActiveTab, label: "Fleet", icon: Truck },
    { id: "drivers" as ActiveTab, label: "Drivers", icon: User },
    { id: "trips" as ActiveTab, label: "Trips", icon: Navigation },
    { id: "dispatch" as ActiveTab, label: "Dispatch", icon: Send },
    { id: "maintenance" as ActiveTab, label: "Maintenance", icon: Wrench },
    { id: "fuel" as ActiveTab, label: "Fuel & Expenses", icon: Flame },
    { id: "analytics" as ActiveTab, label: "Analytics", icon: BarChart2 },
  ];

  const supplementaryNavItems = [
    { id: "documents", label: "Documents", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help Center", icon: HelpCircle },
    { id: "ai", label: "AI Assistant", icon: Cpu },
  ];

  const userRole = currentUser?.role || "Fleet Manager";

  const isTabAllowed = (tabId: string) => {
    if (userRole === "Fleet Manager" || userRole === "ADMIN" || userRole === "FLEET") {
      return true;
    }
    if (userRole === "Dispatcher" || userRole === "DISPATCH") {
      const allowed = ["dashboard", "trips", "dispatch", "drivers", "fleet", "calendar", "notifications", "help", "ai"];
      return allowed.includes(tabId);
    }
    if (userRole === "Safety Officer" || userRole === "TECH") {
      const allowed = ["dashboard", "fleet", "maintenance", "drivers", "documents", "calendar", "notifications", "help", "ai"];
      return allowed.includes(tabId);
    }
    if (userRole === "Financial Analyst") {
      const allowed = ["dashboard", "fuel", "analytics", "documents", "calendar", "notifications", "help", "ai"];
      return allowed.includes(tabId);
    }
    return true;
  };

  const allowedPrimaryItems = primaryNavItems.filter(item => isTabAllowed(item.id));
  const allowedSupplementaryItems = supplementaryNavItems.filter(item => isTabAllowed(item.id));

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/30 flex flex-col py-6 px-4 z-50">
      {/* Brand Header */}
      <div className="mb-6 px-2">
        <h1 className="font-display text-xl lg:text-2xl font-black text-primary flex items-center gap-2 tracking-tight">
          <Truck className="w-6 h-6 text-primary fill-primary/10" />
          TransitOps
        </h1>
        <p className="font-sans text-[9px] font-bold text-on-surface-variant/50 tracking-widest uppercase mt-1">
          Mission Control
        </p>
      </div>

      {/* Main Navigation Scroll Area */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
        {/* Core Sections */}
        {allowedPrimaryItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-extrabold shadow-md shadow-secondary-container/10 border border-secondary/20"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/55"
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-on-secondary-container" : "text-on-surface-variant"}`} />
              {item.label}
            </button>
          );
        })}

        {/* Divider */}
        {allowedSupplementaryItems.length > 0 && <div className="my-4 border-t border-outline-variant/20"></div>}

        {/* Auxiliary Apps (to match high fidelity Mockup 2) */}
        <div className="space-y-1">
          {allowedSupplementaryItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-secondary-container text-on-secondary-container font-extrabold"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/55"
                }`}
              >
                <item.icon className="w-4 h-4 text-on-surface-variant/70" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Controls Panel */}
      <div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-3">
        {/* Quick-Create Button */}
        <button
          onClick={onQuickCreate}
          className="w-full bg-primary-container text-[#2a1700] hover:bg-[#d97706] py-2.5 rounded-lg text-xs font-extrabold tracking-wide flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-md shadow-primary-container/5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-[#2a1700]" />
          Quick-Create
        </button>

        {/* Profile & Theme Settings */}
        <div className="space-y-1">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-all">
            <UserCircle className="w-4 h-4 text-on-surface-variant" />
            <div className="flex-1 text-left truncate">
              <p className="font-bold text-on-surface leading-tight truncate">
                {currentUser?.name || "Ops Officer"}
              </p>
              <p className="text-[10px] text-on-surface-variant/60 leading-none mt-0.5 uppercase tracking-wider font-semibold">
                {currentUser?.role || "Staff"}
              </p>
            </div>
          </div>

          {/* Theme Switcher Toggle Slider */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/55 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-primary" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>Theme</span>
            </div>
            <div className={`w-8 h-4.5 rounded-full relative transition-colors ${theme === "dark" ? "bg-primary/20" : "bg-outline-variant"}`}>
              <div 
                className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all ${
                  theme === "dark" 
                    ? "right-0.5 bg-primary" 
                    : "left-0.5 bg-on-surface"
                }`}
              />
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-error hover:text-[#ffdad6] hover:bg-error-container/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-error" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
