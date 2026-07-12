import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository";
import { IUser, UserRole } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "transitops-ultra-secure-development-secret-key-321";
const JWT_EXPIRES_IN = "24h";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash);
  }

  generateToken(user: IUser): string {
    const payload = {
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
      employeeId: user.employeeId,
      shift: user.shift,
      certificationNumber: user.certificationNumber,
      department: user.department,
      isActive: user.isActive
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  async register(userData: {
    email: string;
    passwordRaw: string;
    role: UserRole;
    name: string;
    phone?: string;
    employeeId?: string;
    shift?: string;
    certificationNumber?: string;
    department?: string;
  }): Promise<IUser> {
    const sanitizedEmail = userData.email.toLowerCase().trim();
    const existing = await this.userRepository.findByEmail(sanitizedEmail);
    if (existing) {
      throw new Error("Duplicate email");
    }

    const passwordHash = await this.hashPassword(userData.passwordRaw);
    return await this.userRepository.create({
      email: sanitizedEmail,
      passwordHash,
      role: userData.role,
      name: userData.name,
      phone: userData.phone,
      employeeId: userData.employeeId,
      shift: userData.shift,
      certificationNumber: userData.certificationNumber,
      department: userData.department,
      isActive: true,
      isDeleted: false
    });
  }

  async login(email: string, password: string, role: string): Promise<{ token: string; user: IUser }> {
    const sanitizedEmail = email.toLowerCase().trim();
    let user = await this.userRepository.findByEmail(sanitizedEmail);

    if (!user) {
      throw new Error("Invalid Email");
    }

    // Check if account is active
    if (user.isActive === false) {
      throw new Error("Account Disabled");
    }

    // Check Role mismatch
    if (user.role !== role) {
      throw new Error("Unauthorized Access");
    }

    // Verify Password
    const isValidPassword = await this.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Incorrect Password");
    }

    // Generate session JWT token
    const token = this.generateToken(user);
    return { token, user };
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}
