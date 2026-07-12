import { VehicleRepository } from "../repositories/vehicleRepository";
import { IVehicle } from "../models/Vehicle";

export class VehicleService {
  private vehicleRepository: VehicleRepository;

  constructor() {
    this.vehicleRepository = new VehicleRepository();
  }

  async getAllVehicles(): Promise<IVehicle[]> {
    return await this.vehicleRepository.findAll();
  }

  async getVehicleById(id: string): Promise<IVehicle | null> {
    return await this.vehicleRepository.findById(id);
  }

  async createVehicle(vehicleData: Partial<IVehicle>): Promise<IVehicle> {
    if (!vehicleData.id) {
      vehicleData.id = `VO-${Math.floor(100 + Math.random() * 900)}`;
    }
    // Business validation rule: fuel level and health must be valid percentages
    if (vehicleData.fuelLevel !== undefined) {
      vehicleData.fuelLevel = Math.max(0, Math.min(100, vehicleData.fuelLevel));
    }
    if (vehicleData.health !== undefined) {
      vehicleData.health = Math.max(0, Math.min(100, vehicleData.health));
    }

    return await this.vehicleRepository.create(vehicleData);
  }

  async updateVehicle(id: string, updateData: Partial<IVehicle>): Promise<IVehicle | null> {
    const existing = await this.vehicleRepository.findById(id);
    if (!existing) return null;

    if (updateData.fuelLevel !== undefined) {
      updateData.fuelLevel = Math.max(0, Math.min(100, updateData.fuelLevel));
    }
    if (updateData.health !== undefined) {
      updateData.health = Math.max(0, Math.min(100, updateData.health));
    }

    return await this.vehicleRepository.update(id, updateData);
  }

  async archiveVehicle(id: string): Promise<boolean> {
    return await this.vehicleRepository.delete(id);
  }
}
