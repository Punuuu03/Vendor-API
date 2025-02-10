import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'Admin',
  DISTRIBUTOR = 'Distributor',
  CUSTOMER = 'Customer',
}

export enum LoginStatus {
  APPROVE = 'Approve',
  REJECT = 'Reject',
}

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  user_id: number;

  @ApiProperty()
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ uniqueItems: true })
  @Column({ unique: true, length: 255 })
  email: string;

  @ApiProperty()
  @Column({ length: 255 })
  password: string;

  @ApiProperty()
  @Column({ length: 15, nullable: true })
  phone: string;

  @ApiProperty({ enum: UserRole })
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: LoginStatus })
  @Column({ type: 'enum', enum: LoginStatus, default: LoginStatus.APPROVE })
  user_login_status: LoginStatus;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;
}
