import mongoose from "mongoose";

export enum UserRole {
  FLEET_MANAGER = "Fleet Manager",
  DISPATCHER = "Dispatcher",
  SAFETY_OFFICER = "Safety Officer",
  FINANCIAL_ANALYST = "Financial Analyst"
}

export interface IUser {
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  phone?: string;
  employeeId?: string;
  shift?: string;
  certificationNumber?: string;
  department?: string;
  isActive: boolean;
  organizationId?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.FLEET_MANAGER,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    employeeId: {
      type: String,
      trim: true
    },
    shift: {
      type: String,
      trim: true
    },
    certificationNumber: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId as any,
      ref: "Organization",
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

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
