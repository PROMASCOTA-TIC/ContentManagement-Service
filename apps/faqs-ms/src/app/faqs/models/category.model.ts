import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Faq } from './faqs.models';

@Table({ tableName: 'categories', timestamps: true })
export class Category extends Model<Category> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name: string; // Nombre de la categoría (e.g., "Educación", "Salud", etc.)

  @HasMany(() => Faq)
  faqs: Faq[]; // Relación con los artículos
}