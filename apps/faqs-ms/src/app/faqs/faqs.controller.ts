import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
  ParseIntPipe
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FaqsService } from './faqs.service';

@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) { }

  /************************************************************************************/
  /** PREGUNTAS FRECUENTES **/

  @Get('faqs')
  getAllFaqs() {
    return this.faqsService.getAllFaqs();
  }

  @Get('search')
  async searchFaqs(@Query('query') query: string) {
    if (!query || typeof query !== 'string') {
      throw new BadRequestException('Query parameter must be a valid string');
    }
    return this.faqsService.searchFaqs(query);
  }

  @Post('faqs')
  createFaq(@Body() createFaqDto: CreateFaqDto) {
    return this.faqsService.createFaq(createFaqDto);
  }

  @Put('faqs/:id')
  updateFaq(@Param('id') id: number, @Body() updateFaqDto: UpdateFaqDto) {
    return this.faqsService.updateFaq(id, updateFaqDto);
  }

  @Delete('faqs/:id')
  deleteFaq(@Param('id') id: number) {
    return this.faqsService.deleteFaq(id);
  }

  @Get('faqs/:id')
  async getFaqById(@Param('id') id: number) {
    return this.faqsService.getFaqById(id);
  }

  /************************************************************************************/
  /** CATEGORÍAS **/

  @Get('categories')
  getAllCategories() {
    return this.faqsService.getAllCategories();
  }

  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.faqsService.createCategory(createCategoryDto);
  }

  @Put('categories/:id')
  updateCategory(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.faqsService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: number) {
    return this.faqsService.deleteCategory(id);
  }

  @Get('categories/:categoryId/faqs')
  async getFaqsByCategory(@Param('categoryId') categoryId: number) {
    return this.faqsService.getFaqsByCategory(categoryId);
  }

  /************************************************************************************/
  /** FEEDBACK **/
  @Post(':faqId/feedback')
  async registerFeedback(
    @Param('faqId') faqId: number,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    return this.faqsService.saveFeedback(faqId, createFeedbackDto);
  }

  @Get(':faqId/feedback-stats')
  async getFeedbackStats(@Param('faqId') faqId: number) {
    return this.faqsService.getFeedbackStats(faqId);
  }

  @Get(':faqId/feedback-summary')
  async getFeedbackSummaryByFaq(@Param('faqId', ParseIntPipe) faqId: number) {
    return this.faqsService.getFeedbackSummaryByFaq(faqId);
  }

  @Get(':faqId/feedback-details')
  async getFeedbackDetailsByFaq(@Param('faqId', ParseIntPipe) faqId: number) {
    return this.faqsService.getFeedbackDetailsByFaq(faqId);
  }
}