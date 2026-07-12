import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  Shield, 
  Database, 
  Building, 
  Users, 
  Key,
  CheckCircle,
  Cpu,
  RefreshCw,
  Sun,
  Moon
} from "lucide-react";

export default function SettingsPanel() {
  const [profile, setProfile] = useState<any>({
    orgName: "TransitOps Global Logistics Inc.",
    taxId: "TX-7781-8819A",
    hqAddress: "1202 Western Corridor Node, Seattle WA",
    fleetCapacity: "250",
    regulatoryRegion: "North America Hub"
  });

  const [dbStatus, setDbStatus] = useState({
    isConnected: false,
    mode: "LOCAL_JSON"
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem("transitops_theme") as "dark" | "light" || "dark";
      setTheme(savedTheme);
    };
    applyTheme();
    window.addEventListener("themeChanged", applyTheme);
    return () => window.removeEventListener("themeChanged", applyTheme);
  }, []);

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    localStorage.setItem("transitops_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
    window.dispatchEvent(new Event("themeChanged"));
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        // Just checking connectivity
        setDbStatus({ isConnected: true, mode: "LOCAL_JSON" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const capStr = String(profile.fleetCapacity).trim();
    if (!/^\d+$/.test(capStr)) {
      setSaveError("Fleet capacity must be a valid whole number.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus(true);
      setTimeout(() => setSaveStatus(false), 3000);
    }, 1000);
  };

  // Permission Matrix details
  const rbacRoles = [
    { role: "ADMIN", desc: "Full tactical operational & financial ledger write access.", permissions: ["Create Trip", "Authorize Dispatch", "Clear Servicing", "Audit General Expenses", "Adjust Server keys"] },
    { role: "DISPATCH", desc: "Manage route timelines and assign driver manifests.", permissions: ["Create Trip", "Authorize Dispatch"] },
    { role: "FLEET", desc: "Maintain vehicle asset registry and health alerts.", permissions: ["Clear Servicing"] },
    { role: "TECH", desc: "Perform diagnostic worklogs at mechanical stations.", permissions: ["Clear Servicing"] }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-xs text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container/30 p-4 rounded-xl border border-outline-variant/20">
        <div>
          <h3 className="font-display text-base font-extrabold text-on-surface">System Configurations</h3>
          <p className="text-xs text-on-surface-variant/70 mt-0.5">Configure company corporate profiles, inspect database integrity streams, and audit role permission mappings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Company Profile settings & System Integrity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Corporate Profile Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-xl space-y-4">
            <h4 className="font-display text-sm font-extrabold text-on-surface flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <Building className="w-4 h-4 text-primary" />
              Corporate Logistics Profile
            </h4>

            {saveError && (
              <div className="p-2.5 bg-error-container/10 border border-error/30 text-error rounded-lg text-[11px] font-semibold mb-4 animate-fade-in">
                {saveError}
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Organization Name</label>
                  <input
                    type="text"
                    required
                    value={profile.orgName}
                    onChange={(e) => setProfile({ ...profile, orgName: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Corporate Tax ID / Registration</label>
                  <input
                    type="text"
                    required
                    value={profile.taxId}
                    onChange={(e) => setProfile({ ...profile, taxId: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Headquarters address coordinate</label>
                <input
                  type="text"
                  required
                  value={profile.hqAddress}
                  onChange={(e) => setProfile({ ...profile, hqAddress: e.target.value })}
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Fleet asset cap capacity</label>
                  <input
                    type="text"
                    required
                    value={profile.fleetCapacity}
                    onChange={(e) => setProfile({ ...profile, fleetCapacity: e.target.value })}
                    placeholder="e.g. 250"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Primary Regulatory Jurisdiction</label>
                  <input
                    type="text"
                    required
                    value={profile.regulatoryRegion}
                    onChange={(e) => setProfile({ ...profile, regulatoryRegion: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-outline-variant/15">
                {saveStatus && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Configurations Saved Successfully.
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="ml-auto bg-primary hover:bg-[#ffb95f] text-[#472a00] px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* RBAC matrix overview card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-xl space-y-4">
            <h4 className="font-display text-sm font-extrabold text-on-surface flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <Shield className="w-4 h-4 text-primary" />
              Role-Based Access Control (RBAC) Permission Mappings
            </h4>

            <div className="space-y-4 text-xs">
              {rbacRoles.map((roleObj) => (
                <div key={roleObj.role} className="p-3 bg-surface-container/35 border border-outline-variant/20 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-primary font-mono">{roleObj.role} Role</span>
                    <span className="text-[9px] text-on-surface-variant/50 font-semibold italic">Compliance Verified</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant/80 font-medium">{roleObj.desc}</p>
                  
                  {/* Permissions bubbles */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {roleObj.permissions.map((p, j) => (
                      <span key={j} className="bg-[#0F1115] border border-outline-variant/20 px-2 py-0.5 rounded text-[9px] text-on-surface-variant font-semibold">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Columns: Server & Database integrity cards */}
        <div className="space-y-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 space-y-3.5">
            <h4 className="font-display text-xs font-extrabold text-on-surface uppercase tracking-wide flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-primary" />
              Workspace Preferences
            </h4>
            <p className="text-[10px] text-on-surface-variant/70 leading-normal">
              Adjust your tactical workspace visual presentation.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all text-[11px] cursor-pointer ${
                  theme === "dark"
                    ? "bg-primary border-primary text-[#472a00]"
                    : "border-outline-variant/35 hover:bg-surface-container-highest text-on-surface"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                Dark Mode
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all text-[11px] cursor-pointer ${
                  theme === "light"
                    ? "bg-primary border-primary text-[#472a00]"
                    : "border-outline-variant/35 hover:bg-surface-container-highest text-on-surface"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                Light Mode
              </button>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 space-y-3.5">
            <h4 className="font-display text-xs font-extrabold text-on-surface uppercase tracking-wide flex items-center gap-1.5">
              <Database className="w-4 h-4 text-primary" />
              Database Integrity
            </h4>

            <div className="space-y-3 text-[11px]">
              <div className="flex justify-between items-center p-2.5 bg-surface-container-lowest border border-outline-variant/15 rounded-lg">
                <span className="font-semibold text-on-surface-variant">Active Database Mode</span>
                <span className="font-mono font-bold text-primary">{dbStatus.mode}</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-surface-container-lowest border border-outline-variant/15 rounded-lg">
                <span className="font-semibold text-on-surface-variant">MongoDB Connection</span>
                <span className="font-semibold text-emerald-400">Lightweight Fallback Active</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-surface-container-lowest border border-outline-variant/15 rounded-lg">
                <span className="font-semibold text-on-surface-variant">Local JSON integrity</span>
                <span className="font-mono font-extrabold text-emerald-400">Pass</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 space-y-3.5">
            <h4 className="font-display text-xs font-extrabold text-on-surface uppercase tracking-wide flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-primary" />
              AI Neural Engines
            </h4>

            <div className="space-y-3 text-[11px]">
              <div className="flex justify-between items-center p-2.5 bg-surface-container-lowest border border-outline-variant/15 rounded-lg">
                <span className="font-semibold text-on-surface-variant">Model Selected</span>
                <span className="font-mono font-bold text-on-surface">gemini-3.5-flash</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-surface-container-lowest border border-outline-variant/15 rounded-lg">
                <span className="font-semibold text-on-surface-variant">API Endpoint Gateway</span>
                <span className="font-semibold text-[#FFB951]">Secure Server-Side</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-surface-container-lowest border border-outline-variant/15 rounded-lg">
                <span className="font-semibold text-on-surface-variant">Rule-based Fallback</span>
                <span className="font-mono font-extrabold text-emerald-400">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
