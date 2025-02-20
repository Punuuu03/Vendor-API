import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, LoginStatus } from './entities/users.entity';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  // 🚀 User Registration (Stores Plain Text Password)
  async register(data: Partial<User>): Promise<User> {
    const { email, password, role } = data;

    if (!password) {
      throw new ConflictException('Password is required');
    }

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user_login_status = role === UserRole.DISTRIBUTOR ? LoginStatus.REJECT : LoginStatus.APPROVE;

    const user = this.userRepository.create({
      ...data,
      password, // 🚨 Stores plain text password (Not Secure)
      user_login_status,
    });

    const savedUser = await this.userRepository.save(user);

    // Send registration email with original password
    await this.sendRegistrationEmail(savedUser, password);

    return savedUser;
  }

  // 🚀 Login Without Hashing
  async login(email: string, password: string): Promise<{ token: string; role: UserRole }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.password !== password) { // 🚨 Compare plain text passwords
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      user_login_status: user.user_login_status,
      created_at: user.created_at,
    };

    const token = this.jwtService.sign(payload);
    return { token, role: user.role };
  }

  // 🚀 Update User Status
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

  // 🚀 Fetch All Distributors
  async getDistributors(): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: UserRole.DISTRIBUTOR },
    });
  }

  // 🚀 Fetch All Registered Users
  async getRegisteredUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // 🚀 Update Password Without Hashing
  async updatePassword(userId: number, newPassword: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = newPassword; // 🚨 Saves plain text password (Not Secure)
    await this.userRepository.save(user);

    // Send Email Notification
    await this.sendPasswordUpdateEmail(user, newPassword);

    return 'Password updated successfully, and email notification sent.';
  }
  async sendPasswordUpdateEmail(user: User, newPassword: string): Promise<void> {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email
        pass: 'hzaj osby vnsh ctyq', // Your email app password
      },
    });

    let mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: user.email,
      subject: 'Your Password Has Been Updated',
      text: `Dear ${user.name},

Your password has been successfully updated.

Username:${user.email}
New Password: ${newPassword}  

For security reasons, please do not share this password with anyone.

Best regards,  
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password update email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }


  // 🚀 Edit User Details
  async editUser(userId: number, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.update(userId, updateData);
    const updatedUser = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  // 🚀 Delete User
  async deleteUser(userId: number): Promise<string> {
    const result = await this.userRepository.delete(userId);
    if (result.affected === 0) throw new NotFoundException('User not found');
    return 'User deleted successfully';
  }

  // 🚀 Get User by ID
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { user_id: Number(userId) } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // 🚀 Send Email on Registration
  async sendRegistrationEmail(user: User, originalPassword: string): Promise<void> {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email
        pass: 'hzaj osby vnsh ctyq', // Your email password
      },
    });

    let mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: user.email,
      subject: 'Registration Successful - Your Login Credentials',
      text: `Dear ${user.name},

You have successfully registered.

Your Username: ${user.email}
Your Password: ${originalPassword}  

Please keep this information secure.

Best regards,
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Registration email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
