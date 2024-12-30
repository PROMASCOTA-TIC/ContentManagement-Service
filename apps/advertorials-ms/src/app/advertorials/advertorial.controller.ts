import { Controller, Get, Post, Put, Delete, Param, Body, Query, Patch, BadRequestException, Res } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdvertorialsService } from './advertorial.service';
import { CreateAdvertorialDto } from './dto/create-advertorial.dto';
import { UpdateAdvertorialDto } from './dto/update-advertorial.dto';

@Controller('advertorials')
export class AdvertorialsController {
  constructor(private readonly AdvertorialsService: AdvertorialsService) { }

  /************************************************************************************/
  /** ENLACES **/
  // Obtener todos los artículos
  @Get('advertorials')
  getAllAdvertorials() {
    return this.AdvertorialsService.getAllAdvertorials();
  }

  // Buscar artículos por título
  @Get('search')
  async searchAdvertorials(@Query('query') query: string) {
    if (!query || typeof query !== 'string') {
      throw new BadRequestException('Query parameter must be a valid string');
    }
    return this.AdvertorialsService.searchAdvertorials(query);
  }

  // Crear un nuevo artículo
  @Post('advertorials')
  createAdvertorial(@Body() CreateAdvertorialDto: CreateAdvertorialDto) {
    return this.AdvertorialsService.createAdvertorial(CreateAdvertorialDto);
  }

  // Actualizar un artículo existente
  @Put('advertorials/:id')
  async updateAdvertorial(
    @Param('id') id: number,
    @Body() updateAdvertorialDto: UpdateAdvertorialDto,
  ) {
    return this.AdvertorialsService.updateAdvertorial(id, updateAdvertorialDto);
  }

  // Eliminar un artículo
  @Delete('advertorials/:id')
  deleteAdvertorial(@Param('id') id: number) {
    return this.AdvertorialsService.deleteAdvertorial(id);
  }

  // Actualizar el estado de un enlace
  @Patch('advertorials/:id/status')
  async updateAdvertorialStatus(
    @Param('id') id: number,
    @Body('status') status: 'approved' | 'rejected',
  ) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new BadRequestException('Invalid status value');
    }
    return this.AdvertorialsService.updateAdvertorialStatus(id, status);
  }

  // Obtener enlaces por estado
  @Get('advertorials-by-status')
  async getAdvertorialsByStatus(@Query('status') status: string) {
    if (!status) {
      return { message: 'El parámetro status es obligatorio' };
    }

    if (!['approved', 'pending'].includes(status)) {
      return { message: 'El parámetro status debe ser "approved" o "pending"' };
    }

    return this.AdvertorialsService.getAdvertorialsByStatus(status);
  }

  // Obtener un artículo por ID
  @Get('advertorials/:id')
  async getAdvertorialById(@Param('id') id: number) {
    try {
      return await this.AdvertorialsService.getAdvertorialById(id);
    } catch (error) {
      throw new BadRequestException('No se encontró el artículo con el ID proporcionado');
    }
  }

  // Programar la publicación de un artículo
  @Post('advertorials/:id/schedule-publication')
  async schedulePublication(
    @Param('id') id: number,
    @Body('publishDate') publishDate: Date,
  ) {
    return this.AdvertorialsService.schedulePublication(id, new Date(publishDate));
  }


  /************************************************************************************/
  /** CATEGORIAS **/
  // Obtener todas las categorías
  @Get('categories')
  getAllCategories() {
    return this.AdvertorialsService.getAllCategories();
  }

  // Crear una nueva categoría
  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.AdvertorialsService.createCategory(createCategoryDto);
  }

  // Actualizar una categoría existente
  @Put('categories/:id')
  updateCategory(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.AdvertorialsService.updateCategory(id, updateCategoryDto);
  }

  // Eliminar una categoría
  @Delete('categories/:id')
  deleteCategory(@Param('id') id: number) {
    return this.AdvertorialsService.deleteCategory(id);
  }

  // Obtener artículos por categoría
  @Get('categories/:categoryId/advertorials')
  async getAdvertorialsByCategory(@Param('categoryId') categoryId: number) {
    return this.AdvertorialsService.getAdvertorialsByCategory(categoryId);
  }
}