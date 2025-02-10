import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('certificates')
export class Certificate {
  @PrimaryGeneratedColumn()
  certificate_id: number;

  @Column({ type: 'varchar', length: 255 })
  certificate_name: string;

  @Column({ type: 'varchar', length: 500 })
  file_url: string;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'int' })
  document_id: number;

  @Column({ type: 'int' })
  distributor_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  certified_date: Date;
}
