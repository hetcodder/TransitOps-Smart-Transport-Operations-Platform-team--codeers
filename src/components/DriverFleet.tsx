import React, { useState } from "react";
import { 
  User, 
  Truck, 
  Award, 
  ShieldAlert, 
  CheckCircle2, 
  Star, 
  Trash2, 
  Edit3, 
  Filter, 
  MapPin, 
  AlertTriangle 
} from "lucide-react";
import { Driver } from "../types";

interface DriverFleetProps {
  drivers: Driver[];
  onAddClick: () => void;
  onEditClick: (driver: Driver) => void;
  onDeleteClick: (id: string) => void;
  searchQuery: string;
}

export default function DriverFleet({
  drivers,
  onAddClick,
  onEditClick,
  onDeleteClick,
  searchQuery,
}: DriverFleetProps) {
  
  // Filtering states
  const [safetyFilter, setSafetyFilter] = useState<string>("All Scores");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [regionFilter, setRegionFilter] = useState<string>("Global");

  // Filtering logic
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.assignedVehicle.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesSafety = true;
    if (safetyFilter === "90% - 100%") {
      matchesSafety = d.safetyScore >= 90;
    } else if (safetyFilter === "80% - 89%") {
      matchesSafety = d.safetyScore >= 80 && d.safetyScore < 90;
    } else if (safetyFilter === "Below 80%") {
      matchesSafety = d.safetyScore < 80;
    }

    const matchesStatus = statusFilter === "All Status" || d.status === statusFilter;
    const matchesRegion = regionFilter === "Global" || d.region === regionFilter;

    return matchesSearch && matchesSafety && matchesStatus && matchesRegion;
  });

  const getStatusBadge = (status: Driver["status"]) => {
    switch (status) {
      case "On Duty":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 text-[10px] font-extrabold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            ON DUTY
          </div>
        );
      case "Off Duty":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-highest/60 text-on-surface-variant rounded-full border border-outline-variant/30 text-[10px] font-extrabold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 bg-on-surface-variant/50 rounded-full" />
            OFF DUTY
          </div>
        );
      case "Suspended":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-error-container/20 text-error rounded-full border border-error/30 text-[10px] font-extrabold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 bg-error rounded-full" />
            SUSPENDED
          </div>
        );
    }
  };

  const getLicenseNotice = (driver: Driver) => {
    if (driver.status === "Suspended") {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-error/10 text-error border border-error/20 rounded-lg text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 text-error" />
          <span>Incident Report Pending</span>
        </div>
      );
    }

    if (driver.licenseExpiryDays <= 30) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/15 text-orange-400 border border-orange-500/25 rounded-lg text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 text-orange-400 animate-bounce" />
          <span>License expires in {driver.licenseExpiryDays} days</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-high text-on-surface-variant/80 border border-outline-variant/20 rounded-lg text-xs">
        <CheckCircle2 className="w-4 h-4 text-primary" />
        <span>License valid until 2028</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and Filters Header matches mockup 2 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
        <div>
          <h3 className="font-display text-sm font-bold text-on-surface-variant">
            ACTIVE FLEET LOGISTICS
          </h3>
          <p className="text-xs text-on-surface-variant/60">
            Real-time verification of driver safety scores and duty rosters.
          </p>
        </div>

        {/* Dropdown filters */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Safety filter */}
          <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/30 px-3 py-2 rounded-lg text-xs font-semibold">
            <span className="text-[10px] uppercase text-on-surface-variant/70">Safety Score:</span>
            <select 
              value={safetyFilter} 
              onChange={(e) => setSafetyFilter(e.target.value)}
              className="bg-transparent border-none text-on-surface p-0 focus:ring-0 cursor-pointer pr-6 font-black text-xs"
            >
              <option className="bg-surface-container">All Scores</option>
              <option className="bg-surface-container">90% - 100%</option>
              <option className="bg-surface-container">80% - 89%</option>
              <option className="bg-surface-container">Below 80%</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/30 px-3 py-2 rounded-lg text-xs font-semibold">
            <span className="text-[10px] uppercase text-on-surface-variant/70">Status:</span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-on-surface p-0 focus:ring-0 cursor-pointer pr-6 font-black text-xs"
            >
              <option className="bg-surface-container">All Status</option>
              <option className="bg-surface-container">On Duty</option>
              <option className="bg-surface-container">Off Duty</option>
              <option className="bg-surface-container">Suspended</option>
            </select>
          </div>

          {/* Region filter */}
          <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/30 px-3 py-2 rounded-lg text-xs font-semibold">
            <span className="text-[10px] uppercase text-on-surface-variant/70">Region:</span>
            <select 
              value={regionFilter} 
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-transparent border-none text-on-surface p-0 focus:ring-0 cursor-pointer pr-6 font-black text-xs"
            >
              <option className="bg-surface-container">Global</option>
              <option className="bg-surface-container">North Hub</option>
              <option className="bg-surface-container">West Coast</option>
              <option className="bg-surface-container">Central Park</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of driver profiles */}
      {filteredDrivers.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-outline-variant/30">
          <User className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-4" />
          <h4 className="font-display font-bold text-on-surface text-sm">No Operators Found</h4>
          <p className="text-xs text-on-surface-variant/60 mt-1">
            Try adjusting your search criteria or filtering constraints.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDrivers.map((d) => {
            return (
              <div 
                key={d.id}
                className="glass-panel p-6 rounded-2xl transition-all duration-300 border border-outline-variant/20 hover:border-primary/50 hover:-translate-y-0.5 group cursor-pointer flex flex-col justify-between h-auto"
              >
                {/* Header Profile Photo & Level */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/20 bg-surface-container-high flex-shrink-0">
                        <img 
                          src={d.avatar} 
                          alt={d.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute -bottom-1.5 -right-1.5 bg-primary text-[#472a00] font-sans text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                        LVL {d.level || 1}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {getStatusBadge(d.status)}
                      <span className="font-mono text-xs text-on-surface-variant/80 font-medium">
                        ID: {d.id}
                      </span>
                    </div>
                  </div>

                  {/* Name and assigned Vehicle */}
                  <div className="mb-4">
                    <h3 className="font-display text-base font-extrabold text-on-surface group-hover:text-primary transition-colors leading-tight">
                      {d.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-on-surface-variant mt-1.5">
                      <Truck className="w-3.5 h-3.5 text-on-surface-variant/70" />
                      <span className="text-xs font-sans font-medium text-on-surface-variant">
                        Assigned: <span className="text-secondary font-bold">{d.assignedVehicle}</span>
                      </span>
                    </div>
                  </div>

                  {/* Core Experience and Duty performance Metrics */}
                  <div className="flex justify-between items-center gap-4 py-4 border-y border-outline-variant/20">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <p className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                          Experience
                        </p>
                        <p className="font-display text-sm font-extrabold text-on-surface mt-0.5">
                          {d.experienceYears} Years
                        </p>
                      </div>
                      <div>
                        <p className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                          Trips
                        </p>
                        <p className="font-display text-sm font-extrabold text-on-surface mt-0.5">
                          {d.tripsCount}
                        </p>
                      </div>
                    </div>

                    {/* Circular Progress Ring matches mockup perfectly */}
                    <div className="relative flex items-center justify-center flex-shrink-0">
                      <div 
                        className="w-14 h-14 circular-progress flex items-center justify-center rounded-full"
                        style={{ "--percentage": d.safetyScore } as React.CSSProperties}
                      >
                        <span className="font-display text-xs font-extrabold text-primary">
                          {d.safetyScore}
                        </span>
                      </div>
                      <div className="absolute -bottom-5 text-[8px] font-bold text-on-surface-variant/65 tracking-wider uppercase font-sans whitespace-nowrap">
                        SAFETY INDEX
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls & License details */}
                <div className="mt-6 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant/70">Efficiency Index</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/25 rounded font-extrabold font-sans text-[10px]">
                      {d.efficiencyRating}
                    </span>
                  </div>

                  {getLicenseNotice(d)}

                  {/* Individual Profile Modifier Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-outline-variant/10">
                    <button 
                      onClick={() => onEditClick(d)}
                      className="p-1.5 hover:bg-surface-container-highest/60 rounded-lg text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      title="Edit Operator Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Remove driver ${d.name} from roster?`)) onDeleteClick(d.id);
                      }}
                      className="p-1.5 hover:bg-surface-container-highest/60 rounded-lg text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      title="Remove Operator"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
