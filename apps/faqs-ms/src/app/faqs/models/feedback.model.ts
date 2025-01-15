import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, Default } from 'sequelize-typescript';
import { Faq } from './faqs.models';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'feedbacks', timestamps: true })
export class Feedback extends Model<Feedback> {
  @PrimaryKey
  @Default(uuidv4)  // Genera automáticamente un UUID al crear un registro
  @Column({ type: DataType.UUID })
  feedbackId: string;

  @ForeignKey(() => Faq)
  @Column({
    type: DataType.UUID, // Asegurar que `faqId` sea también UUID si `Faq` usa UUID
    allowNull: false,
  })
  faqId: string;

  @BelongsTo(() => Faq)
  faq: Faq;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  response: 'positivo' | 'negativo';

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  rating: number;

  @Column({
    type: DataType.TEXT, // Texto delimitado
    allowNull: true,
  })
  selectedOptions: string; // Opciones seleccionadas como cadena delimitada

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  additionalComments: string;
}