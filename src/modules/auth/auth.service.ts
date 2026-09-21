import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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

  // 01. Register
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
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      user: { id: user.id, name: user.name, email: user.email },
      ...tokens,
    };
  }

  // 02. Login
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

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: roleName },
      ...tokens,
    };
  }

  // 03. Get Me Profile
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

  // 04. Refresh Token
  static async refreshTokens(incomingRefreshToken: string) {
    if (!incomingRefreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
    let decoded: any;
    try {
      decoded = jwt.verify(incomingRefreshToken, refreshSecret);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new AppError('Invalid refresh token session', 401);
    }

    const roleName = user.role?.name || 'MEMBER';
    const tokens = this.generateTokens({ id: user.id, email: user.email, role: roleName });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return tokens;
  }

  // 05. Logout
  static async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // 06. Change Password
  static async changePassword(userId: string, data: { oldPassword: string; newPassword: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(data.oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  // 07. Forgot Password
  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return true to avoid user enumeration security vulnerability
      return { message: 'If email exists, reset token link has been generated.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires,
      },
    });

    return {
      message: 'Password reset token generated successfully.',
      resetToken,
    };
  }

  // 08. Reset Password
  static async resetPassword(data: { token: string; newPassword: string }) {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: data.token,
        resetPasswordExpires: { gte: new Date() },
      },
    });

    if (!user) {
      throw new AppError('Password reset token is invalid or has expired', 400);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  }
}
