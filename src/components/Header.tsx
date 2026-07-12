import React, { useEffect, useRef } from "react";
import { Search, Bell, Plus } from "lucide-react";
import { ActiveTab, User } from "../types";

interface HeaderProps {
  activeTab: ActiveTab;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: User | null;
  onAddClick: () => void;
  tabTitle: string;
}

export default function Header({
  activeTab,
  searchQuery,
  setSearchQuery,
  currentUser,
  onAddClick,
  tabTitle,
}: HeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [debouncedQuery, setDebouncedQuery] = React.useState(searchQuery);
  const [results, setResults] = React.useState<any>(null);
  const [searching, setSearching] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = React.useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n: any) => !n.isRead && !n.read).length;

  // Ctrl+K key listener to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounce the searchQuery
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setResults(null);
      setShowDropdown(false);
      return;
    }

    const fetchResults = async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  // Helper to highlight search query matches in search results
  const highlight = (text: string) => {
    if (!debouncedQuery) return text;
    const parts = text.split(new RegExp(`(${debouncedQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, "gi"));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === debouncedQuery.toLowerCase() ? (
            <mark key={i} className="bg-primary/30 text-primary font-bold px-0.5 rounded">{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // Professional static avatar based on user role to match high fidelity mockup
  const avatarUrl = currentUser?.role === "ADMIN" 
    ? "https://lh3.googleusercontent.com/aida-public/AB6AXuB6NCMOJp5coWjWN1xutF9zfi2fy3HcAOVsbczyyYU2P6fXxvz0p8ungmpwARHlfJ_dITi14uTKovz77XSBRLdKRBRGk4BGTwJgLGG6WhvsaWPxgl_Gl6Ec5n0gmt4LFQGFTJsACf0ZGFemStVK6K6vfyG1Vz3H7o6aetv1bIzgW6Wi2qsf-PDoUeQIrLix9ZG5JZBJ_vIVH2d50cVsqx7Zv2MAs9ocPg7E7TCcdr1e11zMjtlCX7qvwpQLTnLeyw20W8kgbVKPkNK6"
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuAsCJsBCgJZH2JXvYd13off3mm9yoNq_JDAMMEbc6WeqU2Po4-8cz2pxcOwZWvbsidSpw6ZZ97S-xajPWFWBtyOEYm1gET2jw7WsnMT04tTlnXVgDg627F_UNCUofWYLyrGcRO9hM0gjYibDrKOatuMIz7mHxW3XD83x0j9qrRBZCBJcPslnXV86KER77l23oeHp_xpKbITxUVrmvvzTA5HSdcY3Ms6H12UqMdDUgPxl4l5eTMVAVvutpuRa0lc7FNCoBMIbKZtG9V6";

  const getPlaceholder = () => {
    switch (activeTab) {
      case "drivers":
        return "Search drivers... (Ctrl+K)";
      case "fleet":
        return "Search fleet... (Ctrl+K)";
      default:
        return "Search TransitOps... (Ctrl+K)";
    }
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-surface/60 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center px-8 w-auto z-40">
      {/* Title & Search Area */}
      <div className="flex items-center gap-6 flex-1">
        <h2 className="font-display text-lg font-extrabold text-on-surface whitespace-nowrap">
          {tabTitle}
        </h2>
        
        <div ref={dropdownRef} className="relative w-full max-w-md group hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchQuery) setShowDropdown(true); }}
            placeholder={getPlaceholder()}
            className="w-full bg-surface-container border border-outline-variant/30 rounded-full py-1.5 pl-10 pr-12 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface placeholder:text-on-surface-variant/45"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 bg-surface-container-highest/60 border border-outline-variant/30 text-on-surface-variant px-1.5 py-0.5 rounded text-[9px] font-mono select-none">
            ⌘K
          </kbd>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container border border-outline-variant rounded-xl shadow-2xl z-[150] max-h-96 overflow-y-auto p-4 space-y-4 text-xs animate-fade-in custom-scrollbar">
              {searching ? (
                <div className="text-center py-6 text-on-surface-variant/70 font-semibold">
                  Searching TransitOps database...
                </div>
              ) : results && !Object.values(results).some((arr: any) => arr && arr.length > 0) ? (
                <div className="text-center py-6 text-on-surface-variant/70 font-semibold">
                  No matching operational records.
                </div>
              ) : results ? (
                <div className="space-y-3 text-left">
                  {Object.entries(results).map(([category, items]: [string, any]) => {
                    if (!items || items.length === 0) return null;
                    const displayCategory = category === "repairTickets" ? "Repair Tickets" : category.charAt(0).toUpperCase() + category.slice(1);
                    return (
                      <div key={category} className="space-y-1">
                        <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-outline-variant/30 pb-1">
                          {displayCategory} ({items.length})
                        </h4>
                        <div className="space-y-1">
                          {items.map((item: any) => (
                            <div key={item.id || item._id || item.email} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors flex justify-between items-center text-[11px] gap-2">
                              <div className="truncate">
                                <span className="font-bold text-on-surface font-mono mr-2">{item.id || item.email}</span>
                                <span className="text-on-surface-variant font-semibold">
                                  {highlight(item.name || item.routeName || item.title || item.category || item.description || "")}
                                </span>
                              </div>
                              {item.status && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-surface-container-highest rounded font-bold uppercase tracking-wider shrink-0 text-on-surface-variant">
                                  {item.status}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Operator Status & Actions */}
      <div className="flex items-center gap-4">
        {/* Search toggle for small mobile sizes */}
        <div className="sm:hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-28 bg-surface-container border border-outline-variant/30 rounded-full py-1 px-3 text-[10px] focus:ring-1 focus:ring-primary focus:border-primary outline-none text-on-surface"
          />
        </div>

        {/* Notifications Alert Bell */}
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 hover:bg-surface-container-highest/40 rounded-full transition-colors text-on-surface-variant relative cursor-pointer group"
          >
            <Bell className="w-4 h-4 text-on-surface-variant hover:text-on-surface transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary rounded-full ring-2 ring-[#0F1115] text-[9px] text-[#472a00] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-surface-container border border-outline-variant rounded-xl shadow-2xl z-[150] p-4 space-y-3 text-xs animate-fade-in">
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                <span className="font-bold text-on-surface flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-primary" />
                  Operator Dispatch Alerts ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button 
                    onClick={async () => {
                      try {
                        const promises = notifications.filter(n => !n.isRead && !n.read).map(n => 
                          fetch(`/api/notifications/${n.id || n._id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ...n, isRead: true })
                          })
                        );
                        await Promise.all(promises);
                        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-outline-variant/20 custom-scrollbar pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-on-surface-variant/60 font-semibold italic">
                    Zero alert flags from control grid.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id || notif._id} 
                      className={`py-2 text-left flex gap-2 items-start transition-colors ${notif.isRead || notif.read ? "opacity-60" : "bg-surface-container-high/40 rounded-lg px-2 my-1"}`}
                    >
                      <div className="w-2 h-2 rounded-full shrink-0 mt-1.5 bg-primary" style={{ backgroundColor: (notif.isRead || notif.read) ? "transparent" : "" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-on-surface leading-tight break-words">{notif.message}</p>
                        <span className="text-[9px] text-on-surface-variant/70 font-bold block mt-1 uppercase">
                          {notif.type || "System"} • {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Create Entity Button */}
        <button
          onClick={onAddClick}
          className="bg-primary hover:bg-[#ffb95f] text-[#472a00] py-1.5 px-4 rounded-lg font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1.5 shadow-sm shadow-primary/5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3] text-[#472a00]" />
          Create
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-outline-variant/30"></div>

        {/* User Profile Avatar */}
        <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant/40 shadow-inner flex items-center justify-center bg-surface-container">
          <img
            src={avatarUrl}
            alt="Operator Profile"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
