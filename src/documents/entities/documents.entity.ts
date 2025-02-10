import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  document_id: number;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  category_name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  subcategory_name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  phone: string;

  @Column({ type: 'text', nullable: false })
  address: string;

  @Column('json', { nullable: false })
  documents: { document_type: string; file_path: string }[];

  @Column({
    type: 'enum',
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  })
  status: string;

  @CreateDateColumn()
  uploaded_at: Date;
}
