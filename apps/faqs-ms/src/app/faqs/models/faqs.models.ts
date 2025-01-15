import { Table, Column, Model, DataType, BelongsTo, ForeignKey, HasMany, PrimaryKey, Default } from 'sequelize-typescript';
import { Category } from './category.model';
import { Feedback } from './feedback.model';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'faqs', timestamps: true })
export class Faq extends Model<Faq> {
  @PrimaryKey
  @Default(uuidv4)  // Genera automáticamente un UUID al crear un registro
  @Column({ type: DataType.UUID })
  faqId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string; // Título de la pregunta frecuente

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string; // Descripción de la pregunta frecuente

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  categoryId: number; // ID de la categoría asociada

  @BelongsTo(() => Category)
  category: Category; // Relación con la tabla Category

  @HasMany(() => Feedback)
  feedbacks: Feedback[]; // Relación uno a muchos con el modelo Feedback

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  positiveFeedback: number; // Contador de feedbacks positivos

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  negativeFeedback: number; // Contador de feedbacks negativos
}