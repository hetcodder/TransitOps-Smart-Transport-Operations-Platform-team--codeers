import mongoose from "mongoose";

// 1. Organization Model
export interface IOrganization {
  name: string;
  code: string;
  tier: "Standard" | "Enterprise" | "Ultimate";
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new mongoose.Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    tier: { type: String, enum: ["Standard", "Enterprise", "Ultimate"], default: "Enterprise" },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export const Organization = mongoose.models.Organization || mongoose.model<IOrganization>("Organization", OrganizationSchema);


// 2. FuelLog Model
export interface IFuelLog {
  vehicleId: string;
  driverId: string;
  fuelAmount: number; // liters/gallons
  fuelCost: number;
  odometerReading: number;
  fuelType: string;
  timestamp: Date;
  isDeleted: boolean;
}

const FuelLogSchema = new mongoose.Schema<IFuelLog>(
  {
    vehicleId: { type: String, required: true, index: true },
    driverId: { type: String, required: true, index: true },
    fuelAmount: { type: Number, required: true, min: 0 },
    fuelCost: { type: Number, required: true, min: 0 },
    odometerReading: { type: Number, required: true, min: 0 },
    fuelType: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, required: true },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export const FuelLog = mongoose.models.FuelLog || mongoose.model<IFuelLog>("FuelLog", FuelLogSchema);


// 3. Expense Model
export interface IExpense {
  category: "Fuel" | "Maintenance" | "Insurance" | "Permit" | "Miscellaneous";
  amount: number;
  description: string;
  vehicleId?: string;
  driverId?: string;
  date: Date;
  status: "Pending" | "Approved" | "Rejected";
  isDeleted: boolean;
}

const ExpenseSchema = new mongoose.Schema<IExpense>(
  {
    category: {
      type: String,
      enum: ["Fuel", "Maintenance", "Insurance", "Permit", "Miscellaneous"],
      required: true,
      index: true
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    vehicleId: { type: String, index: true },
    driverId: { type: String, index: true },
    date: { type: Date, default: Date.now, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export const Expense = mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);


// 4. Notification Model
export interface INotification {
  recipientEmail: string;
  message: string;
  type: "Alert" | "System" | "Maintenance" | "Safety";
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new mongoose.Schema<INotification>(
  {
    recipientEmail: { type: String, required: true, index: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["Alert", "System", "Maintenance", "Safety"], default: "System" },
    isRead: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export const Notification = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);


// 5. ActivityLog Model
export interface IActivityLog {
  userEmail: string;
  action: string;
  target: string;
  ipAddress?: string;
  timestamp: Date;
}

const ActivityLogSchema = new mongoose.Schema<IActivityLog>(
  {
    userEmail: { type: String, required: true, index: true },
    action: { type: String, required: true },
    target: { type: String, required: true },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now, required: true }
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);


// 6. RefreshToken Model
export interface IRefreshToken {
  userEmail: string;
  token: string;
  expiresAt: Date;
}

const RefreshTokenSchema = new mongoose.Schema<IRefreshToken>(
  {
    userEmail: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

export const RefreshToken = mongoose.models.RefreshToken || mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);


// 7. Document Model
export interface IDocument {
  id: string;
  name: string;
  category: string;
  relatedTo: string;
  expiryDate: string;
  status: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const DocumentSchema = new mongoose.Schema<IDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    relatedTo: { type: String, required: true, index: true },
    expiryDate: { type: String, required: true },
    status: { type: String, required: true },
    filePath: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export const Document = mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);
