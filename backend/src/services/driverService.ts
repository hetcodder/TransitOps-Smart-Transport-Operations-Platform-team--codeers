import { DriverRepository } from "../repositories/driverRepository";
import { IDriver } from "../models/Driver";

export class DriverService {
  private driverRepository: DriverRepository;

  constructor() {
    this.driverRepository = new DriverRepository();
  }

  async getAllDrivers(): Promise<IDriver[]> {
    return await this.driverRepository.findAll();
  }

  async getDriverById(id: string): Promise<IDriver | null> {
    return await this.driverRepository.findById(id);
  }

  async createDriver(driverData: Partial<IDriver>): Promise<IDriver> {
    if (!driverData.id) {
      driverData.id = `TX-${Math.floor(10000 + Math.random() * 90000)}`;
    }
    // Business validation: safety score must be bounded
    if (driverData.safetyScore !== undefined) {
      driverData.safetyScore = Math.max(0, Math.min(100, driverData.safetyScore));
    }
    return await this.driverRepository.create(driverData);
  }

  async updateDriver(id: string, updateData: Partial<IDriver>): Promise<IDriver | null> {
    const existing = await this.driverRepository.findById(id);
    if (!existing) return null;

    if (updateData.safetyScore !== undefined) {
      updateData.safetyScore = Math.max(0, Math.min(100, updateData.safetyScore));
    }
    return await this.driverRepository.update(id, updateData);
  }

  async suspendDriver(id: string): Promise<boolean> {
    return await this.driverRepository.delete(id);
  }
}
