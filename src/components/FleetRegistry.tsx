import React, { useState } from "react";
import { 
  Filter, 
  Globe, 
  Battery, 
  Eye, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Archive, 
  Edit3, 
  Trash2, 
  Plus,
  Compass,
  AlertTriangle,
  Zap,
  Gauge
} from "lucide-react";
import { Vehicle } from "../types";

interface FleetRegistryProps {
  vehicles: Vehicle[];
  onAddClick: () => void;
  onEditClick: (vehicle: Vehicle) => void;
  onDeleteClick: (id: string) => void;
  searchQuery: string;
}

export default function FleetRegistry({
  vehicles,
  onAddClick,
  onEditClick,
  onDeleteClick,
  searchQuery,
}: FleetRegistryProps) {
  
  // Local Filtering states
  const [filterType, setFilterType] = useState<string>("All");
  const [filterRegion, setFilterRegion] = useState<string>("All");
  const [filterFuel, setFilterFuel] = useState<string>("All");

  // Selection states for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Unique lists for dropdowns
  const vehicleTypes = ["All", "Heavy Truck", "Support Pickup", "Delivery Van"];
  const regions = ["All", "North Hub", "West Coast", "Central Park"];
  const fuelTypes = ["All", "EV", "Diesel", "Hybrid"];

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) => {
    // Search query matches id or name
    const matchesSearch = 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "All" || v.type === filterType;
    const matchesRegion = filterRegion === "All" || v.region === filterRegion;
    const matchesFuel = filterFuel === "All" || v.fuelType === filterFuel;

    return matchesSearch && matchesType && matchesRegion && matchesFuel;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredVehicles.map((v) => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  const clearAllFilters = () => {
    setFilterType("All");
    setFilterRegion("All");
    setFilterFuel("All");
    setSelectedIds([]);
  };

  const handleBulkArchive = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to archive ${selectedIds.length} selected vehicles?`)) {
      selectedIds.forEach((id) => onDeleteClick(id));
      setSelectedIds([]);
    }
  };

  const handleBulkExport = () => {
    if (selectedIds.length === 0) return;
    const selectedVehicles = vehicles.filter(v => selectedIds.includes(v.id));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedVehicles, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `transitops_fleet_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Helper colors for status badges
  const getStatusStyle = (status: Vehicle["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "Maintenance":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "In Transit":
        return "bg-secondary-container/20 text-secondary border border-secondary/20";
      default:
        return "bg-surface-variant text-on-surface-variant border border-outline-variant/30";
    }
  };

  // Render fuel icon / type label
  const getFuelDisplay = (fuelType: Vehicle["fuelType"], fuelLevel: number) => {
    const isEv = fuelType === "EV";
    return (
      <div className="space-y-1">
        <p className="text-xs text-on-surface flex items-center gap-1.5 font-sans font-medium">
          {isEv ? <Zap className="w-3.5 h-3.5 text-primary" /> : <Battery className="w-3.5 h-3.5 text-on-surface-variant" />}
          {fuelType} ({fuelLevel}%)
        </p>
        <div className="w-24 h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${fuelLevel < 50 ? "bg-error" : isEv ? "bg-primary" : "bg-blue-400"}`} 
            style={{ width: `${fuelLevel}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Fleet Stats Banner Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Fleet</p>
            <h3 className="font-display text-2xl lg:text-3xl font-extrabold text-on-surface mt-1">100</h3>
          </div>
          <div className="p-3 bg-surface-container-highest/60 rounded-lg text-primary border border-outline-variant/30">
            <Gauge className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Active</p>
            <h3 className="font-display text-2xl lg:text-3xl font-extrabold text-primary mt-1">84</h3>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-primary border border-primary/20">
            <CheckCircleIcon className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Maintenance</p>
            <h3 className="font-display text-2xl lg:text-3xl font-extrabold text-amber-500 mt-1">6</h3>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
            <WrenchIcon className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Inactive</p>
            <h3 className="font-display text-2xl lg:text-3xl font-extrabold text-on-surface-variant mt-1">10</h3>
          </div>
          <div className="p-3 bg-surface-container-highest/60 rounded-lg text-on-surface-variant border border-outline-variant/30">
            <ClockIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Advanced Filters & Bulk Actions Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 gap-4">
        <div className="flex items-center flex-wrap gap-3">
          {/* Filter Type */}
          <div className="flex items-center gap-1 bg-surface-container border border-outline-variant/30 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none text-on-surface p-0 focus:ring-0 cursor-pointer pr-5 font-bold"
            >
              {vehicleTypes.map(t => <option key={t} value={t} className="bg-surface-container text-on-surface">{t === "All" ? "Vehicle Type" : t}</option>)}
            </select>
          </div>

          {/* Filter Region */}
          <div className="flex items-center gap-1 bg-surface-container border border-outline-variant/30 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-on-surface-variant" />
            <select 
              value={filterRegion} 
              onChange={(e) => setFilterRegion(e.target.value)}
              className="bg-transparent border-none text-on-surface p-0 focus:ring-0 cursor-pointer pr-5 font-bold"
            >
              {regions.map(r => <option key={r} value={r} className="bg-surface-container text-on-surface">{r === "All" ? "Region" : r}</option>)}
            </select>
          </div>

          {/* Filter Fuel */}
          <div className="flex items-center gap-1 bg-surface-container border border-outline-variant/30 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-on-surface-variant" />
            <select 
              value={filterFuel} 
              onChange={(e) => setFilterFuel(e.target.value)}
              className="bg-transparent border-none text-on-surface p-0 focus:ring-0 cursor-pointer pr-5 font-bold"
            >
              {fuelTypes.map(f => <option key={f} value={f} className="bg-surface-container text-on-surface">{f === "All" ? "Fuel Type" : f}</option>)}
            </select>
          </div>

          {(filterType !== "All" || filterRegion !== "All" || filterFuel !== "All") && (
            <>
              <div className="h-6 w-px bg-outline-variant/30 hidden sm:block mx-1"></div>
              <button 
                onClick={clearAllFilters}
                className="text-primary text-xs font-extrabold hover:underline cursor-pointer"
              >
                Clear all
              </button>
            </>
          )}
        </div>

        {/* Selected Item Management Actions */}
        <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 border-outline-variant/20 pt-3 lg:pt-0">
          <p className="text-xs text-on-surface-variant font-medium">
            Selected: <span className="text-on-surface font-black">{selectedIds.length} items</span>
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBulkExport}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant/30 rounded-lg bg-surface hover:bg-surface-container-highest transition-colors text-xs font-bold text-on-surface disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button 
              onClick={handleBulkArchive}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant/30 rounded-lg bg-surface hover:bg-surface-container-highest transition-colors text-xs font-bold text-on-surface disabled:opacity-40 cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" /> Archive
            </button>
          </div>
        </div>
      </div>

      {/* Premium Table Container */}
      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-outline-variant/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 border-b border-outline-variant/30 text-on-surface-variant/70 text-[10px] font-bold uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox"
                    checked={filteredVehicles.length > 0 && selectedIds.length === filteredVehicles.length}
                    onChange={handleSelectAll}
                    className="rounded border-outline-variant/30 bg-transparent text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="p-4">Vehicle Details</th>
                <th className="p-4">Status</th>
                <th className="p-4">Fuel &amp; Health</th>
                <th className="p-4">Odometer</th>
                <th className="p-4">Maintenance</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant/70 text-xs">
                    No vehicles found matching the active monitoring filter settings.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => {
                  const isChecked = selectedIds.includes(v.id);
                  const isOverdue = v.maintenanceDate === "Overdue";
                  return (
                    <tr 
                      key={v.id}
                      className="hover:bg-surface-container-highest/25 transition-colors group"
                    >
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(v.id, e.target.checked)}
                          className="rounded border-outline-variant/30 bg-transparent text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-lg overflow-hidden border border-outline-variant/30 flex-shrink-0 bg-surface-container">
                            <img 
                              src={v.image} 
                              alt={v.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-display text-sm font-bold text-on-surface leading-tight">
                              {v.name}
                            </p>
                            <p className="font-mono text-[11px] text-on-surface-variant mt-0.5">
                              #{v.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(v.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            v.status === "Active" || v.status === "In Transit" 
                              ? "bg-green-400 animate-pulse" 
                              : "bg-amber-400"
                          }`} />
                          {v.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {getFuelDisplay(v.fuelType, v.fuelLevel)}
                      </td>
                      <td className="p-4 font-mono text-xs text-on-surface whitespace-nowrap">
                        {v.odometer.toLocaleString()} km
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`text-xs font-sans font-medium ${isOverdue ? "text-amber-500 font-bold" : "text-on-surface-variant/80"}`}>
                          {v.maintenanceDate}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 opacity-100 lg:opacity-60 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onEditClick(v)}
                            title="Edit details"
                            className="p-1.5 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Archive ${v.name} (#${v.id})?`)) onDeleteClick(v.id);
                            }}
                            title="Archive Vehicle"
                            className="p-1.5 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Console matching mockup 1 */}
        <div className="border-t border-outline-variant/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low/50">
          <p className="text-xs text-on-surface-variant/80">
            Showing 1 to {filteredVehicles.length} of {vehicles.length} vehicles
          </p>
          <div className="flex items-center gap-1.5">
            <button 
              disabled 
              className="p-1.5 rounded border border-outline-variant/30 hover:bg-surface-container-highest/60 transition-colors disabled:opacity-35 cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-on-surface-variant" />
            </button>
            <button className="w-7 h-7 rounded bg-primary text-[#472a00] font-bold text-xs">1</button>
            <button className="w-7 h-7 rounded hover:bg-surface-container-highest/50 transition-colors text-on-surface-variant text-xs cursor-pointer">2</button>
            <button className="w-7 h-7 rounded hover:bg-surface-container-highest/50 transition-colors text-on-surface-variant text-xs cursor-pointer">3</button>
            <span className="text-on-surface-variant/40 mx-0.5 text-xs">...</span>
            <button className="w-7 h-7 rounded hover:bg-surface-container-highest/50 transition-colors text-on-surface-variant text-xs cursor-pointer">10</button>
            <button className="p-1.5 rounded border border-outline-variant/30 hover:bg-surface-container-highest/50 transition-colors cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline mini helper icon components since we want to avoid extra local file dependencies
function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={props.className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WrenchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
