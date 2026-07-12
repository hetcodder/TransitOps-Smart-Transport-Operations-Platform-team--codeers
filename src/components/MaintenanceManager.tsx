import React, { useState, useEffect } from "react";
import { Maintenance, Vehicle } from "../types";
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  X,
  CreditCard,
  Settings,
  Truck
} from "lucide-react";

interface MaintenanceManagerProps {
  vehicles: Vehicle[];
}

export default function MaintenanceManager({ vehicles }: MaintenanceManagerProps) {
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Maintenance | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    vehicleId: "",
    issueType: "Scheduled",
    description: "",
    priority: "Medium",
    assignedMechanic: "",
    estimatedCost: "100",
    actualCost: "",
    status: "Scheduled",
    serviceDate: new Date().toISOString().split("T")[0]
  });

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/maintenances");
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleOpenCreate = () => {
    setSelectedRecord(null);
    setError(null);
    setFormData({
      vehicleId: vehicles[0]?.id || "",
      issueType: "Scheduled",
      description: "",
      priority: "Medium",
      assignedMechanic: "",
      estimatedCost: "350",
      actualCost: "",
      status: "Scheduled",
      serviceDate: new Date().toISOString().split("T")[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: Maintenance) => {
    setSelectedRecord(rec);
    setError(null);
    setFormData({
      vehicleId: rec.vehicleId,
      issueType: rec.issueType,
      description: rec.description,
      priority: rec.priority,
      assignedMechanic: rec.assignedMechanic,
      estimatedCost: String(rec.estimatedCost),
      actualCost: rec.actualCost !== undefined && rec.actualCost !== null ? String(rec.actualCost) : "",
      status: rec.status,
      serviceDate: rec.serviceDate
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate estimatedCost
    const estStr = String(formData.estimatedCost).trim();
    if (!estStr) {
      setError("Estimated cost is required.");
      return;
    }
    if (!/^\d+(\.\d+)?$/.test(estStr)) {
      setError("Estimated cost must be a positive number.");
      return;
    }
    const estimatedCostNum = Number(estStr);

    // Validate actualCost (optional)
    let actualCostNum: number | undefined = undefined;
    const actStr = String(formData.actualCost).trim();
    if (actStr) {
      if (!/^\d+(\.\d+)?$/.test(actStr)) {
        setError("Actual invoiced cost must be a positive number.");
        return;
      }
      actualCostNum = Number(actStr);
    }

    const payload = {
      ...formData,
      estimatedCost: estimatedCostNum,
      actualCost: actualCostNum,
      vehicleName: vehicles.find(v => v.id === formData.vehicleId)?.name || "Unknown Vehicle"
    };

    const url = selectedRecord ? `/api/maintenances/${selectedRecord.id}` : "/api/maintenances";
    const method = selectedRecord ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchRecords();

        // If the maintenance status is In Progress or Completed, we could trigger vehicle status change
        const vehicleStatus = formData.status === "In Progress" || formData.status === "Overdue" ? "Maintenance" : "Active";
        await fetch(`/api/vehicles/${formData.vehicleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: vehicleStatus })
        });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit maintenance specifications.");
      }
    } catch (err: any) {
      setError(err.message || "A network error occurred.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this maintenance ticket?")) return;
    try {
      const res = await fetch(`/api/maintenances/${id}`, { method: "DELETE" });
      if (res.ok) fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  // Stats
  const totalSpend = records.reduce((acc, cur) => acc + (cur.actualCost || cur.estimatedCost || 0), 0);
  const activeIssues = records.filter(r => r.status === "In Progress" || r.status === "Overdue").length;
  const criticalTickets = records.filter(r => r.priority === "Critical" && r.status !== "Completed").length;

  // Filter
  const filtered = records.filter(r => {
    const vName = vehicles.find(v => v.id === r.vehicleId)?.name || "";
    const matchesSearch = 
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      vName.toLowerCase().includes(search.toLowerCase()) ||
      r.assignedMechanic.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container/30 p-4 rounded-xl border border-outline-variant/20">
        <div>
          <h3 className="font-display text-base font-extrabold text-on-surface">Servicing & Maintenance Logs</h3>
          <p className="text-xs text-on-surface-variant/70 mt-0.5">Track preventative mechanical checks, repair tickets, and vehicle downtime reports.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-[#ffb95f] text-[#472a00] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          Create Service Ticket
        </button>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Repairs", val: activeIssues, sub: "Downtime vehicles", color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
          { label: "Critical Severity", val: criticalTickets, sub: "Immediate dispatch risk", color: "text-rose-400 border-rose-500/20 bg-rose-500/5" },
          { label: "Completed Servicing", val: records.filter(r => r.status === "Completed").length, sub: "Passed inspection", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
          { label: "Servicing Outlay", val: `₹${totalSpend.toLocaleString()}`, sub: "Fleet capital spend", color: "text-purple-400 border-purple-500/20 bg-purple-500/5" }
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${stat.color} flex flex-col justify-between h-24`}>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">{stat.label}</span>
              <Wrench className="w-4 h-4 text-on-surface-variant/50" />
            </div>
            <div>
              <div className="text-xl font-extrabold font-display leading-none">{stat.val}</div>
              <div className="text-[9px] text-on-surface-variant/60 mt-1">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-surface-container/50 border border-outline-variant/30 rounded-lg px-2.5 py-1.5 w-full md:w-auto justify-between sm:justify-start">
          <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-xs text-on-surface focus:outline-none cursor-pointer font-semibold"
          >
            <option value="All">All Servicing Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Grid of tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 text-center p-12 text-xs text-on-surface-variant">Gathering maintenance reports...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 text-center p-12 text-xs text-on-surface-variant">No active maintenance tickets matching filter found.</div>
        ) : (
          filtered.map((rec) => {
            const matchedVehicle = vehicles.find(v => v.id === rec.vehicleId);
            return (
              <div 
                key={rec.id} 
                className="bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 rounded-xl p-5 space-y-4 flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-primary font-bold text-xs">{rec.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        rec.priority === "Critical" ? "bg-rose-500/15 text-rose-400 border border-rose-500/20" :
                        rec.priority === "High" ? "bg-amber-500/15 text-amber-400" :
                        rec.priority === "Medium" ? "bg-blue-500/15 text-blue-400" : "bg-surface-container-highest text-on-surface-variant"
                      }`}>
                        {rec.priority} Priority
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                      rec.status === "In Progress" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                      rec.status === "Completed" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                      rec.status === "Overdue" ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" :
                      "bg-surface-container-highest text-on-surface-variant border border-outline-variant/30"
                    }`}>
                      {rec.status}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-on-surface font-extrabold text-sm">
                      <Truck className="w-4 h-4 text-primary" />
                      <span>{matchedVehicle?.name || rec.vehicleId}</span>
                      <span className="text-xs text-on-surface-variant/60 font-mono">({rec.vehicleId})</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-2 font-semibold leading-relaxed">
                      {rec.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant/80 bg-surface-container/35 p-2.5 rounded-lg border border-outline-variant/15">
                    <div>
                      <span className="block text-[9px] text-on-surface-variant/50 uppercase font-bold">Mechanic Assigned</span>
                      <span className="font-semibold text-on-surface">{rec.assignedMechanic || "Unassigned"}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-on-surface-variant/50 uppercase font-bold">Scheduled Service Date</span>
                      <span className="font-semibold text-on-surface">{rec.serviceDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-outline-variant/20 pt-4 mt-2">
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-on-surface-variant">Cost:</span>
                    <span className="font-bold text-on-surface">₹{(rec.actualCost ?? rec.estimatedCost).toLocaleString()}</span>
                    {(rec.actualCost === undefined || rec.actualCost === null) && <span className="text-[9px] text-on-surface-variant/60 font-sans italic">(Est.)</span>}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenEdit(rec)}
                      className="bg-surface-container-highest hover:bg-outline-variant/50 text-on-surface px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Update Ticket
                    </button>
                    <button 
                      onClick={() => handleDelete(rec.id)}
                      className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Servicing Ticket Creator Modal */}
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
              <Wrench className="w-5 h-5 text-primary" />
              {selectedRecord ? "Update Maintenance Ticket" : "Schedule Vehicle Maintenance"}
            </h4>

            {error && (
              <div className="p-2.5 bg-error-container/10 border border-error/30 text-error rounded-lg text-[11px] font-semibold mb-4 animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Target Vehicle</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Issue Category</label>
                  <select
                    value={formData.issueType}
                    onChange={(e) => setFormData({ ...formData, issueType: e.target.value as any })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  >
                    <option value="Scheduled">Scheduled Servicing</option>
                    <option value="Repair">Mechanical Repair</option>
                    <option value="Inspection">Annual Safety Permit</option>
                    <option value="Emergency">Emergency Breakdown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Downtime Severity</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  >
                    <option value="Low">Low (Minor Delay)</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High (Immediate Warning)</option>
                    <option value="Critical">Critical (Vehicle Stalled)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Issue / Service Diagnosis Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Excessive friction noise in front brakes during highway speeds. Requires replacement pads."
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Assigned Mechanic / Station</label>
                  <input
                    type="text"
                    required
                    value={formData.assignedMechanic}
                    onChange={(e) => setFormData({ ...formData, assignedMechanic: e.target.value })}
                    placeholder="e.g. Sarah Jenkins (EV Expert)"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={formData.serviceDate}
                    onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Estimated Cost (₹)</label>
                  <input
                    type="text"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    placeholder="e.g. 5000"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Actual Invoiced Cost (₹)</label>
                  <input
                    type="text"
                    value={formData.actualCost || ""}
                    onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
                    placeholder="Pending invoice"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Servicing Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress (Offline)</option>
                  <option value="Completed">Completed (Cleared to active)</option>
                  <option value="Overdue">Overdue warning</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-[#ffb95f] text-[#472a00] py-2.5 rounded-lg text-xs font-bold transition-all mt-4 cursor-pointer"
              >
                {selectedRecord ? "Commit Worklog Updates" : "Issue Maintenance Clearance"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
