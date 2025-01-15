import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Advertorial } from './advertorial.models';

@Table({ tableName: 'categories', timestamps: true })
export class Category extends Model<Category> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name: string; // Nombre de la categoría (e.g., "Educación", "Salud", etc.)

  @HasMany(() => Advertorial)
  links: Advertorial[]; // Relación con los artículos
}