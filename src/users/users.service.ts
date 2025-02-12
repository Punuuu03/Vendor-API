import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, LoginStatus } from './entities/users.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: Partial<User>): Promise<User> {
    const { email, password, role } = data;

    if (!password) {
      throw new ConflictException('Password is required');
    }

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user_login_status =
      role === UserRole.DISTRIBUTOR ? LoginStatus.REJECT : LoginStatus.APPROVE;

    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
      user_login_status,
    });

    return await this.userRepository.save(user);
  }

  async login(email: string, password: string): Promise<{ token: string; role: UserRole }> {
    // Find the user by email
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if password is provided
    if (!password) {
      throw new UnauthorizedException('Password is required');
    }

    // Check if the user's login status is REJECTED
    if (user.user_login_status === LoginStatus.REJECT) {
      throw new UnauthorizedException('Wait for Admin Approval');
    }

    // Validate the password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create a payload for the JWT token
    const payload = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      user_login_status: user.user_login_status,
      created_at: user.created_at,
    };

    // Sign the token with the payload
    const token = this.jwtService.sign(payload);

    // Return the token and user's role
    return { token, role: user.role };
  }
  async updateUserStatus(userId: number, status: 'Approve' | 'Reject'): Promise<string> {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.DISTRIBUTOR) {
      throw new BadRequestException('Only Distributors can have their status updated');
    }

    user.user_login_status = status as LoginStatus;
    await this.userRepository.save(user);

    return `User status updated to ${status}`;
  }

  async getDistributors(): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: UserRole.DISTRIBUTOR },
    });
  }

  // ✅ Fetch all registered users
  async getRegisteredUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // ✅ Update password for a specific user
  async updatePassword(userId: number, newPassword: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return 'Password updated successfully';
  }
}
