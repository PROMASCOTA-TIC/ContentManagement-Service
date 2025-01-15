import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './models/category.model';
import { Faq } from './models/faqs.models';
import { Feedback } from './models/feedback.model';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Op, Sequelize } from 'sequelize';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

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
        const escapedQuery = query.replace(/[%_]/g, '\\$&'); // Escapar caracteres especiales
        return this.faqModel.findAll({
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), {
                        [Op.like]: `%${escapedQuery.toLowerCase()}%`,
                    }),
                ],
            },
        });
    }

    async createFaq(createFaqDto: CreateFaqDto): Promise<Faq> {
        const category = await this.categoryModel.findByPk(createFaqDto.categoryId);
        if (!category) {
            throw new BadRequestException('Invalid categoryId: Category not found');
        }
        return this.faqModel.create(createFaqDto);
    }

    async updateFaq(faqId: string, updateFaqDto: Partial<UpdateFaqDto>): Promise<Faq> {
        const faq = await this.faqModel.findOne({ where: { faqId } });

        if (!faq) {
            throw new BadRequestException(`La FAQ con ID "${faqId}" no fue encontrada.`);
        }

        // Actualizar solo los campos que estén presentes
        await faq.update(updateFaqDto);

        return faq;
    }

    async deleteFaq(faqId: string): Promise<number> {
        return this.faqModel.destroy({ where: { faqId } });
    }

    async getFaqById(faqId: string): Promise<Faq> {
        const faq = await this.faqModel.findOne({ where: { faqId }, include: [Category] });
        if (!faq) {
            throw new BadRequestException(`Faq with ID ${faqId} not found`);
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

    // Actualizar una categoría existente
    async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        // Realiza la actualización sin `returning: true`
        const [updatedCount] = await this.categoryModel.update(updateCategoryDto, { where: { id } });

        if (updatedCount === 0) {
            throw new Error(`No se encontró la categoría con id ${id}`);
        }

        // Realiza una búsqueda manual para obtener la categoría actualizada
        const updatedCategory = await this.categoryModel.findOne({ where: { id } });

        if (!updatedCategory) {
            throw new Error(`No se pudo obtener la categoría actualizada con id ${id}`);
        }

        return updatedCategory;
    }

    async deleteCategory(id: number): Promise<number> {
        return this.categoryModel.destroy({ where: { id } });
    }

    // Filtrar los enlaces por categoría
    async getFaqsByCategory(categoryId: number): Promise<Faq[]> {
        // Verificar si la categoría existe
        const category = await this.categoryModel.findByPk(categoryId);
        if (!category) {
            throw new BadRequestException(`Category with ID ${categoryId} not found`);
        }

        // Buscar los enlaces relacionados con la categoría
        return this.faqModel.findAll({
            where: { categoryId },
            include: [Category],
        });
    }
    /************************************************************************************/
    /** FEEDBACK **/
// Crear feedback
async createFeedback(faqId: string, dto: CreateFeedbackDto) {
    const faq = await this.faqModel.findByPk(faqId);
    if (!faq) {
      throw new NotFoundException(`FAQ con id ${faqId} no encontrada`);
    }

    // Creamos un nuevo feedback
    const feedback = await this.feedbackModel.create({
      faqId: faq.faqId,
      response: dto.response, // 'positivo' o 'negativo'
      // rating, selectedOptions, etc. si quieres guardarlo desde ya
    });

    // Incrementar contadores
    if (dto.response === 'positivo') {
      faq.positiveFeedback += 1;
    } else {
      faq.negativeFeedback += 1;
    }
    await faq.save();

    return feedback; // Retorna feedback, incluye feedbackId
  }

    // Actualizar feedback existente con rating, selectedOptions, etc.
    async updateFeedback(feedbackId: string, dto: UpdateFeedbackDto) {
        const feedback = await this.feedbackModel.findByPk(feedbackId);
        if (!feedback) {
            throw new NotFoundException(`Feedback con id ${feedbackId} no encontrado`);
        }

        // Si guardas selectedOptions como JSON o string, haz la conversión que necesites
        if (dto.selectedOptions) {
            feedback.selectedOptions = dto.selectedOptions.join(',');
        }

        if (dto.rating !== undefined) {
            feedback.rating = dto.rating;
        }

        if (dto.additionalComments !== undefined) {
            feedback.additionalComments = dto.additionalComments;
        }

        await feedback.save();
        return feedback;
    }

    /************************************************************************************/
    /** OBTENER FEEDBACK **/

    async getFeedbackById(feedbackId: string): Promise<{
        feedbackId: string;
        faqId: string;
        response: 'positivo' | 'negativo';
        rating: number;
        selectedOptions: string[];
        additionalComments: string;
        createdAt: Date;
        updatedAt: Date;
    }> {
        const feedback = await this.feedbackModel.findOne({ where: { feedbackId } });

        if (!feedback) {
            throw new NotFoundException('Feedback no encontrado');
        }

        return {
            feedbackId: feedback.feedbackId,
            faqId: feedback.faqId,
            response: feedback.response,
            rating: feedback.rating,
            selectedOptions: feedback.selectedOptions?.split(',') || [],
            additionalComments: feedback.additionalComments,
            createdAt: feedback.createdAt,
            updatedAt: feedback.updatedAt,
        };
    }

    /************************************************************************************/
    /** OBTENER ESTADÍSTICAS DE FEEDBACK **/

    async getFeedbackStats(faqId: string): Promise<{ positive: number; negative: number }> {
        const faq = await this.faqModel.findOne({ where: { faqId } });
        if (!faq) {
            throw new NotFoundException('Pregunta frecuente no encontrada');
        }

        return {
            positive: faq.positiveFeedback || 0,
            negative: faq.negativeFeedback || 0,
        };
    }

    async getFeedbackSummaryByFaq(faqId: string): Promise<{
        faqId: string;
        totalVotes: number;
        positiveVotes: number;
        negativeVotes: number;
        satisfaction: number;
    }> {
        const faq = await this.faqModel.findOne({ where: { faqId } });
        if (!faq) {
            throw new NotFoundException(`Pregunta frecuente con ID ${faqId} no encontrada`);
        }

        const positiveVotes = await this.feedbackModel.count({ where: { faqId, response: 'positivo' } });
        const negativeVotes = await this.feedbackModel.count({ where: { faqId, response: 'negativo' } });

        const totalVotes = positiveVotes + negativeVotes;
        const satisfaction = totalVotes > 0 ? (positiveVotes / totalVotes) * 100 : 0;

        return {
            faqId,
            totalVotes,
            positiveVotes,
            negativeVotes,
            satisfaction,
        };
    }

    async getFeedbackDetailsByFaq(faqId: string): Promise<{
        vote: 'positivo' | 'negativo';
        rating: number;
        feedbackOptions: string[];
        comment: string;
    }[]> {
        const faq = await this.faqModel.findOne({ where: { faqId } });
        if (!faq) {
            throw new NotFoundException(`Pregunta frecuente con ID ${faqId} no encontrada`);
        }

        const feedbacks = await this.feedbackModel.findAll({ where: { faqId } });

        return feedbacks.map(feedback => ({
            vote: feedback.response,
            rating: feedback.rating,
            feedbackOptions: feedback.selectedOptions ? feedback.selectedOptions.split(',') : [],
            comment: feedback.additionalComments,
        }));
    }
}