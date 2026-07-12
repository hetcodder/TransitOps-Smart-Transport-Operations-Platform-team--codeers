import mongoose from "mongoose";

export enum DriverStatus {
  ON_DUTY = "On Duty",
  OFF_DUTY = "Off Duty",
  SUSPENDED = "Suspended"
}

export interface IDriver {
  id: string; // custom id like TX-88219
  name: string;
  level: number;
  avatar: string;
  status: DriverStatus;
  assignedVehicle: string;
  experienceYears: number;
  tripsCount: number;
  safetyScore: number;
  efficiencyRating: string;
  licenseExpiryDays: number;
  region: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new mongoose.Schema<IDriver>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: Number,
      required: true,
      default: 3
    },
    avatar: {
      type: String,
      default: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNuwximcX4S8j2nguXWUrGUQ9h53FQ_9he_km1JuQxO8bWIvESyylsdS6PEbo7gF5y7g_kc69yWmnjN1vSSmR5oGdL0dCoBtWUE50l3j32wLJLo3gVxmwXEcf_3BELkYW1_lMul-uG9_0wMwbXfXpZQfRat0-uM5gyopexmImbftJ85U3KdPRgscYLwd4GMMqf_UQRs7q5tlcd1hm0Ik0m5Km76HqFIzAnxCtrUWiFerSU0USOZHKG9PRyt7pItwZuuTHO04A_wfJG"
    },
    status: {
      type: String,
      enum: Object.values(DriverStatus),
      default: DriverStatus.OFF_DUTY,
      required: true,
      index: true
    },
    assignedVehicle: {
      type: String,
      default: "Unassigned"
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0,
      default: 1
    },
    tripsCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    safetyScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 90
    },
    efficiencyRating: {
      type: String,
      required: true,
      default: "B"
    },
    licenseExpiryDays: {
      type: Number,
      required: true,
      default: 365
    },
    region: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
      index: true
    },
    deletedAt: {
      type: Date
    },
    createdBy: {
      type: String
    },
    updatedBy: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const Driver = mongoose.models.Driver || mongoose.model<IDriver>("Driver", DriverSchema);
