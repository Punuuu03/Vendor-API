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

  @Column({ type: 'int', nullable: false })
  category_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  category_name: string;

  @Column({ type: 'int', nullable: false })
  subcategory_id: number;

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
    enum: ['Pending', 'Approved', 'Rejected', 'Uploaded', 'Completed'],
    default: 'Pending',
  })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  distributor_id: string | null;

  @CreateDateColumn()
  uploaded_at: Date;

  @Column('json', { nullable: false })
  document_fields: Record<string, string | number>;

  // ✅ Unique application ID (Now handled in service)
  @Column({ type: 'varchar', length: 10, unique: true })
  application_id: string;
}
