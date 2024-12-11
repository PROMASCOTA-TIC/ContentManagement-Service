import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    CHATBOT_HF_TOKEN: string; // Token único como string
}

const envsSchema = joi.object({
    CHATBOT_HF_TOKEN: joi.string().required(), // Se asegura de que sea un string y sea obligatorio
}).unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
    chatbotToken: envVars.CHATBOT_HF_TOKEN, // Exporta el token validado
};