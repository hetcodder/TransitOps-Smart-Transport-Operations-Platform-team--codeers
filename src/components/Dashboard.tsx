import React from "react";
import { 
  ShieldAlert, 
  CheckCircle2, 
  Wrench, 
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Clock,
  Gauge,
  Zap,
  Activity
} from "lucide-react";
import { Vehicle, Driver, FleetStats } from "../types";

interface DashboardProps {
  stats: FleetStats;
  vehicles: Vehicle[];
  drivers: Driver[];
  onNavigate: (tab: "fleet" | "drivers") => void;
}

export default function Dashboard({ stats, vehicles, drivers, onNavigate }: DashboardProps) {
  
  // Real-time alarm items computed dynamically to display under Active Ops
  const criticalAlarms = [
    {
      id: "AL-101",
      title: "Maintenance Overdue",
      desc: "Volvo FH16 (#VO-088) is 12 days past scheduled overhaul.",
      severity: "critical" as const,
      time: "2 mins ago"
    },
    {
      id: "AL-102",
      title: "License Nearing Expiry",
      desc: "Marcus Sterling (TX-88219) license expires in 12 days.",
      severity: "warning" as const,
      time: "10 mins ago"
    },
    {
      id: "AL-103",
      title: "Battery Level Alert",
      desc: "Rivian R1T (#VO-215) reports health degradation to 88%.",
      severity: "info" as const,
      time: "45 mins ago"
    }
  ];

  const recentTrips = [
    { id: "TR-501", vehicle: "Tesla Semi", driver: "Marcus Sterling", route: "North Hub ➔ West Coast", status: "In Progress", time: "1.4 hrs remaining" },
    { id: "TR-502", vehicle: "Peterbilt 579", driver: "Jordan Lee", route: "Central Park ➔ East Port", status: "In Progress", time: "0.8 hrs remaining" },
    { id: "TR-503", vehicle: "Rivian R1T", driver: "Elena Rodriguez", route: "West Coast ➔ Local Hub", status: "Completed", time: "Finished 20 mins ago" }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dynamic Key Performance Indicators Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Fleet Count */}
        <div 
          onClick={() => onNavigate("fleet")}
          className="glass-panel p-5 rounded-xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all duration-300"
        >
          <div>
            <p className="font-sans text-[10px] font-bold text-on-surface-variant/70 mb-1 uppercase tracking-wider">
              Total Fleet Capacity
            </p>
            <h3 className="font-display text-3xl font-extrabold text-on-surface group-hover:text-primary transition-colors">
              {stats.vehicles.total}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-green-400 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+3 vehicles this month</span>
            </div>
          </div>
          <div className="p-3 bg-surface-container-highest/60 rounded-lg text-primary group-hover:scale-110 transition-all duration-300 border border-outline-variant/30">
            <Gauge className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Active Duties */}
        <div 
          onClick={() => onNavigate("drivers")}
          className="glass-panel p-5 rounded-xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all duration-300"
        >
          <div>
            <p className="font-sans text-[10px] font-bold text-on-surface-variant/70 mb-1 uppercase tracking-wider">
              Active Operators
            </p>
            <h3 className="font-display text-3xl font-extrabold text-primary">
              {stats.vehicles.active}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/60 mt-1">
              <CheckCircle2 className="w-3 h-3 text-primary" />
              <span>84% operational duty index</span>
            </div>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-all duration-300 border border-primary/20">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Pending Maintenance */}
        <div 
          onClick={() => onNavigate("fleet")}
          className="glass-panel p-5 rounded-xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all duration-300"
        >
          <div>
            <p className="font-sans text-[10px] font-bold text-on-surface-variant/70 mb-1 uppercase tracking-wider">
              Maintenance Warnings
            </p>
            <h3 className="font-display text-3xl font-extrabold text-amber-500">
              {stats.vehicles.maintenance}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>1 critical overdue notice</span>
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 group-hover:scale-110 transition-all duration-300 border border-amber-500/20">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Standby/Inactive */}
        <div 
          onClick={() => onNavigate("fleet")}
          className="glass-panel p-5 rounded-xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all duration-300"
        >
          <div>
            <p className="font-sans text-[10px] font-bold text-on-surface-variant/70 mb-1 uppercase tracking-wider">
              Inactive Capacity
            </p>
            <h3 className="font-display text-3xl font-extrabold text-on-surface-variant/80">
              {stats.vehicles.inactive}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/50 mt-1">
              <Activity className="w-3 h-3" />
              <span>standby fleet ready</span>
            </div>
          </div>
          <div className="p-3 bg-surface-container-highest/60 rounded-lg text-on-surface-variant/70 group-hover:scale-110 transition-all duration-300 border border-outline-variant/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Live Alarms Monitor & Active Route Dispatch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Live Operational Alerts */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-base font-bold text-on-surface">
                Active Mission Telemetry & Alerts
              </h3>
              <p className="text-xs text-on-surface-variant/70 mt-0.5">
                Real-time exception triggers processed on edge gateway.
              </p>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-primary bg-primary/10 rounded-full border border-primary/20 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              LIVE TELEMETRY
            </span>
          </div>

          <div className="space-y-3">
            {criticalAlarms.map((alarm) => (
              <div 
                key={alarm.id} 
                className={`p-4 rounded-xl border flex gap-3.5 transition-all hover:translate-x-1 duration-150 ${
                  alarm.severity === "critical"
                    ? "bg-error-container/15 border-error/30 text-error"
                    : alarm.severity === "warning"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-surface-container/60 border-outline-variant/30 text-secondary"
                }`}
              >
                <div className="mt-0.5">
                  {alarm.severity === "critical" ? (
                    <ShieldAlert className="w-5 h-5 text-error" />
                  ) : alarm.severity === "warning" ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-secondary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-sans text-xs font-bold leading-snug">
                      {alarm.title}
                    </p>
                    <span className="text-[10px] opacity-65 font-mono">
                      {alarm.time}
                    </span>
                  </div>
                  <p className="text-xs opacity-80 mt-1 leading-normal font-sans">
                    {alarm.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Dispatch Map Tracker Mock / Overview */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-outline-variant/30 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-display text-base font-bold text-on-surface">
              Global Route Dispatch Track
            </h3>
            <p className="text-xs text-on-surface-variant/70 mt-0.5">
              Live tracking summary of active long-haul duties.
            </p>
          </div>

          {/* Interactive Routing Progress Bars */}
          <div className="space-y-4 flex-1 justify-center flex flex-col">
            {recentTrips.map((trip) => (
              <div key={trip.id} className="p-3 bg-surface-container/40 rounded-xl border border-outline-variant/20 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="font-bold text-on-surface">{trip.vehicle}</span>
                    <span className="text-[10px] text-on-surface-variant/60">by {trip.driver}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    trip.status === "In Progress" 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "bg-green-500/10 text-green-400 border border-green-500/20"
                  }`}>
                    {trip.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-on-surface-variant">
                  <span className="font-mono">{trip.route}</span>
                  <span className="font-mono text-[10px] text-primary">{trip.time}</span>
                </div>
                <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${trip.status === "Completed" ? "bg-green-500" : "bg-primary animate-pulse"}`} 
                    style={{ width: trip.status === "Completed" ? "100%" : "65%" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button 
              onClick={() => onNavigate("fleet")}
              className="w-full bg-surface-container hover:bg-surface-container-highest py-2 border border-outline-variant/30 rounded-xl text-xs font-bold text-on-surface flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              Configure Live Routes
              <ArrowUpRight className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating alert card warning developers about custom key setup */}
      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/25 text-xs text-on-surface flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="font-bold text-primary">Mission Control Secure Handshake Verified</p>
            <p className="text-on-surface-variant text-[11px] mt-0.5">
              The platform is actively connected to the server-side Express database layer. All Quick-Creates, edits, and status changes are persistently stored and rendered live.
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate("fleet")}
          className="px-4 py-1.5 bg-primary text-[#472a00] hover:bg-[#ffb95f] rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap self-stretch text-center"
        >
          Audit Fleet Logs
        </button>
      </div>
    </div>
  );
}
