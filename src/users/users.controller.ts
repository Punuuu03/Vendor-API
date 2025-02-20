import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Put,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ Register a new user
  @Post('register')
  async register(@Body() data: Partial<User>): Promise<User> {
    return this.usersService.register(data);
  }

  // ✅ Update user status (Approve/Reject)
  @Patch('status/:id')
  async updateUserStatus(
    @Param('id') userId: number,
    @Body() body: { status: 'Approve' | 'Reject' },
  ): Promise<string> {
    if (!body.status) {
      throw new BadRequestException('Status is required');
    }
    return this.usersService.updateUserStatus(userId, body.status);
  }

  // ✅ Get all distributors
  @Get('distributors')
  async getDistributors(): Promise<User[]> {
    return this.usersService.getDistributors();
  }

  // ✅ Fetch all registered users
  @Get('register')
  async getRegisteredUsers(): Promise<User[]> {
    return this.usersService.getRegisteredUsers();
  }

  // ✅ Update password for a specific user
  @Patch('password/:id')
  async updatePassword(
    @Param('id') userId: number,
    @Body() body: { newPassword: string },
  ): Promise<string> {
    if (!body.newPassword) {
      throw new BadRequestException('New password is required');
    }
    return this.usersService.updatePassword(userId, body.newPassword);
  }

  // ✅ User login
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
  ): Promise<{ token: string; role: UserRole }> {
    const { email, password } = body;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    return this.usersService.login(email, password);
  }

  // ✅ Edit user details
  @Put('edit/:id')
  editUser(@Param('id') userId: number, @Body() updateData: Partial<User>) {
    return this.usersService.editUser(userId, updateData);
  }

  // ✅ Delete user
  @Delete('delete/:id')
  deleteUser(@Param('id') userId: number) {
    return this.usersService.deleteUser(userId);
  }

  @Get('edit/:user_id')
  async getUser(@Param('user_id') userId: string): Promise<User> {
      return this.usersService.getUserById(userId);
  }
}
