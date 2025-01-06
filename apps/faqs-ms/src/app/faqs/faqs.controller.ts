import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller()
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  /************************************************************************************/
  /** PREGUNTAS FRECUENTES **/

  @MessagePattern('get_all_faqs')
  async getAllFaqs() {
    return this.faqsService.getAllFaqs();
  }

  @MessagePattern('search_faqs')
  async searchFaqs(@Payload() data: { query: string }) {
    return this.faqsService.searchFaqs(data.query);
  }

  @MessagePattern('create_faq')
  async createFaq(@Payload() data: CreateFaqDto) {
    return this.faqsService.createFaq(data);
  }

  @MessagePattern('update_faq')
  async updateFaq(@Payload() data: { faqId: string; updateFaqDto: UpdateFaqDto }) {
    return this.faqsService.updateFaq(data.faqId, data.updateFaqDto);
  }

  @MessagePattern('delete_faq')
  async deleteFaq(@Payload() data: { faqId: string }) {
    return this.faqsService.deleteFaq(data.faqId);
  }

  @MessagePattern('get_faq_by_id')
  async getFaqById(@Payload() data: { faqId: string }) {
    return this.faqsService.getFaqById(data.faqId);
  }

  /************************************************************************************/
  /** CATEGORÍAS **/

  @MessagePattern('get_all_categories')
  async handleGetAllCategories() {
    return this.faqsService.getAllCategories();
  }

  @MessagePattern('create_category')
  async handleCreateCategory(@Payload() data: any) {
    return this.faqsService.createCategory(data);
  }

  @MessagePattern('update_category')
  async handleUpdateCategory(@Payload() data: { id: number; updateCategoryDto: UpdateCategoryDto }) {
    return this.faqsService.updateCategory(data.id, data.updateCategoryDto);
  }

  @MessagePattern('delete_category')
  async handleDeleteCategory(@Payload() data: { id: number }) {
    return this.faqsService.deleteCategory(data.id);
  }

  @MessagePattern('get_faqs_by_category')
  async handleGetFaqsByCategory(@Payload() data: { categoryId: number }) {
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
    return this.faqsService.getFeedbackById(data.feedbackId);
  }
}