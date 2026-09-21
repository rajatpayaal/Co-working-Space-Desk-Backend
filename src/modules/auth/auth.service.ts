import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export class AuthService {
  private static generateTokens(user: { id: string; email: string; role?: string }) {
    const accessSecret = process.env.JWT_SECRET || 'fallback_jwt_secret';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'MEMBER' },
      accessSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'MEMBER' },
      refreshSecret,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  static async register(data: { name: string; email: string; password: string }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new AppError('Email address is already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    const tokens = this.generateTokens({ id: user.id, email: user.email });
    return {
      user: { id: user.id, name: user.name, email: user.email },
      ...tokens,
    };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { role: true },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    const roleName = user.role?.name || 'MEMBER';
    const tokens = this.generateTokens({ id: user.id, email: user.email, role: roleName });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: roleName },
      ...tokens,
    };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user) {
      throw new AppError('User profile not found', 404);
    }

    return user;
  }
}
