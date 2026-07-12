export interface Vehicle {
  id: string;
  name: string;
  type: string;
  image: string;
  status: "Active" | "Maintenance" | "In Transit" | "Inactive";
  fuelType: "EV" | "Diesel" | "Hybrid";
  fuelLevel: number;
  health: number;
  odometer: number;
  maintenanceDate: string;
  region: string;
}

export interface Driver {
  id: string;
  name: string;
  level: number;
  avatar: string;
  status: "On Duty" | "Off Duty" | "Suspended";
  assignedVehicle: string;
  experienceYears: number;
  tripsCount: number;
  safetyScore: number;
  efficiencyRating: string;
  licenseExpiryDays: number;
  region: string;
}

export interface User {
  email: string;
  role: "Fleet Manager" | "Dispatcher" | "Safety Officer" | "Financial Analyst" | "ADMIN" | "DISPATCH" | "FLEET" | "TECH";
  name: string;
  phone?: string;
  employeeId?: string;
  shift?: string;
  certificationNumber?: string;
  department?: string;
}

export interface FleetStats {
  vehicles: {
    total: number;
    active: number;
    maintenance: number;
    inactive: number;
  };
  drivers: {
    total: number;
    active: number;
    offDuty: number;
    suspended: number;
  };
}

export type ActiveTab = 
  | "dashboard"
  | "fleet"
  | "drivers"
  | "trips"
  | "dispatch"
  | "maintenance"
  | "fuel"
  | "analytics"
  | "documents"
  | "notifications"
  | "calendar"
  | "settings"
  | "help"
  | "ai";

export interface Trip {
  id: string; // matches backend tripId/id
  tripId?: string;
  name: string;
  customer: string;
  pickupLocation: string;
  dropLocation: string;
  route: string;
  vehicleId: string;
  driverId: string;
  vehicleName?: string;
  driverName?: string;
  cargoDetails: string;
  departureTime: string;
  expectedArrival: string;
  priority: "Low" | "Medium" | "High";
  status: "Scheduled" | "Active" | "Delayed" | "Completed" | "Cancelled";
  distance: number; // km
  fuelConsumption: number; // liters/kWh
}

export interface Dispatch {
  id: string;
  tripId?: string;
  vehicleId: string;
  driverId: string;
  route: string;
  dispatchTime: string;
  status: "Pending" | "Assigned" | "In Transit" | "Completed" | "Failed";
  instructions?: string;
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  vehicleName?: string;
  issueType: "Scheduled" | "Repair" | "Inspection" | "Emergency";
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  assignedMechanic: string;
  estimatedCost: number;
  actualCost?: number;
  status: "Scheduled" | "In Progress" | "Completed" | "Overdue";
  serviceDate: string;
  nextServiceDate?: string;
  mileage?: number;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  driverId: string;
  date: string;
  fuelQuantity: number; // liters or kWh
  cost: number;
  fuelStation: string;
  mileage: number; // km
  paymentMethod: string;
  receiptUrl?: string;
}

export interface Expense {
  id: string;
  category: "Fuel" | "Maintenance" | "Insurance" | "Toll" | "Salary" | "Repair" | "Other";
  amount: number;
  description: string;
  vehicleId?: string;
  driverId?: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface Document {
  id: string;
  name: string;
  category: "RC" | "Insurance" | "Pollution" | "Permit" | "License" | "ID Proof" | "Training" | "Other";
  relatedTo: string; // vehicleId or driverId or "Company"
  expiryDate: string;
  fileUrl?: string;
  status: "Active" | "Expiring Soon" | "Expired";
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  type: "Trip" | "Maintenance" | "Driver Shift" | "Vehicle Service" | "Meeting" | "Other";
  description?: string;
  color?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: "Alert" | "System" | "Maintenance" | "Safety" | "Financial";
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userEmail: string;
  action: string;
  target: string;
  ipAddress?: string;
  timestamp: string;
}
