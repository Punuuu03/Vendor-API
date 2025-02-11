import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,CreateDateColumn } from 'typeorm';
import { Category } from '../../categories/entities/categories.entity';
import { RequiredDocument } from '../../required-documents/required-document.entity';

@Entity('Subcategories')
export class Subcategory {
  @PrimaryGeneratedColumn()
  subcategory_id: number;

  @Column()
  subcategory_name: string;

  @ManyToOne(() => Category, (category) => category.subcategories, { onDelete: 'CASCADE' })
  category: Category;


  @OneToMany(() => RequiredDocument, (requiredDocument) => requiredDocument.subcategory)
  requiredDocuments: RequiredDocument[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
