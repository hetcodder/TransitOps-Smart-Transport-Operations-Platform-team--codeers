import { User, IUser } from "../models/User";
import mongoose from "mongoose";
import { readLocalDb, writeLocalDb } from "../utils/jsonDb";

export class UserRepository {
  private isMongoActive(): boolean {
    return mongoose.connection.readyState === 1;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const sanitizedEmail = email.toLowerCase().trim();

    if (this.isMongoActive()) {
      return await User.findOne({ email: sanitizedEmail, isDeleted: false } as any) as any;
    } else {
      const db = readLocalDb();
      const localUser = db.users?.find(
        (u: any) => u.email.toLowerCase().trim() === sanitizedEmail && !u.isDeleted
      );
      return localUser || null;
    }
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    if (this.isMongoActive()) {
      const newUser = new User(userData);
      return await newUser.save() as any;
    } else {
      const db = readLocalDb();
      const newUser: any = {
        email: userData.email?.toLowerCase().trim(),
        passwordHash: userData.passwordHash,
        role: userData.role,
        name: userData.name,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...userData
      };
      if (!db.users) db.users = [];
      db.users.push(newUser);
      writeLocalDb(db);
      return newUser as IUser;
    }
  }

  async update(email: string, updateData: Partial<IUser>): Promise<IUser | null> {
    const sanitizedEmail = email.toLowerCase().trim();

    if (this.isMongoActive()) {
      return await User.findOneAndUpdate(
        { email: sanitizedEmail, isDeleted: false } as any,
        { $set: updateData } as any,
        { new: true } as any
      ) as any;
    } else {
      const db = readLocalDb();
      const index = db.users?.findIndex(
        (u: any) => u.email.toLowerCase().trim() === sanitizedEmail && !u.isDeleted
      );
      if (index === undefined || index === -1) return null;

      const updated = {
        ...db.users![index],
        ...updateData,
        updatedAt: new Date()
      };
      db.users![index] = updated;
      writeLocalDb(db);
      return updated as IUser;
    }
  }
}
