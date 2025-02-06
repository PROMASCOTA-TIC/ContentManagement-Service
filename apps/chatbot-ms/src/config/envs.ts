import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    CHATBOT_HF_TOKEN: string; // Token único como string
    DB_DIALECT: string;
    DB_CHATBOT_USERNAME: string;
    DB_CHATBOT_PASSWORD: string;
    CONNECTION_STRING: string;
    NATS_SERVERS: string[];
}

const envsSchema = joi.object({
    CHATBOT_HF_TOKEN: joi.string().required(), // Se asegura de que sea un string y sea obligatorio
    DB_DIALECT: joi.string().required(),
    DB_CHATBOT_USERNAME: joi.string().required(),
    DB_CHATBOT_PASSWORD: joi.string().required(),
    CONNECTION_STRING: joi.string().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
}).unknown(true);

const { error, value } = envsSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
    chatbotToken: envVars.CHATBOT_HF_TOKEN, // Exporta el token validado
    dbDialect: envVars.DB_DIALECT,
    dbChatbotUsername: envVars.DB_CHATBOT_USERNAME,
    dbChatbotPassword: envVars.DB_CHATBOT_PASSWORD,
    connectionString: envVars.CONNECTION_STRING,
    natsServers: envVars.NATS_SERVERS,
};