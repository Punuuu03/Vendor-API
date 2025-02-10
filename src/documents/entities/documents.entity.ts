import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { IsString, IsArray, ValidateNested, IsInt } from 'class-validator';
  import { Type } from 'class-transformer';
  
  class DocumentFileDto {
    @IsString()
    document_type: string;
  
    @IsString()
    file_path: string;
  }
  
  @Entity('documents')
  export class Document {
    @PrimaryGeneratedColumn()
    document_id: number;
  
    @Column()
    user_id: number;
  
    @Column()
    category_name: string;
  
    @Column()
    subcategory_name: string;
  
    @Column()
    name: string;
  
    @Column()
    email: string;
  
    @Column()
    phone: string;
  
    @Column()
    address: string;
  
    @Column('json')
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DocumentFileDto)
    documents: DocumentFileDto[];
  
    @Column({ type: 'enum', enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
    status: string;
  
    @CreateDateColumn()
    uploaded_at: Date;
  }
  