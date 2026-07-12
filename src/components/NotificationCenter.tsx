import React, { useState, useEffect } from "react";
import { Notification } from "../types";
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  X, 
  AlertTriangle, 
  Wrench, 
  ShieldAlert, 
  CreditCard, 
  Cpu
} from "lucide-react";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const target = notifications.find(n => n.id === id);
      if (!target) return;
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...target, isRead: true })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      // Mark all in the state as read, calling updates
      const promises = notifications.filter(n => !n.isRead).map(n => 
        fetch(`/api/notifications/${n.id}`, {
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
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper icons
  const getIcon = (type: string) => {
    switch (type) {
      case "Maintenance":
        return <Wrench className="w-4 h-4 text-amber-400" />;
      case "Safety":
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case "Financial":
        return <CreditCard className="w-4 h-4 text-purple-400" />;
      case "Alert":
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const filtered = notifications.filter(n => filter === "All" || n.type === filter);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 animate-fade-in text-xs text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container/30 p-4 rounded-xl border border-outline-variant/20">
        <div>
          <h3 className="font-display text-base font-extrabold text-on-surface">Operations Control Center Alerts</h3>
          <p className="text-xs text-on-surface-variant/70 mt-0.5">Real-time emergency dispatcher notifications, vehicle sensor alarms, and billing logs.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="bg-surface-container hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto justify-center"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All Cleared
          </button>
        )}
      </div>

      {/* Filter and stats layout */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left side filters bento */}
        <div className="md:w-1/4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 space-y-3 h-fit">
          <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Alarm Categories</span>
          <div className="flex flex-col gap-1 text-xs">
            {[
              { key: "All", label: "All Operational Notifications", count: notifications.length },
              { key: "Alert", label: "Breakdowns & Obstacles", count: notifications.filter(n => n.type === "Alert").length },
              { key: "Safety", label: "Crew CDL Compliance", count: notifications.filter(n => n.type === "Safety").length },
              { key: "Maintenance", label: "Scheduled Repreventions", count: notifications.filter(n => n.type === "Maintenance").length },
              { key: "Financial", label: "Cash & Fuel Audits", count: notifications.filter(n => n.type === "Financial").length }
            ].map((col) => (
              <button
                key={col.key}
                onClick={() => setFilter(col.key)}
                className={`flex justify-between items-center px-2.5 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === col.key 
                    ? "bg-primary/10 text-primary border-l-2 border-primary" 
                    : "text-on-surface-variant hover:bg-surface-container/40"
                }`}
              >
                <span>{col.label}</span>
                <span className="bg-surface-container px-2 py-0.5 rounded-full text-[10px] text-on-surface-variant font-mono">
                  {col.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right side alert lists */}
        <div className="md:w-3/4 space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-on-surface-variant">Opening dispatch channels...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-12 text-center text-on-surface-variant/60 italic">
              All fleet diagnostic alarms cleared. Safe route telemetry active.
            </div>
          ) : (
            filtered.map((item) => (
              <div 
                key={item.id} 
                className={`border rounded-xl p-4 flex gap-4 items-start justify-between transition-all ${
                  item.isRead 
                    ? "bg-surface-container-low/40 border-outline-variant/15 text-on-surface-variant/80" 
                    : "bg-surface-container-low border-primary/30 text-on-surface shadow-md"
                }`}
              >
                <div className="flex gap-3">
                  <div className="p-2 bg-[#0F1115] border border-outline-variant/30 rounded-lg shrink-0 mt-0.5 shadow-sm">
                    {getIcon(item.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-primary font-bold">{item.id}</span>
                      <span className="text-[9px] text-on-surface-variant/60 font-mono">
                        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-semibold leading-relaxed text-xs">
                      {item.message}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1">
                  {!item.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(item.id)}
                      title="Clear alarm notice"
                      className="p-1.5 hover:bg-emerald-500/10 text-emerald-400 rounded transition-all cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(item.id)}
                    title="Remove record row"
                    className="p-1.5 hover:bg-rose-500/10 text-rose-400 rounded transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
