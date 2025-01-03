import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './models/category.model';
import { Faq } from './models/faqs.models';
import { Feedback } from './models/feedback.model';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Op } from 'sequelize';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FaqsService {
    constructor(
        @InjectModel(Faq)
        private readonly faqModel: typeof Faq,
        @InjectModel(Category)
        private readonly categoryModel: typeof Category,
        @InjectModel(Feedback)
        private readonly feedbackModel: typeof Feedback,
    ) { }

    /************************************************************************************/
    /** PREGUNTAS FRECUENTES **/

    async getAllFaqs(): Promise<Faq[]> {
        return this.faqModel.findAll({ include: [Category] });
    }

    async searchFaqs(query: string): Promise<Faq[]> {
        const escapedQuery = query.replace(/[%_]/g, '\\$&');
        return this.faqModel.findAll({
            where: { title: { [Op.like]: `%${escapedQuery}%` } },
        });
    }

    async createFaq(createFaqDto: CreateFaqDto): Promise<Faq> {
        const category = await this.categoryModel.findByPk(createFaqDto.categoryId);
        if (!category) {
            throw new BadRequestException('Invalid categoryId: Category not found');
        }
        return this.faqModel.create(createFaqDto);
    }

    async updateFaq(id: number, updateFaqDto: UpdateFaqDto): Promise<[number, Faq[]]> {
        return this.faqModel.update(updateFaqDto, { where: { id }, returning: true });
    }

    async deleteFaq(id: number): Promise<number> {
        return this.faqModel.destroy({ where: { id } });
    }

    async getFaqById(id: number): Promise<Faq> {
        const faq = await this.faqModel.findByPk(id, { include: [Category] });
        if (!faq) {
            throw new BadRequestException(`Faq with ID ${id} not found`);
        }
        return faq;
    }

    /************************************************************************************/
    /** CATEGORÍAS **/

    async getAllCategories(): Promise<Category[]> {
        return this.categoryModel.findAll();
    }

    async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
        return this.categoryModel.create(createCategoryDto);
    }

    async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto): Promise<[number, Category[]]> {
        return this.categoryModel.update(updateCategoryDto, { where: { id }, returning: true });
    }

    async deleteCategory(id: number): Promise<number> {
        return this.categoryModel.destroy({ where: { id } });
    }

    async getFaqsByCategory(categoryId: number): Promise<Faq[]> {
        const category = await this.categoryModel.findByPk(categoryId);
        if (!category) {
            throw new BadRequestException(`Category with ID ${categoryId} not found`);
        }
        return this.faqModel.findAll({ where: { categoryId }, include: [Category] });
    }

    /************************************************************************************/
    /** FEEDBACK **/
    async saveFeedback(faqId: number, createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
        const faq = await this.faqModel.findByPk(faqId);
        if (!faq) {
            throw new NotFoundException('Pregunta frecuente no encontrada');
        }

        const { response, rating, selectedOptions, additionalComments } = createFeedbackDto;

        const feedback = await this.feedbackModel.create({
            faqId,
            response,
            rating,
            selectedOptions: selectedOptions?.join(','), // Convertir array a cadena delimitada
            additionalComments,
        });

        // Actualizar contadores de feedback en el FAQ
        if (response === 'positivo') {
            faq.positiveFeedback = (faq.positiveFeedback || 0) + 1;
        } else if (response === 'negativo') {
            faq.negativeFeedback = (faq.negativeFeedback || 0) + 1;
        }

        await faq.save();

        return feedback;
    }

    /************************************************************************************/
    /** OBTENER FEEDBACK **/
    async getFeedbackById(feedbackId: number): Promise<{
        id: number;
        faqId: number;
        response: 'positivo' | 'negativo';
        rating: number;
        selectedOptions: string[];
        additionalComments: string;
        createdAt: Date;
        updatedAt: Date;
    }> {
        const feedback = await this.feedbackModel.findByPk(feedbackId);

        if (!feedback) {
            throw new NotFoundException('Feedback no encontrado');
        }

        // Convertir selectedOptions de cadena a array y crear un objeto plano
        return {
            id: feedback.id,
            faqId: feedback.faqId,
            response: feedback.response,
            rating: feedback.rating,
            selectedOptions: feedback.selectedOptions?.split(',') || [], // Convertir cadena a array
            additionalComments: feedback.additionalComments,
            createdAt: feedback.createdAt,
            updatedAt: feedback.updatedAt,
        };
    }

    /************************************************************************************/
    /** OBTENER ESTADÍSTICAS DE FEEDBACK **/
    async getFeedbackStats(faqId: number): Promise<{ positive: number; negative: number }> {
        const faq = await this.faqModel.findByPk(faqId);
        if (!faq) {
            throw new NotFoundException('Pregunta frecuente no encontrada');
        }

        return {
            positive: faq.positiveFeedback || 0,
            negative: faq.negativeFeedback || 0,
        };
    }

    async getFeedbackSummaryByFaq(faqId: number): Promise<{
        faqId: number;
        totalVotes: number;
        positiveVotes: number;
        negativeVotes: number;
        satisfaction: number; // Porcentaje de satisfacción
    }> {
        // Buscar la FAQ para asegurar que existe
        const faq = await this.faqModel.findByPk(faqId);
        if (!faq) {
            throw new NotFoundException(`Pregunta frecuente con ID ${faqId} no encontrada`);
        }

        // Contar los votos positivos y negativos para esta FAQ
        const positiveVotes = await this.feedbackModel.count({
            where: { faqId, response: 'positivo' },
        });
        const negativeVotes = await this.feedbackModel.count({
            where: { faqId, response: 'negativo' },
        });

        // Calcular el total de votos
        const totalVotes = positiveVotes + negativeVotes;

        // Calcular el porcentaje de satisfacción
        const satisfaction = totalVotes > 0 ? (positiveVotes / totalVotes) * 100 : 0;

        return {
            faqId,
            totalVotes,
            positiveVotes,
            negativeVotes,
            satisfaction,
        };
    }

    async getFeedbackDetailsByFaq(faqId: number): Promise<{
        vote: 'positivo' | 'negativo';
        rating: number;
        feedbackOptions: string[]; // Opciones seleccionadas como array
        comment: string;
    }[]> {
        // Buscar la FAQ para asegurar que existe
        const faq = await this.faqModel.findByPk(faqId);
        if (!faq) {
            throw new NotFoundException(`Pregunta frecuente con ID ${faqId} no encontrada`);
        }

        // Recuperar los feedbacks relacionados con esta FAQ
        const feedbacks = await this.feedbackModel.findAll({
            where: { faqId },
        });

        // Transformar los datos de feedback
        return feedbacks.map(feedback => ({
            vote: feedback.response,
            rating: feedback.rating,
            feedbackOptions: feedback.selectedOptions ? feedback.selectedOptions.split(',') : [],
            comment: feedback.additionalComments,
        }));
    }

}