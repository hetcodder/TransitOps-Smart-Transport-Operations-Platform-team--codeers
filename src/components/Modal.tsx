import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Vehicle, Driver } from "../types";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "create_vehicle" | "edit_vehicle" | "create_driver" | "edit_driver";
  initialData?: any;
  onSubmit: (formData: any) => Promise<void>;
}

export default function Modal({ isOpen, onClose, type, initialData, onSubmit }: ModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data based on type
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        // Set clean defaults for new creations
        if (type === "create_vehicle") {
          setFormData({
            id: `VO-${Math.floor(100 + Math.random() * 900)}`,
            name: "",
            type: "Heavy Truck",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvv-JgKaZyB4hcR9xSJFsQQeL2Pfnzzq5GuUc25lKJ0Z-wUYh41808MiICFm4oz6-zNGcIR1rUv8QpoC0Qp8Jp2aDdFCbIL2mbhhZgWUgE4GgUVVjhOlXdwBRnAeUb09RMmACscDDHTHBIBbqtyHEt0cBCIZu1iTV_C8dNdr6JFKIX4PMb_9mTQ_xq1ysV25Q_Vv3EhztUPoN7RvL-8w4BWGPJaancqKsDBKNZe4SYLjjLfg_v3_-onkw7eUv53uzM4T3sdU6SHRGo",
            status: "Active",
            fuelType: "EV",
            fuelLevel: 90,
            health: 95,
            odometer: 12000,
            maintenanceDate: "14 Oct 2023",
            region: "North Hub"
          });
        } else if (type === "create_driver") {
          setFormData({
            id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
            name: "",
            level: 3,
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNuwximcX4S8j2nguXWUrGUQ9h53FQ_9he_km1JuQxO8bWIvESyylsdS6PEbo7gF5y7g_kc69yWmnjN1vSSmR5oGdL0dCoBtWUE50l3j32wLJLo3gVxmwXEcf_3BELkYW1_lMul-uG9_0wMwbXfXpZQfRat0-uM5gyopexmImbftJ85U3KdPRgscYLwd4GMMqf_UQRs7q5tlcd1hm0Ik0m5Km76HqFIzAnxCtrUWiFerSU0USOZHKG9PRyt7pItwZuuTHO04A_wfJG",
            status: "Off Duty",
            assignedVehicle: "Unassigned (Station 4)",
            experienceYears: 2,
            tripsCount: 45,
            safetyScore: 92,
            efficiencyRating: "B+",
            licenseExpiryDays: 365,
            region: "North Hub"
          });
        }
      }
    }
  }, [isOpen, type, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Name field is strictly required.");
      return;
    }

    // Strict numerical parsing and validation
    const updatedData = { ...formData };
    
    // Check fuelLevel
    if (updatedData.fuelLevel !== undefined && updatedData.fuelLevel !== "") {
      const val = String(updatedData.fuelLevel).trim();
      if (!/^\d+(\.\d+)?$/.test(val)) {
        setError("Fuel/Charge Level must be a positive number.");
        return;
      }
      const num = Number(val);
      if (num < 0 || num > 100) {
        setError("Fuel/Charge Level must be between 0 and 100.");
        return;
      }
      updatedData.fuelLevel = num;
    }

    // Check odometer
    if (updatedData.odometer !== undefined && updatedData.odometer !== "") {
      const val = String(updatedData.odometer).trim();
      if (!/^\d+$/.test(val)) {
        setError("Odometer Index must be a valid whole number.");
        return;
      }
      const num = Number(val);
      if (num < 0) {
        setError("Odometer Index cannot be negative.");
        return;
      }
      updatedData.odometer = num;
    }

    // Check health
    if (updatedData.health !== undefined && updatedData.health !== "") {
      const val = String(updatedData.health).trim();
      if (!/^\d+(\.\d+)?$/.test(val)) {
        setError("Battery/Engine Health must be a positive number.");
        return;
      }
      const num = Number(val);
      if (num < 0 || num > 100) {
        setError("Battery/Engine Health must be between 0 and 100.");
        return;
      }
      updatedData.health = num;
    }

    // Check level
    if (updatedData.level !== undefined && updatedData.level !== "") {
      const val = String(updatedData.level).trim();
      if (!/^\d+$/.test(val)) {
        setError("Operator Level must be a valid whole number.");
        return;
      }
      const num = Number(val);
      if (num < 1 || num > 5) {
        setError("Operator Level must be between 1 and 5.");
        return;
      }
      updatedData.level = num;
    }

    // Check safetyScore
    if (updatedData.safetyScore !== undefined && updatedData.safetyScore !== "") {
      const val = String(updatedData.safetyScore).trim();
      if (!/^\d+(\.\d+)?$/.test(val)) {
        setError("Safety Score must be a positive number.");
        return;
      }
      const num = Number(val);
      if (num < 0 || num > 100) {
        setError("Safety Score must be between 0 and 100.");
        return;
      }
      updatedData.safetyScore = num;
    }

    // Check experienceYears
    if (updatedData.experienceYears !== undefined && updatedData.experienceYears !== "") {
      const val = String(updatedData.experienceYears).trim();
      if (!/^\d+$/.test(val)) {
        setError("Experience Years must be a valid whole number.");
        return;
      }
      const num = Number(val);
      if (num < 0) {
        setError("Experience Years cannot be negative.");
        return;
      }
      updatedData.experienceYears = num;
    }

    // Check tripsCount
    if (updatedData.tripsCount !== undefined && updatedData.tripsCount !== "") {
      const val = String(updatedData.tripsCount).trim();
      if (!/^\d+$/.test(val)) {
        setError("Trips Count must be a valid whole number.");
        return;
      }
      const num = Number(val);
      if (num < 0) {
        setError("Trips Count cannot be negative.");
        return;
      }
      updatedData.tripsCount = num;
    }

    // Check licenseExpiryDays
    if (updatedData.licenseExpiryDays !== undefined && updatedData.licenseExpiryDays !== "") {
      const val = String(updatedData.licenseExpiryDays).trim();
      if (!/^-?\d+$/.test(val)) {
        setError("License Expiry Days must be a valid whole number.");
        return;
      }
      updatedData.licenseExpiryDays = Number(val);
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(updatedData);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || "Failed to submit form specifications.");
    }
  };

  const getTitle = () => {
    switch (type) {
      case "create_vehicle": return "Onboard New Fleet Vehicle";
      case "edit_vehicle": return `Modify Vehicle Specification: #${formData.id}`;
      case "create_driver": return "Onboard Certified Operator";
      case "edit_driver": return `Update Operator Profile: #${formData.id}`;
    }
  };

  const isVehicle = type.includes("vehicle");

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div 
        className="glass-card w-full max-w-2xl rounded-2xl border border-outline-variant/30 flex flex-col max-h-[90vh] shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50">
          <h3 className="font-display text-base font-extrabold text-on-surface tracking-tight">
            {getTitle()}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-surface-container-highest/60 rounded-full text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {error && (
            <div className="p-3 bg-error-container/20 border border-error/40 text-error rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          {isVehicle ? (
            /* --- VEHICLE FORM DETAILS --- */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Vehicle Name / Model
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="e.g. Tesla Semi"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Vehicle ID Code (Immutable)
                </label>
                <input
                  type="text"
                  name="id"
                  disabled={type.includes("edit")}
                  value={formData.id || ""}
                  onChange={handleChange}
                  placeholder="e.g. VO-102"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Vehicle Type classification
                </label>
                <select
                  name="type"
                  value={formData.type || "Heavy Truck"}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                >
                  <option value="Heavy Truck">Heavy Truck</option>
                  <option value="Support Pickup">Support Pickup</option>
                  <option value="Delivery Van">Delivery Van</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Roster Operation Region
                </label>
                <select
                  name="region"
                  value={formData.region || "North Hub"}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                >
                  <option value="North Hub">North Hub</option>
                  <option value="West Coast">West Coast</option>
                  <option value="Central Park">Central Park</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Fuel Technology
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType || "EV"}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                >
                  <option value="EV">EV (Electric)</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Current Fuel / Charge level (%)
                </label>
                <input
                  type="text"
                  name="fuelLevel"
                  value={formData.fuelLevel ?? 90}
                  onChange={handleChange}
                  placeholder="0 to 100"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Odometer Index (km)
                </label>
                <input
                  type="text"
                  name="odometer"
                  value={formData.odometer ?? 1000}
                  onChange={handleChange}
                  placeholder="e.g. 15420"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Battery/Engine Health (%)
                </label>
                <input
                  type="text"
                  name="health"
                  value={formData.health ?? 95}
                  onChange={handleChange}
                  placeholder="0 to 100"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Maintenance Schedule Notice
                </label>
                <input
                  type="text"
                  name="maintenanceDate"
                  value={formData.maintenanceDate || "14 Oct 2023"}
                  onChange={handleChange}
                  placeholder="e.g. 14 Oct 2023 or Overdue"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Deployment Status state
                </label>
                <select
                  name="status"
                  value={formData.status || "Active"}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Vehicle Press Image URL
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image || ""}
                  onChange={handleChange}
                  placeholder="HTTPS URL Link"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-mono text-[10px]"
                />
              </div>
            </div>
          ) : (
            /* --- DRIVER FORM DETAILS --- */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Driver Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="e.g. Marcus Sterling"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Operator database ID (Immutable)
                </label>
                <input
                  type="text"
                  name="id"
                  disabled={type.includes("edit")}
                  value={formData.id || ""}
                  onChange={handleChange}
                  placeholder="e.g. TX-88219"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Assigned fleet Vehicle
                </label>
                <input
                  type="text"
                  name="assignedVehicle"
                  value={formData.assignedVehicle || ""}
                  onChange={handleChange}
                  placeholder="e.g. Tesla Semi (#VO-102)"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Duty status state
                </label>
                <select
                  name="status"
                  value={formData.status || "Off Duty"}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                >
                  <option value="On Duty">On Duty</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Assigned regional Hub
                </label>
                <select
                  name="region"
                  value={formData.region || "North Hub"}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                >
                  <option value="North Hub">North Hub</option>
                  <option value="West Coast">West Coast</option>
                  <option value="Central Park">Central Park</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Operator Level
                </label>
                <input
                  type="text"
                  name="level"
                  value={formData.level ?? 3}
                  onChange={handleChange}
                  placeholder="1 to 5"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Safety score rating (0-100)
                </label>
                <input
                  type="text"
                  name="safetyScore"
                  value={formData.safetyScore ?? 92}
                  onChange={handleChange}
                  placeholder="0 to 100"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Efficiency Tag Score
                </label>
                <input
                  type="text"
                  name="efficiencyRating"
                  value={formData.efficiencyRating || "B+"}
                  onChange={handleChange}
                  placeholder="e.g. A+, B+, A, D-"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Corporate Experience (Years)
                </label>
                <input
                  type="text"
                  name="experienceYears"
                  value={formData.experienceYears ?? 2}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Completed Duties / Trips count
                </label>
                <input
                  type="text"
                  name="tripsCount"
                  value={formData.tripsCount ?? 150}
                  onChange={handleChange}
                  placeholder="e.g. 240"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  License Expiration remaining (Days)
                </label>
                <input
                  type="text"
                  name="licenseExpiryDays"
                  value={formData.licenseExpiryDays ?? 365}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1 ml-1">
                  Operator Avatar Photo Link
                </label>
                <input
                  type="text"
                  name="avatar"
                  value={formData.avatar || ""}
                  onChange={handleChange}
                  placeholder="HTTPS Image URL"
                  className="block w-full px-3 py-2 text-xs text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-mono text-[10px]"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-highest border border-outline-variant/20 rounded-lg text-xs font-bold text-on-surface transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-primary text-[#472a00] hover:bg-[#ffb95f] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Specifications"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
