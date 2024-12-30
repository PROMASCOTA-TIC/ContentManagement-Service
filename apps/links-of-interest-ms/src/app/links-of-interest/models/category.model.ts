import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Link } from './link.models';

@Table({ tableName: 'categories', timestamps: true })
export class Category extends Model<Category> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name: string; // Nombre de la categoría (e.g., "Educación", "Salud", etc.)

  @HasMany(() => Link)
  links: Link[]; // Relación con los artículos
}
