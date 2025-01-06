import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FaqsService } from './faqs.service';

@Controller()
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @MessagePattern('get_all_faqs')
  async getAllFaqs() {
    return this.faqsService.getAllFaqs();
  }

  @MessagePattern('search_faqs')
  async searchFaqs(@Payload() data: { query: string }) {
    return this.faqsService.searchFaqs(data.query);
  }

  @MessagePattern('create_faq' )
  async createFaq(@Payload() data: any) {
    return this.faqsService.createFaq(data);
  }

  @MessagePattern('update_faq' )
  async updateFaq(@Payload() data: { id: number; updateFaqDto: any }) {
    return this.faqsService.updateFaq(data.id, data.updateFaqDto);
  }

  @MessagePattern('delete_faq' )
  async deleteFaq(@Payload() data: { id: number }) {
    return this.faqsService.deleteFaq(data.id);
  }

  @MessagePattern('get_faq_by_id')
  async getFaqById(@Payload() data: { id: number }) {
    return this.faqsService.getFaqById(data.id);
  }

  @MessagePattern('get_all_categories')
  async handleGetAllCategories() {
    return this.faqsService.getAllCategories();
  }

  @MessagePattern('create_category')
  async handleCreateCategory(@Payload() data: any) {
    return this.faqsService.createCategory(data);
  }

  @MessagePattern('update_category')
  async handleUpdateCategory(@Payload() data: { id: number; updateCategoryDto: any }) {
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

  @MessagePattern('register_feedback')
  async handleRegisterFeedback(@Payload() data: { faqId: number; createFeedbackDto: any }) {
    return this.faqsService.saveFeedback(data.faqId, data.createFeedbackDto);
  }

  @MessagePattern('get_feedback_stats')
  async handleGetFeedbackStats(@Payload() data: { faqId: number }) {
    return this.faqsService.getFeedbackStats(data.faqId);
  }

  @MessagePattern('get_feedback_summary')
  async handleGetFeedbackSummary(@Payload() data: { faqId: number }) {
    return this.faqsService.getFeedbackSummaryByFaq(data.faqId);
  }

  @MessagePattern('get_feedback_details')
  async handleGetFeedbackDetails(@Payload() data: { faqId: number }) {
    return this.faqsService.getFeedbackDetailsByFaq(data.faqId);
  }
}