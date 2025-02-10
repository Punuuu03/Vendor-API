import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Category } from '../../categories/entities/categories.entity';

@Entity('Subcategories')
export class Subcategory {
  @PrimaryGeneratedColumn()
  subcategory_id: number;

  @Column()
  subcategory_name: string;

  @ManyToOne(() => Category, (category) => category.subcategories, { onDelete: 'CASCADE' })
  category: Category;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
