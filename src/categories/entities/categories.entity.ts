import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Subcategory } from '../../subcategories/entities/subcategories.entity';

@Entity('Categories')
export class Category {
  @PrimaryGeneratedColumn()
  category_id: number;

  @Column({ unique: true })
  category_name: string;

  @OneToMany(() => Subcategory, (subcategory) => subcategory.category)
  subcategories: Subcategory[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
