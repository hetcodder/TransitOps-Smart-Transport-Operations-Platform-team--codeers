import React, { useState, useEffect } from "react";
import { Trip, Vehicle, Driver } from "../types";
import { 
  Navigation, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Download, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  X, 
  Calendar,
  AlertCircle,
  TrendingUp,
  User,
  Truck
} from "lucide-react";

interface TripsManagerProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  searchQuery: string;
}

export default function TripsManager({ vehicles, drivers, searchQuery: globalSearch }: TripsManagerProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [localSearch, setLocalSearch] = useState("");

  // Modals & Forms
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [tripError, setTripError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<any>({
    name: "",
    customer: "",
    pickupLocation: "",
    dropLocation: "",
    route: "",
    vehicleId: "",
    driverId: "",
    cargoDetails: "",
    departureTime: new Date().toISOString().slice(0, 16),
    expectedArrival: new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 16),
    priority: "Medium",
    status: "Scheduled",
    distance: "120",
    fuelConsumption: "35"
  });

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/trips");
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch (err) {
      console.error("Error fetching trips:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleOpenCreate = () => {
    setSelectedTrip(null);
    setTripError(null);
    setFormData({
      name: "",
      customer: "",
      pickupLocation: "",
      dropLocation: "",
      route: "",
      vehicleId: vehicles[0]?.id || "",
      driverId: drivers[0]?.id || "",
      cargoDetails: "",
      departureTime: new Date().toISOString().slice(0, 16),
      expectedArrival: new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 16),
      priority: "Medium",
      status: "Scheduled",
      distance: "150",
      fuelConsumption: "40"
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (trip: Trip) => {
    setSelectedTrip(trip);
    setTripError(null);
    setFormData({
      name: trip.name,
      customer: trip.customer,
      pickupLocation: trip.pickupLocation,
      dropLocation: trip.dropLocation,
      route: trip.route,
      vehicleId: trip.vehicleId,
      driverId: trip.driverId,
      cargoDetails: trip.cargoDetails,
      departureTime: new Date(trip.departureTime).toISOString().slice(0, 16),
      expectedArrival: new Date(trip.expectedArrival).toISOString().slice(0, 16),
      priority: trip.priority,
      status: trip.status,
      distance: String(trip.distance),
      fuelConsumption: String(trip.fuelConsumption)
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTripError(null);

    const distStr = String(formData.distance).trim();
    if (!/^\d+(\.\d+)?$/.test(distStr)) {
      setTripError("Estimated Distance must be a valid positive number.");
      return;
    }
    const distanceNum = Number(distStr);

    const fuelStr = String(formData.fuelConsumption).trim();
    if (!/^\d+(\.\d+)?$/.test(fuelStr)) {
      setTripError("Fuel Reserve Outflow must be a valid positive number.");
      return;
    }
    const fuelNum = Number(fuelStr);

    const payload = {
      ...formData,
      distance: distanceNum,
      fuelConsumption: fuelNum,
      vehicleName: vehicles.find(v => v.id === formData.vehicleId)?.name || "Unknown Vehicle",
      driverName: drivers.find(d => d.id === formData.driverId)?.name || "Unknown Driver",
    };

    const url = selectedTrip ? `/api/trips/${selectedTrip.id}` : "/api/trips";
    const method = selectedTrip ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsFormOpen(false);
        fetchTrips();
      } else {
        const errData = await res.json();
        setTripError(errData.error || "Failed to save trip telemetry.");
      }
    } catch (err: any) {
      setTripError(err.message || "A network error occurred.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete/archive this trip log?")) return;
    try {
      const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTrips();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelTrip = async (trip: Trip) => {
    try {
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...trip, status: "Cancelled" })
      });
      if (res.ok) fetchTrips();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrackTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsTrackingOpen(true);
  };

  // CSV Export
  const exportToCSV = () => {
    const headers = "Trip ID,Trip Name,Customer,Pickup,Dropoff,Route,Vehicle,Driver,Status,Priority,Distance,Fuel\n";
    const rows = filteredTrips.map(t => 
      `"${t.id}","${t.name}","${t.customer}","${t.pickupLocation}","${t.dropLocation}","${t.route}","${t.vehicleId}","${t.driverId}","${t.status}","${t.priority}",${t.distance},${t.fuelConsumption}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TransitOps_Trips_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Stats Calculations
  const stats = {
    total: trips.length,
    active: trips.filter(t => t.status === "Active").length,
    completed: trips.filter(t => t.status === "Completed").length,
    delayed: trips.filter(t => t.status === "Delayed").length,
    cancelled: trips.filter(t => t.status === "Cancelled").length,
    revenue: trips.filter(t => t.status === "Completed").reduce((acc, cur) => acc + (cur.distance * 3.5), 0)
  };

  // Filtering
  const query = (localSearch || globalSearch).toLowerCase().trim();
  const filteredTrips = trips.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(query) ||
      t.id.toLowerCase().includes(query) ||
      t.customer.toLowerCase().includes(query) ||
      t.pickupLocation.toLowerCase().includes(query) ||
      t.dropLocation.toLowerCase().includes(query) ||
      (t.route || "").toLowerCase().includes(query);

    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header & Actions bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container/30 p-4 rounded-xl border border-outline-variant/20">
        <div>
          <h3 className="font-display text-base font-extrabold text-on-surface">Route Matrix Logs</h3>
          <p className="text-xs text-on-surface-variant/70 mt-0.5">Tactical route scheduling, driver tracking, and commercial cargo dispatches.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={exportToCSV}
            className="flex-1 sm:flex-initial bg-surface-container hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button 
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-initial bg-primary hover:bg-[#ffb95f] text-[#472a00] px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            New Trip Plan
          </button>
        </div>
      </div>

      {/* 2. Operations KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: "Total Trips", val: stats.total, color: "text-primary bg-primary/5 border-primary/20" },
          { label: "Active", val: stats.active, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" },
          { label: "Completed", val: stats.completed, color: "text-blue-400 bg-blue-500/5 border-blue-500/20" },
          { label: "Delayed", val: stats.delayed, color: "text-amber-400 bg-amber-500/5 border-amber-500/20" },
          { label: "Cancelled", val: stats.cancelled, color: "text-rose-400 bg-rose-500/5 border-rose-500/20" },
          { label: "Est. Revenue", val: `$${stats.revenue.toLocaleString()}`, color: "text-purple-400 bg-purple-500/5 border-purple-500/20" },
        ].map((c, i) => (
          <div key={i} className={`p-4 rounded-xl border ${c.color} flex flex-col justify-between h-24 shadow-sm`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">{c.label}</span>
            <span className="text-xl font-extrabold font-display leading-none mt-2">{c.val}</span>
          </div>
        ))}
      </div>

      {/* 3. Search & Advanced Filtering Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search trips..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface text-xs"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-surface-container/50 border border-outline-variant/30 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-on-surface focus:outline-none cursor-pointer font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Active">Active</option>
              <option value="Delayed">Delayed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5 bg-surface-container/50 border border-outline-variant/30 rounded-lg px-2.5 py-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-on-surface-variant" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-on-surface focus:outline-none cursor-pointer font-semibold"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Trips Data Telemetry Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-on-surface-variant">Gathering route matrices...</div>
          ) : filteredTrips.length === 0 ? (
            <div className="p-12 text-center text-xs text-on-surface-variant">No route dispatches matching filters found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">
                  <th className="py-4 px-6">Trip ID</th>
                  <th className="py-4 px-4">Customer & Name</th>
                  <th className="py-4 px-4">Assigned Crew / Vehicle</th>
                  <th className="py-4 px-4">Route Coordinates</th>
                  <th className="py-4 px-4 text-center">Schedule Status</th>
                  <th className="py-4 px-4 text-right">Fuel Log</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredTrips.map((trip) => {
                  const matchedVehicle = vehicles.find(v => v.id === trip.vehicleId);
                  const matchedDriver = drivers.find(d => d.id === trip.driverId);
                  return (
                    <tr key={trip.id} className="hover:bg-surface-container/20 transition-all text-xs">
                      <td className="py-4 px-6 font-mono text-primary font-bold">
                        {trip.id}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-on-surface">{trip.name}</div>
                        <div className="text-[10px] text-on-surface-variant/60 font-semibold">{trip.customer}</div>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <User className="w-3.5 h-3.5 text-primary" />
                          <span>{matchedDriver?.name || trip.driverId}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <Truck className="w-3.5 h-3.5 text-secondary-variant" />
                          <span>{matchedVehicle?.name || trip.vehicleId}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-on-surface font-semibold">
                          <span>{trip.pickupLocation}</span>
                          <ArrowRight className="w-3 h-3 text-on-surface-variant" />
                          <span>{trip.dropLocation}</span>
                        </div>
                        <div className="text-[10px] text-on-surface-variant/50 mt-0.5 italic">{trip.route}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                          trip.status === "Active" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                          trip.status === "Delayed" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                          trip.status === "Completed" ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" :
                          trip.status === "Cancelled" ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" :
                          "bg-surface-container-highest text-on-surface-variant border border-outline-variant/30"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            trip.status === "Active" ? "bg-emerald-400" :
                            trip.status === "Delayed" ? "bg-amber-400" :
                            trip.status === "Completed" ? "bg-blue-400" :
                            trip.status === "Cancelled" ? "bg-rose-400" : "bg-on-surface-variant/60"
                          }`} />
                          {trip.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono text-on-surface font-extrabold">{trip.distance} km</div>
                        <div className="text-[10px] text-on-surface-variant/50 mt-0.5">{trip.fuelConsumption} L/kWh est</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleTrackTrip(trip)}
                            title="Track Live telemetry"
                            className="p-1.5 hover:bg-primary/20 rounded-lg text-primary transition-colors cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-primary" />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(trip)}
                            className="p-1.5 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          {trip.status !== "Cancelled" && trip.status !== "Completed" && (
                            <button 
                              onClick={() => handleCancelTrip(trip)}
                              title="Cancel operational trip"
                              className="p-1.5 hover:bg-amber-500/20 rounded-lg text-amber-500 transition-colors cursor-pointer"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(trip.id)}
                            className="p-1.5 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 5. Create / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000a0] backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-fade-in my-8">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-highest cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-display text-base font-extrabold text-on-surface flex items-center gap-2 mb-4">
              <Navigation className="w-5 h-5 text-primary" />
              {selectedTrip ? "Modify Dispatched Route plan" : "Establish New Route Dispatch"}
            </h4>

            {tripError && (
              <div className="p-2.5 bg-error-container/10 border border-error/30 text-error rounded-lg text-[11px] font-semibold mb-4 animate-fade-in">
                {tripError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Trip Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Seattle West Logistics Node"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Customer Client</label>
                  <input
                    type="text"
                    required
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    placeholder="e.g. Amazon Freight"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Pickup Coordinate</label>
                  <input
                    type="text"
                    required
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    placeholder="Seattle WA Station"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Drop Coordinate</label>
                  <input
                    type="text"
                    required
                    value={formData.dropLocation}
                    onChange={(e) => setFormData({ ...formData, dropLocation: e.target.value })}
                    placeholder="Portland OR Depot"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Assigned Highway Route</label>
                <input
                  type="text"
                  required
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  placeholder="I-5 Southbound bypass Seattle"
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Vehicle Selection</label>
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
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Driver Selection</label>
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
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Cargo Freight / Weight Details</label>
                <input
                  type="text"
                  value={formData.cargoDetails}
                  onChange={(e) => setFormData({ ...formData, cargoDetails: e.target.value })}
                  placeholder="Heavy Refrigerated Commodities (e.g. Apples 14 tons)"
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Departure Schedule</label>
                  <input
                    type="datetime-local"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Expected ETA Schedule</label>
                  <input
                    type="datetime-local"
                    value={formData.expectedArrival}
                    onChange={(e) => setFormData({ ...formData, expectedArrival: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Dispatch Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Status Control</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Active">Active</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Est. Distance (km)</label>
                  <input
                    type="text"
                    required
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    placeholder="e.g. 150"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Fuel Reserve Outflow (L)</label>
                  <input
                    type="text"
                    required
                    value={formData.fuelConsumption}
                    onChange={(e) => setFormData({ ...formData, fuelConsumption: e.target.value })}
                    placeholder="e.g. 40"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-[#ffb95f] text-[#472a00] py-2.5 rounded-lg text-xs font-bold transition-all mt-4 cursor-pointer"
              >
                {selectedTrip ? "Commit Modified Dispatches" : "Execute Fleet Dispatch"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Live Telemetry Tracking Drawer */}
      {isTrackingOpen && selectedTrip && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-[#000000a0] backdrop-blur-sm">
          <div className="bg-surface-container-low border-l border-outline-variant/40 h-full w-full max-w-md shadow-2xl p-6 relative flex flex-col justify-between animate-fade-in">
            <div>
              <button 
                onClick={() => setIsTrackingOpen(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-highest cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4 text-xs mt-6">
                <div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-500/20">
                    Live Telemetry active
                  </span>
                  <h4 className="font-display text-lg font-black text-on-surface mt-2">{selectedTrip.name}</h4>
                  <p className="text-on-surface-variant/60 font-semibold">{selectedTrip.customer}</p>
                </div>

                <div className="border-t border-outline-variant/25 pt-4 space-y-4">
                  {/* Coordinates Map simulation */}
                  <div className="w-full h-44 bg-surface-container rounded-xl overflow-hidden border border-outline-variant/30 relative flex flex-col justify-between p-4">
                    <div className="absolute inset-0 bg-[radial-gradient(#ff980020_1px,transparent_1px)] [background-size:16px_16px]" />
                    
                    {/* Live Marker */}
                    <div className="absolute top-1/2 left-1/3 -translate-y-1/2 flex flex-col items-center gap-1">
                      <div className="w-3 h-3 bg-primary rounded-full animate-ping absolute" />
                      <div className="w-3 h-3 bg-primary rounded-full relative border border-[#0F1115]" />
                      <span className="bg-[#0F1115]/90 text-[9px] font-mono font-bold px-1 py-0.5 rounded border border-outline-variant/30 shadow whitespace-nowrap">
                        GPS Active Semis ({selectedTrip.vehicleId})
                      </span>
                    </div>

                    <div className="flex justify-between items-start relative z-10">
                      <div className="bg-[#0F1115]/85 p-2 rounded-lg border border-outline-variant/20 max-w-[45%]">
                        <div className="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">Origin</div>
                        <div className="font-extrabold truncate text-on-surface">{selectedTrip.pickupLocation}</div>
                      </div>
                      <div className="bg-[#0F1115]/85 p-2 rounded-lg border border-outline-variant/20 max-w-[45%]">
                        <div className="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">Destination</div>
                        <div className="font-extrabold truncate text-on-surface">{selectedTrip.dropLocation}</div>
                      </div>
                    </div>

                    <div className="relative z-10 flex justify-between bg-[#0F1115]/90 p-2 rounded-lg border border-outline-variant/30 items-center">
                      <div className="font-mono text-xs">Route Progress: **52%**</div>
                      <div className="font-mono text-primary font-bold text-xs">ETA: 42 mins</div>
                    </div>
                  </div>

                  {/* Operational indicators */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface-container/30 p-3 rounded-lg border border-outline-variant/25">
                      <div className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-wide">Expected Departure</div>
                      <div className="font-extrabold text-on-surface mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {new Date(selectedTrip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="bg-surface-container/30 p-3 rounded-lg border border-outline-variant/25">
                      <div className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-wide">Expected Arrival</div>
                      <div className="font-extrabold text-on-surface mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {new Date(selectedTrip.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-extrabold text-on-surface uppercase tracking-wider text-[10px]">Operational Checklist:</h5>
                    <div className="space-y-2">
                      {[
                        { label: "Driver Authenticated", status: true },
                        { label: "Cargo Loading Manifest Approved", status: true },
                        { label: "Vehicle System Health Diagnostic Clearance", status: true },
                        { label: "Route Obstacle Weather Scanned", status: true },
                        { label: "Final Cargo Door Lock Biometrics", status: selectedTrip.status !== "Scheduled" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          {item.status ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-on-surface-variant/50" />
                          )}
                          <span className={`${item.status ? "text-on-surface" : "text-on-surface-variant/50"} font-semibold`}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsTrackingOpen(false)}
              className="w-full bg-surface-container-highest hover:bg-outline-variant/50 border border-outline-variant/30 text-on-surface py-2.5 rounded-lg text-xs font-extrabold transition-all mt-4 cursor-pointer"
            >
              Close Telemetry Feed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
