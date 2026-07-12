import { Vehicle, IVehicle } from "../models/Vehicle";
import mongoose from "mongoose";
import { readLocalDb, writeLocalDb } from "../utils/jsonDb";

export class VehicleRepository {
  private isMongoActive(): boolean {
    return mongoose.connection.readyState === 1;
  }

  async findAll(): Promise<IVehicle[]> {
    if (this.isMongoActive()) {
      return await Vehicle.find({ isDeleted: false } as any);
    } else {
      const db = readLocalDb();
      return db.vehicles.filter((v: any) => !v.isDeleted);
    }
  }

  async findById(id: string): Promise<IVehicle | null> {
    if (this.isMongoActive()) {
      return await Vehicle.findOne({ id, isDeleted: false } as any);
    } else {
      const db = readLocalDb();
      const vehicle = db.vehicles.find((v: any) => v.id === id && !v.isDeleted);
      return vehicle || null;
    }
  }

  async create(vehicleData: Partial<IVehicle>): Promise<IVehicle> {
    if (this.isMongoActive()) {
      const newVehicle = new Vehicle(vehicleData);
      return await newVehicle.save() as any;
    } else {
      const db = readLocalDb();
      const newVehicle: any = {
        id: vehicleData.id,
        name: vehicleData.name,
        type: vehicleData.type,
        image: vehicleData.image || "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&auto=format&fit=crop&q=60&referrerPolicy=no-referrer",
        status: vehicleData.status || "Active",
        fuelType: vehicleData.fuelType || "EV",
        fuelLevel: Number(vehicleData.fuelLevel ?? 100),
        health: Number(vehicleData.health ?? 100),
        odometer: Number(vehicleData.odometer ?? 0),
        maintenanceDate: vehicleData.maintenanceDate || "14 Oct 2023",
        region: vehicleData.region || "North Hub",
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      db.vehicles.push(newVehicle);
      writeLocalDb(db);
      return newVehicle as IVehicle;
    }
  }

  async update(id: string, updateData: Partial<IVehicle>): Promise<IVehicle | null> {
    if (this.isMongoActive()) {
      return await Vehicle.findOneAndUpdate(
        { id, isDeleted: false } as any,
        { $set: updateData } as any,
        { new: true } as any
      ) as any;
    } else {
      const db = readLocalDb();
      const index = db.vehicles.findIndex((v: any) => v.id === id && !v.isDeleted);
      if (index === -1) return null;

      const updated = {
        ...db.vehicles[index],
        ...updateData,
        id, // Preserve immutable ID
        updatedAt: new Date()
      };
      db.vehicles[index] = updated;
      writeLocalDb(db);
      return updated as IVehicle;
    }
  }

  async delete(id: string): Promise<boolean> {
    if (this.isMongoActive()) {
      const result = await Vehicle.findOneAndUpdate(
        { id, isDeleted: false } as any,
        { $set: { isDeleted: true, deletedAt: new Date() } } as any,
        { new: true } as any
      );
      return !!result;
    } else {
      const db = readLocalDb();
      const index = db.vehicles.findIndex((v: any) => v.id === id && !v.isDeleted);
      if (index === -1) return false;

      db.vehicles = db.vehicles.filter((v: any) => v.id !== id);
      writeLocalDb(db);
      return true;
    }
  }
}
