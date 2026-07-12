import React, { useState, useEffect } from "react";
import { 
  User as UserType, 
  Vehicle, 
  Driver, 
  FleetStats, 
  ActiveTab 
} from "./types";
import LoginScreen from "./components/LoginScreen";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import FleetRegistry from "./components/FleetRegistry";
import DriverFleet from "./components/DriverFleet";
import Modal from "./components/Modal";
import TripsManager from "./components/TripsManager";
import DispatchManager from "./components/DispatchManager";
import MaintenanceManager from "./components/MaintenanceManager";
import FuelExpenseManager from "./components/FuelExpenseManager";
import DocumentManager from "./components/DocumentManager";
import NotificationCenter from "./components/NotificationCenter";
import CalendarManager from "./components/CalendarManager";
import SettingsPanel from "./components/SettingsPanel";
import HelpCenter from "./components/HelpCenter";
import AIAssistant from "./components/AIAssistant";
import AnalyticsPanel from "./components/AnalyticsPanel";
import { Loader2, ShieldAlert, Cpu, Construction } from "lucide-react";

export default function App() {
  // Session Authentication State
  const [token, setToken] = useState<string | null>(localStorage.getItem("transitops_token"));
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Active Screen Layout state
  const [activeTab, setActiveTab] = useState<ActiveTab>("fleet"); // default is Fleet tab as per screenshot 1
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Data Persistence state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stats, setStats] = useState<FleetStats>({
    vehicles: { total: 100, active: 84, maintenance: 6, inactive: 10 },
    drivers: { total: 124, active: 4, offDuty: 0, suspended: 1 }
  });
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Modal control states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create_vehicle" | "edit_vehicle" | "create_driver" | "edit_driver">("create_vehicle");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Theme control state ("dark" by default)
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Load and apply theme class
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem("transitops_theme") as "dark" | "light" || "dark";
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    };
    applyTheme();
    window.addEventListener("themeChanged", applyTheme);
    return () => window.removeEventListener("themeChanged", applyTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("transitops_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
    window.dispatchEvent(new Event("themeChanged"));
  };

  // 1. Authenticate and restore session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (!token) {
        setIsAuthLoading(false);
        return;
      }
      try {
        const response = await fetch("/api/auth/session", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem("transitops_token");
          setToken(null);
        }
      } catch (err) {
        console.error("Session restoration failure:", err);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkSession();
  }, [token]);

  // 2. Load Vehicles, Drivers, and Stats once logged in
  const fetchAllData = async () => {
    if (!currentUser) return;
    setIsDataLoading(true);
    try {
      const [vRes, dRes, sRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/drivers"),
        fetch("/api/stats")
      ]);

      if (vRes.ok && dRes.ok && sRes.ok) {
        const [vData, dData, sData] = await Promise.all([
          vRes.json(),
          dRes.json(),
          sRes.json()
        ]);
        setVehicles(vData);
        setDrivers(dData);
        setStats(sData);
      }
    } catch (err) {
      console.error("Error drawing operational data:", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [currentUser]);

  // 3. Frontend Role-Based Access Control and redirection
  useEffect(() => {
    if (currentUser) {
      const role = currentUser.role;
      let allowed = true;
      if (role === "Dispatcher" || role === "DISPATCH") {
        const allowedTabs = ["dashboard", "trips", "dispatch", "drivers", "fleet", "calendar", "notifications", "help", "ai"];
        allowed = allowedTabs.includes(activeTab);
      } else if (role === "Safety Officer" || role === "TECH") {
        const allowedTabs = ["dashboard", "fleet", "maintenance", "drivers", "documents", "calendar", "notifications", "help", "ai"];
        allowed = allowedTabs.includes(activeTab);
      } else if (role === "Financial Analyst") {
        const allowedTabs = ["dashboard", "fuel", "analytics", "documents", "calendar", "notifications", "help", "ai"];
        allowed = allowedTabs.includes(activeTab);
      }
      
      if (!allowed) {
        setActiveTab("dashboard");
      }
    }
  }, [currentUser, activeTab]);

  // Session Handlers
  const handleLoginSuccess = (newToken: string, user: UserType) => {
    localStorage.setItem("transitops_token", newToken);
    setToken(newToken);
    setCurrentUser(user);
    // On first login, default back to Dashboard
    setActiveTab("dashboard");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (e) {
      // Ignored
    }
    localStorage.removeItem("transitops_token");
    setToken(null);
    setCurrentUser(null);
  };

  // Operational Database Modification Handlers
  const handleFormSubmit = async (formData: any) => {
    const isVehicle = modalType.includes("vehicle");
    const isEdit = modalType.includes("edit");
    const url = isVehicle 
      ? (isEdit ? `/api/vehicles/${formData.id}` : "/api/vehicles")
      : (isEdit ? `/api/drivers/${formData.id}` : "/api/drivers");
    
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Submitting data to telemetry systems failed.");
    }

    // Instantly refetch DB and refresh states
    await fetchAllData();
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete/retire this fleet vehicle?")) return;
    try {
      const response = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Error archiving vehicle:", e);
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if (!confirm("Are you sure you want to suspend/deactivate this commercial driver?")) return;
    try {
      const response = await fetch(`/api/drivers/${id}`, { method: "DELETE" });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Error suspending driver:", e);
    }
  };

  // Helper trigger for Quick-Create button in sidebar
  const triggerQuickCreate = () => {
    // Check if on Drivers screen or Dashboard, open driver. Otherwise vehicle.
    if (activeTab === "drivers") {
      setModalType("create_driver");
    } else {
      setModalType("create_vehicle");
    }
    setSelectedItem(null);
    setModalOpen(true);
  };

  // Helper edit trigger from list/grid actions
  const triggerEditVehicle = (vehicle: Vehicle) => {
    setModalType("edit_vehicle");
    setSelectedItem(vehicle);
    setModalOpen(true);
  };

  const triggerEditDriver = (driver: Driver) => {
    setModalType("edit_driver");
    setSelectedItem(driver);
    setModalOpen(true);
  };

  // Loading indicator for active session hands
  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-container-lowest text-on-surface">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-xs font-mono tracking-widest text-on-surface-variant/80 uppercase">
            Shaking hands with TransitOps Orbitals...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Map Tab Titles
  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Dashboard Controls";
      case "fleet": return "Vehicle Registry";
      case "drivers": return "Driver Fleet";
      case "trips": return "Route Matrix Logs";
      case "dispatch": return "Tactical Dispatcher";
      case "maintenance": return "System Overhaul Logs";
      case "fuel": return "Fuel & Expense Ledger";
      case "analytics": return "Strategic Analytics";
      case "documents": return "Compliance Document Vault";
      case "notifications": return "Alarms & Alerts";
      case "calendar": return "Operational Timeline";
      case "settings": return "System Settings";
      case "help": return "FAQ & IT Support";
      case "ai": return "AI Neural Assistant";
      default: return "System Shell Core";
    }
  };

  // Render main layout based on active navigation tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard 
            stats={stats} 
            vehicles={vehicles} 
            drivers={drivers} 
            onNavigate={(tab) => {
              setActiveTab(tab);
              setSearchQuery("");
            }} 
          />
        );
      case "fleet":
        return (
          <FleetRegistry
            vehicles={vehicles}
            onAddClick={() => {
              setModalType("create_vehicle");
              setSelectedItem(null);
              setModalOpen(true);
            }}
            onEditClick={triggerEditVehicle}
            onDeleteClick={handleDeleteVehicle}
            searchQuery={searchQuery}
          />
        );
      case "drivers":
        return (
          <DriverFleet
            drivers={drivers}
            onAddClick={() => {
              setModalType("create_driver");
              setSelectedItem(null);
              setModalOpen(true);
            }}
            onEditClick={triggerEditDriver}
            onDeleteClick={handleDeleteDriver}
            searchQuery={searchQuery}
          />
        );
      case "trips":
        return <TripsManager vehicles={vehicles} drivers={drivers} searchQuery={searchQuery} />;
      case "dispatch":
        return <DispatchManager vehicles={vehicles} drivers={drivers} />;
      case "maintenance":
        return <MaintenanceManager vehicles={vehicles} />;
      case "fuel":
        return <FuelExpenseManager vehicles={vehicles} drivers={drivers} />;
      case "analytics":
        return <AnalyticsPanel />;
      case "documents":
        return <DocumentManager vehicles={vehicles} drivers={drivers} />;
      case "notifications":
        return <NotificationCenter />;
      case "calendar":
        return <CalendarManager />;
      case "settings":
        return <SettingsPanel />;
      case "help":
        return <HelpCenter />;
      case "ai":
        return <AIAssistant />;
      default:
        return (
          <div className="glass-panel p-12 text-center rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center space-y-4 min-h-[50vh] animate-fade-in">
            <div className="w-14 h-14 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center text-primary shadow-sm shadow-primary/10">
              <Construction className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-base font-extrabold text-on-surface">
                Operations Node Offline: {getTabTitle()}
              </h3>
              <p className="text-xs text-on-surface-variant/70 mt-1 max-w-md mx-auto leading-relaxed">
                This diagnostic telemetry tab is currently under scheduled deployment. Rest assured, the core Vehicle Registry, Driver Fleet, and Mission Control Dashboard are 100% active.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab("dashboard")}
              className="bg-primary hover:bg-[#ffb95f] text-[#472a00] py-2 px-6 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm shadow-primary/5"
            >
              Return to Mission Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-sans antialiased selection:bg-primary/35">
      {/* SideNavBar Layout */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery(""); // Reset query when switching views
        }}
        onLogout={handleLogout}
        onQuickCreate={triggerQuickCreate}
        currentUser={currentUser}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Panel Area */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* TopNavBar Header Context */}
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          onAddClick={triggerQuickCreate}
          tabTitle={getTabTitle()}
        />

        {/* Dynamic Canvas Area */}
        <main className="flex-1 mt-16 p-8 overflow-y-auto custom-scrollbar">
          {isDataLoading ? (
            <div className="flex h-[60vh] items-center justify-center">
              <div className="text-center space-y-3">
                <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
                <p className="text-xs font-mono text-on-surface-variant/70 uppercase tracking-widest">
                  Parsing Fleet telemetry stream...
                </p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {/* Shared Create / Edit Form Dialog */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        initialData={selectedItem}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
