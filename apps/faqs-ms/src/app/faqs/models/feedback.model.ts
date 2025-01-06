import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Faq } from './faqs.models';

@Table({ tableName: 'feedbacks', timestamps: true })
export class Feedback extends Model<Feedback> {
  @Column({
    type: DataType.UUID, // UUID para ser único
    defaultValue: DataType.UUIDV4, // Genera automáticamente un UUIDv4
    primaryKey: true, // Declarar como clave primaria
    allowNull: false,
  })
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