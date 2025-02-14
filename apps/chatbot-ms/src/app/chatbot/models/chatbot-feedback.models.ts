import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript';

@Table({ tableName: 'chatbot_feedback', timestamps: true }) // Cambié el nombre de la tabla a snake_case (convención SQL)
export class ChatbotFeedback extends Model<ChatbotFeedback> {

    @PrimaryKey
    @Default(DataType.UUIDV4)  // Genera automáticamente un UUID al crear un registro
    @Column({ type: DataType.UUID })
    feedbackId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    userMessage: string; // Mensaje del usuario

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: null, // Si el usuario no da feedback, queda en null
    })
    rating: number; // 1 = positivo, 0 = negativo

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW, // Registra automáticamente la fecha actual
    })
    createdAt: Date;
}