import { BadRequestException, Controller, NotFoundException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller()
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) { }

  /************************************************************************************/
  /** PREGUNTAS FRECUENTES **/

  @MessagePattern('get_all_faqs')
  async getAllFaqs() {
    return this.faqsService.getAllFaqs();
  }

  @MessagePattern('search_faqs')
  async searchFaqs(@Payload() data: { query: string }) {
    if (!data?.query) {
      throw new BadRequestException('El parámetro "query" es obligatorio');
    }
    return this.faqsService.searchFaqs(data.query);
  }

  @MessagePattern('create_faq')
  async createFaq(@Payload() data: CreateFaqDto) {
    const requiredFields = ['title', 'description', 'categoryId'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new BadRequestException(`El campo "${field}" es obligatorio`);
      }
    }
    return this.faqsService.createFaq(data);
  }

  @MessagePattern('update_faq')
async updateFaq(@Payload() data: { faqId: string; updateFaqDto: Partial<UpdateFaqDto> }) {
  const { faqId, updateFaqDto } = data || {};

  // Validar que el `faqId` esté presente
  if (!faqId) {
    throw new BadRequestException('Debe proporcionar un "faqId".');
  }

  // Validar que haya al menos un campo a actualizar
  if (!updateFaqDto || Object.keys(updateFaqDto).length === 0) {
    throw new BadRequestException('Debe proporcionar al menos un campo en los datos de actualización.');
  }

  // Llamada al servicio para actualizar la FAQ
  return this.faqsService.updateFaq(faqId, updateFaqDto);
}

  @MessagePattern('delete_faq')
  async deleteFaq(@Payload() data: { faqId: string }) {
    if (!data?.faqId) {
      throw new BadRequestException('Debe proporcionar el "faqId" del enlace a eliminar');
    }
    return this.faqsService.deleteFaq(data.faqId);
  }

  @MessagePattern('get_faq_by_id')
  async getFaqById(@Payload() data: { faqId: string }) {
    if (!data?.faqId) {
      throw new BadRequestException('Debe proporcionar el "faqId" del enlace');
    }
    const link = await this.faqsService.getFaqById(data.faqId);
    if (!link) {
      throw new NotFoundException(`No se encontró el enlace con "faqId" ${data.faqId}`);
    }
    return link;
  }

  /************************************************************************************/
  /** CATEGORÍAS **/

  @MessagePattern('get_all_categories')
  async handleGetAllCategories() {
    return this.faqsService.getAllCategories();
  }

  @MessagePattern('create_category')
  async handleCreateCategory(@Payload() data: CreateCategoryDto) {
    if (!data?.name) {
      throw new BadRequestException('El nombre de la categoría es obligatorio');
    }
    return this.faqsService.createCategory(data);
  }

   // Actualizar una categoría existente
   @MessagePattern('update_category')
   async handleUpdateCategory(@Payload() data: { id: number; updateCategoryDto: UpdateCategoryDto }) {
     if (!data?.id || !data?.updateCategoryDto?.name) {
       throw new BadRequestException('Debe proporcionar un "id" de categoría y un nombre válido');
     }
     const result = await this.faqsService.updateCategory(data.id, data.updateCategoryDto);
     if (!result) {
       throw new NotFoundException(`No se encontró la categoría con id ${data.id}`);
     }
     return result;
   }

   // Eliminar una categoría
   @MessagePattern('delete_category')
   async handleDeleteCategory(@Payload() data: { id: number }) {
     if (!data?.id) {
       throw new BadRequestException('Debe proporcionar el "id" de la categoría a eliminar');
     }
     return this.faqsService.deleteCategory(data.id);
   }

  // Obtener artículos por categoría
  @MessagePattern('get_faqs_by_category')
  async handleGetLinksByCategory(@Payload() data: { categoryId: number }) {
    if (!data?.categoryId) {
      throw new BadRequestException('Debe proporcionar un "categoryId"');
    }
    return this.faqsService.getFaqsByCategory(data.categoryId);
  }

  /************************************************************************************/
  /** FEEDBACK **/

  @MessagePattern('register_feedback')
  async handleRegisterFeedback(@Payload() data: { faqId: string; createFeedbackDto: CreateFeedbackDto }) {
    return this.faqsService.saveFeedback(data.faqId, data.createFeedbackDto);
  }

  @MessagePattern('get_feedback_stats')
  async handleGetFeedbackStats(@Payload() data: { faqId: string }) {
    return this.faqsService.getFeedbackStats(data.faqId);
  }

  @MessagePattern('get_feedback_summary')
  async handleGetFeedbackSummary(@Payload() data: { faqId: string }) {
    return this.faqsService.getFeedbackSummaryByFaq(data.faqId);
  }

  @MessagePattern('get_feedback_details')
  async handleGetFeedbackDetails(@Payload() data: { faqId: string }) {
    return this.faqsService.getFeedbackDetailsByFaq(data.faqId);
  }

  @MessagePattern('get_feedback_by_id')
  async handleGetFeedbackById(@Payload() data: { feedbackId: string }) {
    if (!data?.feedbackId) {
      throw new BadRequestException('Debe proporcionar el "feedbackId" del enlace');
    }
    const link = await this.faqsService.getFeedbackById(data.feedbackId);
    if (!link) {
      throw new NotFoundException(`No se encontró el enlace con "feedbackId" ${data.feedbackId}`);
    }
    return link;
  }
}