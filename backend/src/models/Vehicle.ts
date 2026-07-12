import mongoose from "mongoose";

export enum VehicleStatus {
  ACTIVE = "Active",
  MAINTENANCE = "Maintenance",
  IN_TRANSIT = "In Transit",
  INACTIVE = "Inactive"
}

export enum FuelType {
  EV = "EV",
  DIESEL = "Diesel",
  HYBRID = "Hybrid"
}

export interface IVehicle {
  id: string; // custom id like VO-102
  name: string;
  type: string;
  image: string;
  status: VehicleStatus;
  fuelType: FuelType;
  fuelLevel: number;
  health: number;
  odometer: number;
  maintenanceDate: string;
  region: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new mongoose.Schema<IVehicle>(
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
    type: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&auto=format&fit=crop&q=60&referrerPolicy=no-referrer"
    },
    status: {
      type: String,
      enum: Object.values(VehicleStatus),
      default: VehicleStatus.ACTIVE,
      required: true,
      index: true
    },
    fuelType: {
      type: String,
      enum: Object.values(FuelType),
      default: FuelType.EV,
      required: true
    },
    fuelLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 100
    },
    health: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 100
    },
    odometer: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    maintenanceDate: {
      type: String,
      required: true,
      default: "Pending"
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

export const Vehicle = mongoose.models.Vehicle || mongoose.model<IVehicle>("Vehicle", VehicleSchema);
