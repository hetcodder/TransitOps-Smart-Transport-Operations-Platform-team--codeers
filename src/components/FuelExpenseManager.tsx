import React, { useState, useEffect } from "react";
import { FuelLog, Expense, Vehicle, Driver } from "../types";
import { 
  Flame, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  FileText, 
  TrendingUp, 
  Download, 
  CreditCard, 
  X,
  Truck,
  User,
  Activity
} from "lucide-react";

interface FuelExpenseManagerProps {
  vehicles: Vehicle[];
  drivers: Driver[];
}

export default function FuelExpenseManager({ vehicles, drivers }: FuelExpenseManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"fuel" | "expenses">("fuel");
  
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Modals
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [fuelError, setFuelError] = useState<string | null>(null);
  const [expenseError, setExpenseError] = useState<string | null>(null);

  // Forms
  const [fuelForm, setFuelForm] = useState<any>({
    vehicleId: "",
    driverId: "",
    date: new Date().toISOString().split("T")[0],
    fuelQuantity: "120",
    cost: "240",
    fuelStation: "",
    mileage: "45000",
    paymentMethod: "Fleet Card (Visa)"
  });

  const [expenseForm, setExpenseForm] = useState<any>({
    category: "Toll",
    amount: "150",
    description: "",
    vehicleId: "",
    driverId: "",
    date: new Date().toISOString().split("T")[0],
    status: "Pending"
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const fuelRes = await fetch("/api/fuelLogs");
      const expRes = await fetch("/api/expenses");
      if (fuelRes.ok) setFuelLogs(await fuelRes.json());
      if (expRes.ok) setExpenses(await expRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenFuel = () => {
    setFuelError(null);
    setFuelForm({
      vehicleId: vehicles[0]?.id || "",
      driverId: drivers[0]?.id || "",
      date: new Date().toISOString().split("T")[0],
      fuelQuantity: "150",
      cost: "300",
      fuelStation: "Pilot Station #112",
      mileage: "12500",
      paymentMethod: "Fleet Card (Visa)"
    });
    setIsFuelModalOpen(true);
  };

  const handleOpenExpense = () => {
    setExpenseError(null);
    setExpenseForm({
      category: "Toll",
      amount: "45",
      description: "",
      vehicleId: vehicles[0]?.id || "",
      driverId: drivers[0]?.id || "",
      date: new Date().toISOString().split("T")[0],
      status: "Pending"
    });
    setIsExpenseModalOpen(true);
  };

  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFuelError(null);

    const qtyStr = String(fuelForm.fuelQuantity).trim();
    if (!/^\d+(\.\d+)?$/.test(qtyStr)) {
      setFuelError("Fuel Quantity must be a valid positive number.");
      return;
    }
    const fuelQuantityNum = Number(qtyStr);

    const costStr = String(fuelForm.cost).trim();
    if (!/^\d+(\.\d+)?$/.test(costStr)) {
      setFuelError("Fuel Cost must be a valid positive number.");
      return;
    }
    const costNum = Number(costStr);

    const mileageStr = String(fuelForm.mileage).trim();
    if (!/^\d+$/.test(mileageStr)) {
      setFuelError("Odometer must be a valid whole number.");
      return;
    }
    const mileageNum = Number(mileageStr);

    const payload = {
      ...fuelForm,
      fuelQuantity: fuelQuantityNum,
      cost: costNum,
      mileage: mileageNum
    };

    try {
      const res = await fetch("/api/fuelLogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsFuelModalOpen(false);
        fetchData();
      } else {
        const errData = await res.json();
        setFuelError(errData.error || "Failed to submit fuel logs.");
      }
    } catch (err: any) {
      setFuelError(err.message || "A network error occurred.");
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError(null);

    const amtStr = String(expenseForm.amount).trim();
    if (!/^\d+(\.\d+)?$/.test(amtStr)) {
      setExpenseError("Invoice Amount must be a valid positive number.");
      return;
    }
    const amountNum = Number(amtStr);

    const payload = {
      ...expenseForm,
      amount: amountNum
    };

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsExpenseModalOpen(false);
        fetchData();
      } else {
        const errData = await res.json();
        setExpenseError(errData.error || "Failed to submit expense invoice.");
      }
    } catch (err: any) {
      setExpenseError(err.message || "A network error occurred.");
    }
  };

  const handleApproveExpense = async (id: string, newStatus: "Approved" | "Rejected") => {
    const target = expenses.find(e => e.id === id);
    if (!target) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...target, status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Remove this general expense ledger row?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFuelLog = async (id: string) => {
    if (!confirm("Are you sure you want to delete/remove this fuel log?")) return;
    try {
      const res = await fetch(`/api/fuelLogs/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    let headers = "";
    let rows = "";
    if (activeSubTab === "fuel") {
      headers = "Log ID,Vehicle,Driver,Date,Quantity (L/kWh),Cost (₹),Station,Odometer,Payment\n";
      rows = fuelLogs.map(f => 
        `"${f.id}","${f.vehicleId}","${f.driverId}","${f.date}",${f.fuelQuantity},${f.cost},"${f.fuelStation}",${f.mileage},"${f.paymentMethod}"`
      ).join("\n");
    } else {
      headers = "Expense ID,Category,Amount (₹),Description,Vehicle,Driver,Date,Status\n";
      rows = expenses.map(e => 
        `"${e.id}","${e.category}",${e.amount},"${e.description}","${e.vehicleId}","${e.driverId}","${e.date}","${e.status}"`
      ).join("\n");
    }
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TransitOps_${activeSubTab === "fuel" ? "FuelLogs" : "ExpenseLedger"}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Finance Summary math
  const fuelCostTotal = fuelLogs.reduce((acc, cur) => acc + (cur.cost || 0), 0);
  const totalApprovedExpense = expenses.filter(e => e.status === "Approved").reduce((acc, cur) => acc + (cur.amount || 0), 0);
  const pendingExpenseTotal = expenses.filter(e => e.status === "Pending").reduce((acc, cur) => acc + (cur.amount || 0), 0);
  const totalInflow = fuelCostTotal + totalApprovedExpense;

  // Filters
  const searchLower = search.toLowerCase();
  const filteredFuel = fuelLogs.filter(f => 
    f.id.toLowerCase().includes(searchLower) ||
    f.vehicleId.toLowerCase().includes(searchLower) ||
    f.driverId.toLowerCase().includes(searchLower) ||
    f.fuelStation.toLowerCase().includes(searchLower)
  );

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = 
      e.id.toLowerCase().includes(searchLower) ||
      (e.description || "").toLowerCase().includes(searchLower) ||
      (e.vehicleId || "").toLowerCase().includes(searchLower) ||
      (e.driverId || "").toLowerCase().includes(searchLower);

    const matchesCategory = filterCategory === "All" || e.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container/30 p-4 rounded-xl border border-outline-variant/20">
        <div>
          <h3 className="font-display text-base font-extrabold text-on-surface">Financial Ledger & Refuel Sheets</h3>
          <p className="text-xs text-on-surface-variant/70 mt-0.5">Control operational cash outflows, manage corporate fuel cards, and perform regulatory audit clearances.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={exportCSV}
            className="flex-1 sm:flex-initial bg-surface-container hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Sheet
          </button>
          {activeSubTab === "fuel" ? (
            <button 
              onClick={handleOpenFuel}
              className="flex-1 sm:flex-initial bg-primary hover:bg-[#ffb95f] text-[#472a00] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Record Refuel Card
            </button>
          ) : (
            <button 
              onClick={handleOpenExpense}
              className="flex-1 sm:flex-initial bg-primary hover:bg-[#ffb95f] text-[#472a00] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              File Expense Invoice
            </button>
          )}
        </div>
      </div>

      {/* 2. Quick Outflow Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Fleet Costs", val: `₹${totalInflow.toLocaleString()}`, note: "Fuel + Approved General", color: "border-primary/20 bg-primary/5 text-primary" },
          { label: "Fuel Log Outlays", val: `₹${fuelCostTotal.toLocaleString()}`, note: `${fuelLogs.length} refuel events logged`, color: "border-orange-500/20 bg-orange-500/5 text-orange-400" },
          { label: "Approved Expenses", val: `₹${totalApprovedExpense.toLocaleString()}`, note: "Cleared by administrator", color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" },
          { label: "Awaiting Verification", val: `₹${pendingExpenseTotal.toLocaleString()}`, note: "Pending administrator audit", color: "border-rose-500/20 bg-rose-500/5 text-rose-400" },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${stat.color} flex flex-col justify-between h-24`}>
            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/70">{stat.label}</span>
            <div>
              <span className="text-xl font-extrabold font-display leading-none">{stat.val}</span>
              <span className="block text-[9px] text-on-surface-variant/60 mt-1 font-semibold">{stat.note}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Sub-Tabs toggle bar */}
      <div className="flex border-b border-outline-variant/30 gap-6">
        <button
          onClick={() => setActiveSubTab("fuel")}
          className={`pb-3 text-xs font-bold relative transition-all cursor-pointer ${
            activeSubTab === "fuel" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant/60 hover:text-on-surface"
          }`}
        >
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            Fuel Card Registry ({fuelLogs.length})
          </div>
        </button>
        <button
          onClick={() => setActiveSubTab("expenses")}
          className={`pb-3 text-xs font-bold relative transition-all cursor-pointer ${
            activeSubTab === "expenses" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant/60 hover:text-on-surface"
          }`}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            General Expenses Ledger ({expenses.length})
          </div>
        </button>
      </div>

      {/* 4. Filter controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder={activeSubTab === "fuel" ? "Search stations, vehicles..." : "Search expenses, drivers..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface text-xs"
          />
        </div>

        {activeSubTab === "expenses" && (
          <div className="flex items-center gap-1.5 bg-surface-container/50 border border-outline-variant/30 rounded-lg px-2.5 py-1.5 w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent border-none text-xs text-on-surface focus:outline-none cursor-pointer font-semibold w-full md:w-auto"
            >
              <option value="All">All Categories</option>
              <option value="Fuel">Fuel Logs</option>
              <option value="Maintenance">Maintenance Servicing</option>
              <option value="Insurance">Insurance Policies</option>
              <option value="Toll">Road Highway Tolls</option>
              <option value="Salary">Contractor Disbursements</option>
              <option value="Other">Miscellaneous Fees</option>
            </select>
          </div>
        )}
      </div>

      {/* 5. Data lists */}
      {isLoading ? (
        <div className="text-center p-12 text-xs text-on-surface-variant">Accessing financial databases...</div>
      ) : activeSubTab === "fuel" ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Vehicle ID</th>
                  <th className="py-4 px-4">Driver</th>
                  <th className="py-4 px-4">Fuel Quantity</th>
                  <th className="py-4 px-4">Fueling Station</th>
                  <th className="py-4 px-4 text-right">Invoiced Cost</th>
                  <th className="py-4 px-6 text-center">Payment</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredFuel.map(log => {
                  const matchedVehicle = vehicles.find(v => v.id === log.vehicleId);
                  const matchedDriver = drivers.find(d => d.id === log.driverId);
                  return (
                    <tr key={log.id} className="hover:bg-surface-container/20 transition-all text-xs">
                      <td className="py-4 px-6 font-mono text-primary font-bold">{log.id}</td>
                      <td className="py-4 px-4 text-on-surface-variant font-semibold">{log.date}</td>
                      <td className="py-4 px-4 font-mono font-semibold text-on-surface">{log.vehicleId}</td>
                      <td className="py-4 px-4 font-semibold text-on-surface">{matchedDriver?.name || log.driverId}</td>
                      <td className="py-4 px-4 font-semibold text-on-surface">{log.fuelQuantity} L/kWh</td>
                      <td className="py-4 px-4 text-on-surface-variant/80 italic">{log.fuelStation}</td>
                      <td className="py-4 px-4 text-right font-mono font-extrabold text-on-surface font-semibold">₹{log.cost}</td>
                      <td className="py-4 px-6 text-center text-[10px] text-on-surface-variant font-semibold">{log.paymentMethod}</td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => handleDeleteFuelLog(log.id)}
                          className="p-1 hover:bg-surface-container-highest text-on-surface-variant hover:text-rose-400 rounded transition-colors cursor-pointer text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Description</th>
                  <th className="py-4 px-4 font-mono">Telemetry Assets</th>
                  <th className="py-4 px-4 text-right">Amount</th>
                  <th className="py-4 px-4 text-center">Audit Status</th>
                  <th className="py-4 px-6 text-center">Authorize Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-surface-container/20 transition-all text-xs">
                    <td className="py-4 px-6 font-mono text-primary font-bold">{exp.id}</td>
                    <td className="py-4 px-4 font-semibold text-on-surface">
                      <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] font-extrabold">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-on-surface-variant">{exp.date}</td>
                    <td className="py-4 px-4 text-on-surface font-semibold max-w-[180px] truncate" title={exp.description}>
                      {exp.description}
                    </td>
                    <td className="py-4 px-4 space-y-0.5 font-mono text-[10px] text-on-surface-variant">
                      {exp.vehicleId && <div>Truck: {exp.vehicleId}</div>}
                      {exp.driverId && <div>Crew: {exp.driverId}</div>}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-extrabold text-on-surface">₹{exp.amount}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        exp.status === "Approved" ? "bg-emerald-500/15 text-emerald-400" :
                        exp.status === "Rejected" ? "bg-rose-500/15 text-rose-400" : "bg-amber-500/15 text-amber-400"
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {exp.status === "Pending" && (
                          <>
                            <button 
                              onClick={() => handleApproveExpense(exp.id, "Approved")}
                              title="Audit Clearance: Approve"
                              className="p-1 hover:bg-emerald-500/20 text-emerald-400 rounded cursor-pointer"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleApproveExpense(exp.id, "Rejected")}
                              title="Audit Clearance: Reject"
                              className="p-1 hover:bg-rose-500/20 text-rose-400 rounded cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1 hover:bg-surface-container-highest text-on-surface-variant hover:text-rose-400 rounded transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fuel Log Modal */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000a0] backdrop-blur-sm p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-fade-in">
            <button 
              onClick={() => setIsFuelModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-highest cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-display text-base font-extrabold text-on-surface flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-primary" />
              File Refuel Outflow Log
            </h4>

            {fuelError && (
              <div className="p-2.5 bg-error-container/10 border border-error/30 text-error rounded-lg text-[11px] font-semibold mb-4 animate-fade-in">
                {fuelError}
              </div>
            )}

            <form onSubmit={handleFuelSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Vehicle Asset</label>
                  <select
                    value={fuelForm.vehicleId}
                    onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}
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
                    value={fuelForm.driverId}
                    onChange={(e) => setFuelForm({ ...fuelForm, driverId: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Fuel Quantity (L/kWh)</label>
                  <input
                    type="text"
                    required
                    value={fuelForm.fuelQuantity}
                    onChange={(e) => setFuelForm({ ...fuelForm, fuelQuantity: e.target.value })}
                    placeholder="e.g. 150"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Fuel Invoiced Cost (₹)</label>
                  <input
                    type="text"
                    required
                    value={fuelForm.cost}
                    onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })}
                    placeholder="e.g. 3500"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Fuel Station</label>
                <input
                  type="text"
                  required
                  value={fuelForm.fuelStation}
                  onChange={(e) => setFuelForm({ ...fuelForm, fuelStation: e.target.value })}
                  placeholder="e.g. Pilot Station #44, Tacoma WA"
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Current Odometer (km)</label>
                  <input
                    type="text"
                    required
                    value={fuelForm.mileage}
                    onChange={(e) => setFuelForm({ ...fuelForm, mileage: e.target.value })}
                    placeholder="e.g. 45000"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Corporate Card Used</label>
                  <input
                    type="text"
                    required
                    value={fuelForm.paymentMethod}
                    onChange={(e) => setFuelForm({ ...fuelForm, paymentMethod: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Refuel Date</label>
                <input
                  type="date"
                  value={fuelForm.date}
                  onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })}
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-[#ffb95f] text-[#472a00] py-2.5 rounded-lg text-xs font-bold transition-all mt-4 cursor-pointer"
              >
                Log Refuel Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000a0] backdrop-blur-sm p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-fade-in">
            <button 
              onClick={() => setIsExpenseModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-highest cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-display text-base font-extrabold text-on-surface flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              File Fleet Expense Invoice
            </h4>

            {expenseError && (
              <div className="p-2.5 bg-error-container/10 border border-error/30 text-error rounded-lg text-[11px] font-semibold mb-4 animate-fade-in">
                {expenseError}
              </div>
            )}

            <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Expense category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  >
                    <option value="Maintenance">Maintenance Servicing</option>
                    <option value="Insurance">Insurance Policy</option>
                    <option value="Toll">Road Toll Pass</option>
                    <option value="Salary">Contractor Driver Salary</option>
                    <option value="Repair">Mechanical Repairs</option>
                    <option value="Other">Other Miscellaneous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Invoice amount (₹)</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="e.g. 450"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-[#FFB951] text-xs focus:border-primary font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Expense Description / Business Justification</label>
                <input
                  type="text"
                  required
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="e.g. Good To Go automated toll pass account refilling"
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Associated Vehicle</label>
                  <select
                    value={expenseForm.vehicleId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  >
                    <option value="">None (Company General)</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Associated Driver Crew</label>
                  <select
                    value={expenseForm.driverId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, driverId: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  >
                    <option value="">None (Company General)</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Date Paid</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Initial Audit Status</label>
                  <select
                    value={expenseForm.status}
                    onChange={(e) => setExpenseForm({ ...expenseForm, status: e.target.value as any })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  >
                    <option value="Pending">Pending Audit Clearance</option>
                    <option value="Approved">Pre-Approved</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-[#ffb95f] text-[#472a00] py-2.5 rounded-lg text-xs font-bold transition-all mt-4 cursor-pointer"
              >
                File Expense & Notify Audit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
