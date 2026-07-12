import mongoose from "mongoose";

export enum TripStatus {
  SCHEDULED = "Scheduled",
  IN_TRANSIT = "In Transit",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled"
}

export interface ITrip {
  tripId: string;
  vehicleId: string;
  driverId: string;
  startRegion: string;
  endRegion: string;
  status: TripStatus;
  startOdometer: number;
  endOdometer?: number;
  fuelConsumed?: number;
  isDeleted: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new mongoose.Schema<ITrip>(
  {
    tripId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    vehicleId: {
      type: String,
      required: true,
      index: true
    },
    driverId: {
      type: String,
      required: true,
      index: true
    },
    startRegion: {
      type: String,
      required: true
    },
    endRegion: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(TripStatus),
      default: TripStatus.SCHEDULED,
      required: true,
      index: true
    },
    startOdometer: {
      type: Number,
      required: true
    },
    endOdometer: {
      type: Number
    },
    fuelConsumed: {
      type: Number
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
      index: true
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

export const Trip = mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema);
