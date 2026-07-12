import React, { useState } from "react";
import { 
  BarChart2, 
  TrendingUp, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Download, 
  Calendar,
  Zap,
  Activity,
  Award
} from "lucide-react";

export default function AnalyticsPanel() {
  const [selectedRange, setSelectedRange] = useState("Last 30 Days");
  const [activeMetricTab, setActiveMetricTab] = useState<"distance" | "efficiency">("distance");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // High fidelity report downloading simulation
  const triggerReportExport = (reportType: string) => {
    const dataStr = `TransitOps Advanced Operational Intelligence Report\nCreated: ${new Date().toLocaleString()}\nRange: ${selectedRange}\n\nMetrics Summary:\n- Carbon Emission Index: 0.28 kg/km (EV optimization offset 45%)\n- Fleet Active Time: 94.2%\n- Average Safety Score: 93.5\n- High Risk Corridor flagged: SR-9 Eastside\n`;
    const blob = new Blob([dataStr], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TransitOps_${reportType.replace(/\s+/g, "_")}_Report.txt`;
    a.click();
  };

  // Mock datasets
  const distanceData = [
    { label: "Jan", val: 12400 },
    { label: "Feb", val: 15600 },
    { label: "Mar", val: 18900 },
    { label: "Apr", val: 21000 },
    { label: "May", val: 24500 },
    { label: "Jun", val: 28400 },
    { label: "Jul", val: 32000 }
  ];

  const efficiencyData = [
    { label: "Jan", val: 78 },
    { label: "Feb", val: 82 },
    { label: "Mar", val: 85 },
    { label: "Apr", val: 88 },
    { label: "May", val: 91 },
    { label: "Jun", val: 93 },
    { label: "Jul", val: 95 }
  ];

  const activeDataset = activeMetricTab === "distance" ? distanceData : efficiencyData;
  const maxVal = Math.max(...activeDataset.map(d => d.val));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header & Range filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container/30 p-4 rounded-xl border border-outline-variant/20">
        <div>
          <h3 className="font-display text-base font-extrabold text-on-surface">Advanced Operational Intelligence</h3>
          <p className="text-xs text-on-surface-variant/70 mt-0.5">Analyze live route efficiency, monitor EV carbon offsets, and export performance reports.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="bg-surface-container border border-outline-variant/30 text-xs text-on-surface font-semibold px-3 py-2 rounded-lg focus:outline-none cursor-pointer"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>Year To Date</option>
          </select>
          <button 
            onClick={() => triggerReportExport("Executive Summary")}
            className="bg-primary hover:bg-[#ffb95f] text-[#472a00] px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Executive Report
          </button>
        </div>
      </div>

      {/* 2. Top level metrics bento grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Active Fleet Utilization", val: "94.2%", desc: "Average operational uptime", icon: Activity, change: "+2.4% this week", plus: true },
          { title: "Carbon Offset (EV Semis)", val: "14.8 Tons", desc: "CO2 greenhouse reduction", icon: Zap, change: "+18.2% vs diesel", plus: true },
          { title: "Average Safety Score", val: "93.5 CDL", desc: "Driver fleet tracking score", icon: Award, change: "+0.8pts compliance", plus: true },
          { title: "Dispatch Resolution", val: "98.8%", desc: "On-time arrival success", icon: TrendingUp, change: "0.1% buffer variance", plus: false }
        ].map((item, i) => (
          <div key={i} className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl flex flex-col justify-between h-28 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">{item.title}</span>
              <item.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-xl font-extrabold font-display text-on-surface mt-1">{item.val}</div>
              <div className="flex justify-between items-center text-[9px] text-on-surface-variant/60 mt-1 font-semibold">
                <span>{item.desc}</span>
                <span className={item.plus ? "text-emerald-400" : "text-on-surface-variant/50"}>{item.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Chart Card (Interactive Custom SVG Dashboard) */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-outline-variant/20">
          <div>
            <h4 className="font-display text-sm font-extrabold text-on-surface">Fleet Operational Trends</h4>
            <p className="text-[11px] text-on-surface-variant/60">Historical performance datasets over calendar months</p>
          </div>
          <div className="flex bg-surface-container rounded-lg p-1 text-[11px] font-bold">
            <button
              onClick={() => setActiveMetricTab("distance")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeMetricTab === "distance" ? "bg-primary text-[#472a00]" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Distance Traveled (km)
            </button>
            <button
              onClick={() => setActiveMetricTab("efficiency")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeMetricTab === "efficiency" ? "bg-primary text-[#472a00]" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Fuel Safety Score (%)
            </button>
          </div>
        </div>

        {/* Dynamic SVG Drawing */}
        <div className="relative pt-4">
          <svg className="w-full h-64 overflow-visible" viewBox="0 0 700 240" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
              <line 
                key={i}
                x1="40" 
                y1={30 + p * 150} 
                x2="680" 
                y2={30 + p * 150} 
                className="stroke-outline-variant/20 stroke-1 stroke-dasharray-[4,4]"
                strokeDasharray="4 4"
              />
            ))}

            {/* Bars with dynamic responsive heights */}
            {activeDataset.map((d, index) => {
              const xCoord = 50 + index * (600 / (activeDataset.length - 1));
              const barHeight = (d.val / maxVal) * 140;
              const yCoord = 180 - barHeight;

              return (
                <g key={d.label}>
                  {/* Dynamic hovering effect bar */}
                  <rect
                    x={xCoord - 12}
                    y="30"
                    width="24"
                    height="160"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredBarIndex(index)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  />

                  {/* Real bar */}
                  <rect
                    x={xCoord - 8}
                    y={yCoord}
                    width="16"
                    height={barHeight}
                    rx="4"
                    className="transition-all duration-300"
                    fill={hoveredBarIndex === index ? "#ffb95f" : "#FFB951"}
                  />

                  {/* Dynamic SVG point connector for line visual */}
                  <circle
                    cx={xCoord}
                    cy={yCoord}
                    r="3.5"
                    fill="#FFB951"
                    stroke="#0F1115"
                    strokeWidth="1.5"
                  />

                  {/* Label on X Axis */}
                  <text
                    x={xCoord}
                    y="210"
                    textAnchor="middle"
                    className="fill-on-surface-variant/70 font-mono text-[10px] font-bold"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}

            {/* Line connector between nodes */}
            <path
              d={activeDataset.map((d, i) => {
                const x = 50 + i * (600 / (activeDataset.length - 1));
                const y = 180 - (d.val / maxVal) * 140;
                return `${i === 0 ? "M" : "L"} ${x} ${y}`;
              }).join(" ")}
              fill="none"
              stroke="#FFB951"
              strokeWidth="2.5"
              className="pointer-events-none opacity-40"
            />
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredBarIndex !== null && (
            <div 
              className="absolute bg-surface-container border border-outline-variant/40 rounded-lg p-2.5 shadow-2xl text-[10px] pointer-events-none"
              style={{
                left: `${hoveredBarIndex * (100 / (activeDataset.length - 1)) * 0.85 + 5}%`,
                top: "10%"
              }}
            >
              <div className="font-extrabold text-on-surface">{activeDataset[hoveredBarIndex].label} Metrics</div>
              <div className="font-mono text-primary font-black mt-0.5">
                {activeMetricTab === "distance" 
                  ? `${activeDataset[hoveredBarIndex].val.toLocaleString()} km logged` 
                  : `Safety Compliance: ${activeDataset[hoveredBarIndex].val}%`
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Downstream Bento Sections (Routes ranking vs Fuel mix) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Route Profitability Column */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 space-y-4">
          <div>
            <h4 className="font-display text-xs font-extrabold text-on-surface uppercase tracking-wide">High Efficiency Transit Corridors</h4>
            <p className="text-[10px] text-on-surface-variant/60">Profitability ratings scaled against average fuel costs</p>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { route: "Seattle - Portland (I-5 South)", margin: "₹160 / km", perf: 95 },
              { route: "Yakima Agricultural Loop", margin: "₹145 / km", perf: 88 },
              { route: "Tacoma Industrial Expressway", margin: "₹130 / km", perf: 74 },
              { route: "Everett Cargo Terminal Corridor", margin: "₹100 / km", perf: 42 }
            ].map((route, i) => (
              <div key={i} className="space-y-1.5 p-2.5 bg-surface-container-lowest/50 border border-outline-variant/15 rounded-lg">
                <div className="flex justify-between font-semibold">
                  <span>{route.route}</span>
                  <span className="text-primary font-mono">{route.margin}</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full" 
                    style={{ width: `${route.perf}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental impact breakdown */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 space-y-4">
          <div>
            <h4 className="font-display text-xs font-extrabold text-on-surface uppercase tracking-wide">Fleet Power & Propulsion Mix</h4>
            <p className="text-[10px] text-on-surface-variant/60">Daily energy consumption split between EV Semis and diesel trucks</p>
          </div>

          <div className="flex flex-col justify-between h-48">
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                    Clean EV Charging
                  </span>
                  <span>45% utilization</span>
                </div>
                <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-orange-400">Low-Emission Diesel</span>
                  <span>55% utilization</span>
                </div>
                <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                  <div className="bg-orange-400 h-full rounded-full" style={{ width: "55%" }} />
                </div>
              </div>
            </div>

            <div className="bg-surface-container/30 border border-outline-variant/20 p-2.5 rounded-lg text-[10px] text-on-surface-variant/80 italic text-center">
              *EV optimization has saved approximately **340 gallons** of industrial diesel and reduced variable carbon levies by **₹1,18,000** this operational cycle.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
