import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() data: Partial<User>): Promise<User> {
    return this.usersService.register(data);
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
  ): Promise<{ token: string }> {
    const { email, password } = body;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    return this.usersService.login(email, password);
  }

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
}
