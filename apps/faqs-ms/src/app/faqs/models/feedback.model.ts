import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Faq } from './faqs.models';

@Table({ tableName: 'feedbacks', timestamps: true })
export class Feedback extends Model<Feedback> {
  @ForeignKey(() => Faq)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  faqId: number;

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
    type: DataType.TEXT, // Cambiar de ARRAY a TEXT
    allowNull: true,
  })
  selectedOptions: string; // Almacenar como cadena delimitada

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  additionalComments: string;
}