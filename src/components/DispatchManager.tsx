import React, { useState, useEffect } from "react";
import { Dispatch, Vehicle, Driver } from "../types";
import { 
  Send, 
  Plus, 
  Search, 
  Check, 
  AlertTriangle, 
  User, 
  Truck, 
  Navigation, 
  Calendar, 
  X,
  FileText,
  RefreshCw
} from "lucide-react";

interface DispatchManagerProps {
  vehicles: Vehicle[];
  drivers: Driver[];
}

export default function DispatchManager({ vehicles, drivers }: DispatchManagerProps) {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tripId: "",
    vehicleId: "",
    driverId: "",
    route: "",
    dispatchTime: new Date().toISOString().slice(0, 16),
    status: "Pending" as "Pending" | "Assigned" | "In Transit" | "Completed" | "Failed",
    instructions: ""
  });

  const fetchDispatches = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dispatches");
      if (res.ok) {
        const data = await res.json();
        setDispatches(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      tripId: `TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: vehicles[0]?.id || "",
      driverId: drivers[0]?.id || "",
      route: "",
      dispatchTime: new Date().toISOString().slice(0, 16),
      status: "Assigned",
      instructions: ""
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/dispatches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchDispatches();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const target = dispatches.find(d => d.id === id);
    if (!target) return;
    try {
      const res = await fetch(`/api/dispatches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...target, status: newStatus })
      });
      if (res.ok) {
        fetchDispatches();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this dispatch manifest from log?")) return;
    try {
      const res = await fetch(`/api/dispatches/${id}`, { method: "DELETE" });
      if (res.ok) fetchDispatches();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Search
  const filtered = dispatches.filter(d => {
    const vName = vehicles.find(v => v.id === d.vehicleId)?.name || "";
    const dName = drivers.find(drv => drv.id === d.driverId)?.name || "";
    const matchesSearch = 
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.route.toLowerCase().includes(search.toLowerCase()) ||
      vName.toLowerCase().includes(search.toLowerCase()) ||
      dName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "All" || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container/30 p-4 rounded-xl border border-outline-variant/20">
        <div>
          <h3 className="font-display text-base font-extrabold text-on-surface">Tactical Dispatch Center</h3>
          <p className="text-xs text-on-surface-variant/70 mt-0.5">Authorize real-time load dispatch clearances, monitor crew sign-ins, and resolve route blockers.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-[#ffb95f] text-[#472a00] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          Dispatch Cargo Manifest
        </button>
      </div>

      {/* Visual Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { key: "Assigned", label: "Assigned / Pre-trip", color: "border-blue-500/20 text-blue-400 bg-blue-500/5" },
          { key: "In Transit", label: "Active In-Transit", color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" },
          { key: "Completed", label: "Logistics Completed", color: "border-purple-500/20 text-purple-400 bg-purple-500/5" },
          { key: "Failed", label: "Incident Alerts / Failed", color: "border-rose-500/20 text-rose-400 bg-rose-500/5" }
        ].map((col) => {
          const colItems = filtered.filter(i => i.status === col.key);
          return (
            <div key={col.key} className="bg-surface-container-lowest/80 border border-outline-variant/30 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
                <span className="text-xs font-extrabold text-on-surface flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    col.key === "In Transit" ? "bg-emerald-400" :
                    col.key === "Assigned" ? "bg-blue-400" :
                    col.key === "Completed" ? "bg-purple-400" : "bg-rose-400"
                  }`} />
                  {col.label}
                </span>
                <span className="text-[10px] font-bold bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
                  {colItems.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[250px] max-h-[450px] overflow-y-auto pr-1">
                {colItems.length === 0 ? (
                  <div className="text-center py-12 text-[11px] text-on-surface-variant/40 italic">
                    Manifest empty
                  </div>
                ) : (
                  colItems.map((item) => {
                    const matchedVehicle = vehicles.find(v => v.id === item.vehicleId);
                    const matchedDriver = drivers.find(d => d.id === item.driverId);
                    return (
                      <div 
                        key={item.id} 
                        className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-3 space-y-2 hover:border-primary/50 transition-all text-xs text-on-surface relative group"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-primary font-bold text-[10px]">{item.id}</span>
                          <span className="text-[9px] text-on-surface-variant font-mono">
                            {new Date(item.dispatchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="font-semibold">{item.route}</div>

                        <div className="space-y-1 pt-1 border-t border-outline-variant/15 text-[10px] text-on-surface-variant">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-primary" />
                            <span>{matchedDriver?.name || item.driverId}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-secondary" />
                            <span>{matchedVehicle?.name || item.vehicleId}</span>
                          </div>
                        </div>

                        {item.instructions && (
                          <div className="bg-surface-container-lowest text-[9px] p-1.5 rounded border border-outline-variant/10 text-on-surface-variant/80 italic line-clamp-2">
                            {item.instructions}
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2 gap-1.5">
                          {item.status === "Assigned" && (
                            <button 
                              onClick={() => handleStatusChange(item.id, "In Transit")}
                              className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[9px] py-1 rounded transition-colors cursor-pointer"
                            >
                              Dispatch Live
                            </button>
                          )}
                          {item.status === "In Transit" && (
                            <button 
                              onClick={() => handleStatusChange(item.id, "Completed")}
                              className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-[9px] py-1 rounded transition-colors cursor-pointer"
                            >
                              Mark Delivered
                            </button>
                          )}
                          {item.status === "Failed" && (
                            <button 
                              onClick={() => handleStatusChange(item.id, "Assigned")}
                              className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-[9px] py-1 rounded transition-colors cursor-pointer"
                            >
                              Re-Dispatch
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-2 py-1 rounded text-[9px] transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dispatch Creator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000a0] backdrop-blur-sm p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-fade-in">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-highest cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-display text-base font-extrabold text-on-surface flex items-center gap-2 mb-4">
              <Send className="w-5 h-5 text-primary" />
              Authorize Logistics Dispatch
            </h4>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Route & Waypoints</label>
                <input
                  type="text"
                  required
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  placeholder="Seattle WA fulfillment node to Portland OR depot"
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Vehicle</label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Driver Crew</label>
                  <select
                    value={formData.driverId}
                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Dispatch Schedule</label>
                <input
                  type="datetime-local"
                  value={formData.dispatchTime}
                  onChange={(e) => setFormData({ ...formData, dispatchTime: e.target.value })}
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Special Operator Instructions</label>
                <textarea
                  rows={3}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Maintain regular speed limits. Verify hazardous chemical permits."
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-[#ffb95f] text-[#472a00] py-2.5 rounded-lg text-xs font-bold transition-all mt-4 cursor-pointer"
              >
                Sign Manifest & Commit Dispatch
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
