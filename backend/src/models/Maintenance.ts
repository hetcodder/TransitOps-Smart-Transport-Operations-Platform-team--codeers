import mongoose from "mongoose";

export enum MaintenanceStatus {
  SCHEDULED = "Scheduled",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
  OVERDUE = "Overdue"
}

export interface IMaintenance {
  vehicleId: string;
  description: string;
  cost: number;
  status: MaintenanceStatus;
  startDate: Date;
  endDate?: Date;
  performedBy?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceSchema = new mongoose.Schema<IMaintenance>(
  {
    vehicleId: {
      type: String,
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      enum: Object.values(MaintenanceStatus),
      default: MaintenanceStatus.SCHEDULED,
      required: true,
      index: true
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    performedBy: {
      type: String
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const Maintenance = mongoose.models.Maintenance || mongoose.model<IMaintenance>("Maintenance", MaintenanceSchema);
