import React, { useState, useEffect } from "react";
import { CalendarEvent } from "../types";
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Trash2, 
  Clock, 
  Tag, 
  X,
  Check
} from "lucide-react";

export default function CalendarManager() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");

  // Current Date focus
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 12)); // July 2026 for mock consistency
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [selectedDayString, setSelectedDayString] = useState("2026-07-12");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    start: "2026-07-12T09:00",
    type: "Meeting" as "Trip" | "Maintenance" | "Driver Shift" | "Vehicle Service" | "Meeting" | "Other",
    description: "",
    color: "#8b5cf6"
  });

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/calendarEvents");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
        // Set initial selected day events
        const dayString = currentDate.toISOString().split("T")[0];
        const dayEvents = data.filter((e: any) => e.start.startsWith(dayString));
        setSelectedDayEvents(dayEvents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (dayNum: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(dayNum).padStart(2, "0");
    const fullDayString = `${year}-${month}-${dayStr}`;
    
    setSelectedDayString(fullDayString);
    const dayEvents = events.filter(e => e.start.startsWith(fullDayString));
    setSelectedDayEvents(dayEvents);
  };

  const handleOpenCreate = () => {
    setFormData({
      title: "",
      start: `${selectedDayString}T09:00`,
      type: "Meeting",
      description: "",
      color: "#8b5cf6"
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const typeColors = {
      Trip: "#e08d3c",
      Maintenance: "#ef4444",
      "Driver Shift": "#3b82f6",
      "Vehicle Service": "#10b981",
      Meeting: "#8b5cf6",
      Other: "#6b7280"
    };

    const payload = {
      ...formData,
      color: typeColors[formData.type] || "#FFB951"
    };

    try {
      const res = await fetch("/api/calendarEvents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled calendar event?")) return;
    try {
      const res = await fetch(`/api/calendarEvents/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchEvents();
        setSelectedDayEvents(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Month Generation helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Filtered Events map helper
  const filteredEvents = events.filter(e => filterType === "All" || e.type === filterType);

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6 animate-fade-in text-xs text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container/30 p-4 rounded-xl border border-outline-variant/20">
        <div>
          <h3 className="font-display text-base font-extrabold text-on-surface">Integrated Fleet Scheduler</h3>
          <p className="text-xs text-on-surface-variant/70 mt-0.5">Maintain real-time operational timelines, coordinate team briefings, and lock in preventative service dates.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-[#ffb95f] text-[#472a00] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          Schedule Event
        </button>
      </div>

      {/* Calendar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Grid card */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-1.5">
              <ChevronLeft onClick={handlePrevMonth} className="w-5 h-5 text-on-surface-variant hover:text-on-surface cursor-pointer" />
              <h4 className="font-display text-sm font-extrabold text-on-surface w-32 text-center">
                {monthNames[month]} {year}
              </h4>
              <ChevronRight onClick={handleNextMonth} className="w-5 h-5 text-on-surface-variant hover:text-on-surface cursor-pointer" />
            </div>

            <div className="flex items-center gap-1.5 bg-surface-container/50 border border-outline-variant/30 rounded-lg px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent border-none text-[11px] text-on-surface focus:outline-none cursor-pointer font-semibold"
              >
                <option value="All">All Schedules</option>
                <option value="Trip">Trip Dispatches</option>
                <option value="Maintenance">Vehicle Downtimes</option>
                <option value="Driver Shift">Driver Shifts</option>
                <option value="Vehicle Service">Service Sweeps</option>
                <option value="Meeting"> briefings & Audits</option>
              </select>
            </div>
          </div>

          {/* Month grid header */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest pb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Monthly Days mapping */}
          <div className="grid grid-cols-7 gap-2 h-72">
            {/* Blank padding days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="bg-surface-container-low/10 border border-transparent rounded-lg" />
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayStr = String(dayNum).padStart(2, "0");
              const targetDateString = `${year}-${String(month + 1).padStart(2, "0")}-${dayStr}`;
              const dayEvents = filteredEvents.filter(e => e.start.startsWith(targetDateString));
              const isSelected = targetDateString === selectedDayString;

              return (
                <div 
                  key={`day-${dayNum}`}
                  onClick={() => handleDayClick(dayNum)}
                  className={`bg-surface-container-low/55 border rounded-lg p-2 flex flex-col justify-between hover:border-primary/50 cursor-pointer transition-all relative ${
                    isSelected ? "border-primary bg-primary/5 shadow-inner" : "border-outline-variant/15"
                  }`}
                >
                  <span className={`text-[11px] font-extrabold ${isSelected ? "text-primary" : "text-on-surface-variant"}`}>
                    {dayNum}
                  </span>

                  {/* Bullet indicator list */}
                  <div className="flex gap-1 overflow-hidden mt-1 max-w-full">
                    {dayEvents.slice(0, 3).map((e) => (
                      <span 
                        key={e.id} 
                        className="w-1.5 h-1.5 rounded-full shrink-0" 
                        style={{ backgroundColor: e.color || "#FFB951" }}
                        title={e.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[7px] text-on-surface-variant/60 font-black leading-none">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Column */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 shadow-xl flex flex-col justify-between h-[450px]">
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="pb-3 border-b border-outline-variant/20">
              <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Day agenda outline</span>
              <h4 className="font-display text-sm font-extrabold text-on-surface flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-primary" />
                {new Date(selectedDayString).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}
              </h4>
            </div>

            {/* Selected day event list */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-12 text-on-surface-variant/40 italic">Querying schedule...</div>
              ) : selectedDayEvents.length === 0 ? (
                <div className="text-center py-12 text-[11px] text-on-surface-variant/50 italic space-y-1">
                  <div>No entries scheduled</div>
                  <button 
                    onClick={handleOpenCreate} 
                    className="text-primary hover:underline font-bold"
                  >
                    + Add New Custom Entry
                  </button>
                </div>
              ) : (
                selectedDayEvents.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-3 space-y-2 relative group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-on-surface text-xs leading-snug">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color || "#FFB951" }} />
                        {item.title}
                      </div>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-500/10 text-rose-400 rounded transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant/70 font-semibold font-mono">
                      <Clock className="w-3 h-3 text-primary" />
                      {new Date(item.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {item.description && (
                      <p className="text-[10px] text-on-surface-variant/60 italic leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={handleOpenCreate}
            className="w-full bg-surface-container-highest hover:bg-outline-variant/40 border border-outline-variant/30 text-on-surface py-2 rounded-lg font-bold text-xs mt-4 cursor-pointer"
          >
            Add New Day Event
          </button>
        </div>
      </div>

      {/* Schedule Creator Modal */}
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
              <Calendar className="w-5 h-5 text-primary" />
              Register Timeline Schedule
            </h4>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Event title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Amazon Prime Briefing (Marcus S)"
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Classification</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  >
                    <option value="Meeting">Operations Meeting</option>
                    <option value="Trip">Trip Dispatch Route</option>
                    <option value="Maintenance">Vehicle Downtime Servicing</option>
                    <option value="Driver Shift">Driver Duty shift</option>
                    <option value="Vehicle Service">Service Sweep check</option>
                    <option value="Other">Other Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Start Timeline</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start}
                    onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Event details / Notes</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief agenda outline or mechanic checklist."
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-[#ffb95f] text-[#472a00] py-2.5 rounded-lg text-xs font-bold transition-all mt-4 cursor-pointer"
              >
                Schedule Manifest
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
