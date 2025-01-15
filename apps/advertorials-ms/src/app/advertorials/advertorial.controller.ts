import { BadRequestException, Controller, NotFoundException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdvertorialsService } from './advertorial.service';
import { CreateAdvertorialDto } from './dto/create-advertorial.dto';
import { UpdateAdvertorialDto } from './dto/update-advertorial.dto';

@Controller()
export class AdvertorialsController {
  constructor(private readonly advertorialsService: AdvertorialsService) {}

  /************************************************************************************/
  /** PUBLIREPORTAJES **/

  // Obtener todos los publireportajes
  @MessagePattern('get_all_advertorials')
  async handleGetAllAdvertorials() {
    return this.advertorialsService.getAllAdvertorials();}

  // Buscar publireportajes por título
  @MessagePattern('search_advertorials')
  async handleSearchAdvertorials(@Payload() data: { query: string }) {
    if (!data.query || typeof data.query !== 'string') {
      throw new Error('Query parameter must be a valid string');
    }
    return this.advertorialsService.searchAdvertorials(data.query);
  }

  // Crear un nuevo artículo
  @MessagePattern('create_advertorial')
  async handleCreateAdvertorial(@Payload() data: CreateAdvertorialDto) {
    const requiredFields = ['ownerName', 'ownerEmail', 'title', 'description', 'sourceLink'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new BadRequestException(`El campo "${field}" es obligatorio`);
      }
    }
    return this.advertorialsService.createAdvertorial(data);
  }

  // Actualizar un publireportaje existente
  @MessagePattern('update_advertorial')
  async handleUpdateAdvertorial(
    @Payload() data: { advertorialId: string; updateAdvertorialDto: UpdateAdvertorialDto },
  ) {
    if (!data?.advertorialId || !data?.updateAdvertorialDto) {
      throw new BadRequestException('Debe proporcionar un "advertorialId" y los datos de actualización');
    }
    return this.advertorialsService.updateAdvertorial(data.advertorialId, data.updateAdvertorialDto);
  }

  // Eliminar un publireportaje
  @MessagePattern('delete_advertorial')
  async handleDeleteAdvertorial(@Payload() data: { advertorialId: string }) {
    if (!data?.advertorialId) {
      throw new BadRequestException('Debe proporcionar el "advertorialId" del enlace a eliminar');
    }
    return this.advertorialsService.deleteAdvertorial(data.advertorialId);
  }

  // Actualizar el estado de un publireportaje
  @MessagePattern('update_advertorial_status')
  async handleUpdateAdvertorialStatus(
    @Payload() data: { advertorialId: string; status: 'approved' | 'rejected' },
  ) {
    if (!data?.advertorialId || !['approved', 'rejected'].includes(data.status)) {
      throw new BadRequestException('Debe proporcionar un "advertorialId" válido y un estado válido ("approved" o "rejected")');
    }
    return this.advertorialsService.updateAdvertorialStatus(data.advertorialId, data.status);
  }

  // Obtener publireportajes por estado
  @MessagePattern('get_advertorials_by_status')
  async handleGetAdvertorialsByStatus(@Payload() data: { status: string }) {
    if (!data?.status || !['approved', 'pending'].includes(data.status)) {
      throw new BadRequestException('Debe proporcionar un estado válido ("approved" o "pending")');
    }
    return this.advertorialsService.getAdvertorialsByStatus(data.status);
  }

  // Obtener un publireportaje por advertorialId
  @MessagePattern('get_advertorial_by_id')
  async handleGetAdvertorialById(@Payload() data: { advertorialId: string }) {
    if (!data?.advertorialId) {
      throw new BadRequestException('Debe proporcionar el "advertorialId" del enlace');
    }
    const advertorial = await this.advertorialsService.getAdvertorialById(data.advertorialId);
    if (!advertorial) {
      throw new NotFoundException(`No se encontró el enlace con "advertorialId" ${data.advertorialId}`);
    }
    return advertorial;
  }

  // Programar la publicación de un publireportaje
  @MessagePattern('schedule_advertorial_publication')
  async handleSchedulePublication(@Payload() data: { advertorialId: string; publishDate: Date }) {
    if (!data?.advertorialId || !data?.publishDate) {
      throw new BadRequestException('Debe proporcionar un "advertorialId" y una "publishDate" válidos');
    }
    return this.advertorialsService.schedulePublication(data.advertorialId, new Date(data.publishDate));
  }

  /************************************************************************************/
  /** CATEGORÍAS **/

  /** CATEGORÍAS **/

  // Obtener todas las categorías
  @MessagePattern('get_all_categories')
  async handleGetAllCategories() {
    return this.advertorialsService.getAllCategories();
  }

  // Crear una nueva categoría
  @MessagePattern('create_category')
  async handleCreateCategory(@Payload() data: CreateCategoryDto) {
    if (!data?.name) {
      throw new BadRequestException('El nombre de la categoría es obligatorio');
    }
    return this.advertorialsService.createCategory(data);
  }

  // Actualizar una categoría existente
  @MessagePattern('update_category')
  async handleUpdateCategory(@Payload() data: { id: number; updateCategoryDto: UpdateCategoryDto }) {
    if (!data?.id || !data?.updateCategoryDto?.name) {
      throw new BadRequestException('Debe proporcionar un "id" de categoría y un nombre válido');
    }
    const result = await this.advertorialsService.updateCategory(data.id, data.updateCategoryDto);
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
    return this.advertorialsService.deleteCategory(data.id);
  }

  // Obtener artículos por categoría
  @MessagePattern('get_advertorials_by_category')
  async handleGetAdvertorialsByCategory(@Payload() data: { categoryId: number }) {
    if (!data?.categoryId) {
      throw new BadRequestException('Debe proporcionar un "categoryId"');
    }
    return this.advertorialsService.getAdvertorialsByCategory(data.categoryId);
  }
}