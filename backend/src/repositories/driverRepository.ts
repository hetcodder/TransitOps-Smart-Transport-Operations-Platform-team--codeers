import { Driver, IDriver } from "../models/Driver";
import mongoose from "mongoose";
import { readLocalDb, writeLocalDb } from "../utils/jsonDb";

export class DriverRepository {
  private isMongoActive(): boolean {
    return mongoose.connection.readyState === 1;
  }

  async findAll(): Promise<IDriver[]> {
    if (this.isMongoActive()) {
      return await Driver.find({ isDeleted: false } as any);
    } else {
      const db = readLocalDb();
      return db.drivers.filter((d: any) => !d.isDeleted);
    }
  }

  async findById(id: string): Promise<IDriver | null> {
    if (this.isMongoActive()) {
      return await Driver.findOne({ id, isDeleted: false } as any);
    } else {
      const db = readLocalDb();
      const driver = db.drivers.find((d: any) => d.id === id && !d.isDeleted);
      return driver || null;
    }
  }

  async create(driverData: Partial<IDriver>): Promise<IDriver> {
    if (this.isMongoActive()) {
      const newDriver = new Driver(driverData);
      return await newDriver.save() as any;
    } else {
      const db = readLocalDb();
      const newDriver: any = {
        id: driverData.id,
        name: driverData.name || "Unnamed Driver",
        level: Number(driverData.level ?? 3),
        avatar: driverData.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBNuwximcX4S8j2nguXWUrGUQ9h53FQ_9he_km1JuQxO8bWIvESyylsdS6PEbo7gF5y7g_kc69yWmnjN1vSSmR5oGdL0dCoBtWUE50l3j32wLJLo3gVxmwXEcf_3BELkYW1_lMul-uG9_0wMwbXfXpZQfRat0-uM5gyopexmImbftJ85U3KdPRgscYLwd4GMMqf_UQRs7q5tlcd1hm0Ik0m5Km76HqFIzAnxCtrUWiFerSU0USOZHKG9PRyt7pItwZuuTHO04A_wfJG",
        status: driverData.status || "Off Duty",
        assignedVehicle: driverData.assignedVehicle || "Unassigned",
        experienceYears: Number(driverData.experienceYears ?? 1),
        tripsCount: Number(driverData.tripsCount ?? 0),
        safetyScore: Number(driverData.safetyScore ?? 90),
        efficiencyRating: driverData.efficiencyRating || "B",
        licenseExpiryDays: Number(driverData.licenseExpiryDays ?? 365),
        region: driverData.region || "North Hub",
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      db.drivers.push(newDriver);
      writeLocalDb(db);
      return newDriver as IDriver;
    }
  }

  async update(id: string, updateData: Partial<IDriver>): Promise<IDriver | null> {
    if (this.isMongoActive()) {
      return await Driver.findOneAndUpdate(
        { id, isDeleted: false } as any,
        { $set: updateData } as any,
        { new: true } as any
      ) as any;
    } else {
      const db = readLocalDb();
      const index = db.drivers.findIndex((d: any) => d.id === id && !d.isDeleted);
      if (index === -1) return null;

      const updated = {
        ...db.drivers[index],
        ...updateData,
        id, // Keep mutable ID
        updatedAt: new Date()
      };
      db.drivers[index] = updated;
      writeLocalDb(db);
      return updated as IDriver;
    }
  }

  async delete(id: string): Promise<boolean> {
    if (this.isMongoActive()) {
      const result = await Driver.findOneAndUpdate(
        { id, isDeleted: false } as any,
        { $set: { isDeleted: true, deletedAt: new Date() } } as any,
        { new: true } as any
      );
      return !!result;
    } else {
      const db = readLocalDb();
      const index = db.drivers.findIndex((d: any) => d.id === id && !d.isDeleted);
      if (index === -1) return false;

      db.drivers = db.drivers.filter((d: any) => d.id !== id);
      writeLocalDb(db);
      return true;
    }
  }
}
