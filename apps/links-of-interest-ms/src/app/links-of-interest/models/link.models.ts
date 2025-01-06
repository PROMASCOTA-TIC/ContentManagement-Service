import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Category } from './category.model';

@Table({ tableName: 'links', timestamps: true })
export class Link extends Model<Link> {
  @Column({
    type: DataType.UUID, // Tipo UUID para ser único
    defaultValue: DataType.UUIDV4, // Generar automáticamente un UUIDv4
    allowNull: false,
    unique: true,
  })
  linkId: string; // Identificador único para el enlace

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  ownerName: string; // Nombre del dueño de mascota o emprendedor

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true, // Asegura que no esté vacío
      isEmail: true,  // Valida que sea un email válido (solo para el campo email)
    },
  })
  ownerEmail: string;  // Correo electrónico del dueño de mascota o emprendedor

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string; // Título del artículo

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string; // Descripción del artículo

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  sourceLink: string; // Enlace fuente del artículo

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'pending',
  })
  status: string; // Estado del artículo: 'pending', 'approved', 'rejected'

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'ITEMPHOTO',
  })
  imagesUrl: string;

  // Campo para la fecha y hora de publicación
  @Column({
    type: DataType.DATE,
    allowNull: true, // Puede ser nulo hasta que se establezca la fecha
  })
  publishDate: Date;

  // Relación con la categoría
  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  categoryId: number; // ID de la categoría asociada

  @BelongsTo(() => Category)
  category: Category; // Relación con el modelo Category
}
