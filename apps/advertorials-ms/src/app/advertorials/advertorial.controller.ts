import { Controller } from '@nestjs/common';
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
  @MessagePattern({ cmd: 'get_all_advertorials' })
  async handleGetAllAdvertorials() {
    return this.advertorialsService.getAllAdvertorials();
  }

  // Buscar publireportajes por título
  @MessagePattern({ cmd: 'search_advertorials' })
  async handleSearchAdvertorials(@Payload() data: { query: string }) {
    if (!data.query || typeof data.query !== 'string') {
      throw new Error('Query parameter must be a valid string');
    }
    return this.advertorialsService.searchAdvertorials(data.query);
  }

  // Crear un nuevo publireportaje
  @MessagePattern({ cmd: 'create_advertorial' })
  async handleCreateAdvertorial(@Payload() data: CreateAdvertorialDto) {
    return this.advertorialsService.createAdvertorial(data);
  }

  // Actualizar un publireportaje existente
  @MessagePattern({ cmd: 'update_advertorial' })
  async handleUpdateAdvertorial(
    @Payload() data: { id: number; updateAdvertorialDto: UpdateAdvertorialDto },
  ) {
    return this.advertorialsService.updateAdvertorial(data.id, data.updateAdvertorialDto);
  }

  // Eliminar un publireportaje
  @MessagePattern({ cmd: 'delete_advertorial' })
  async handleDeleteAdvertorial(@Payload() data: { id: number }) {
    return this.advertorialsService.deleteAdvertorial(data.id);
  }

  // Actualizar el estado de un publireportaje
  @MessagePattern({ cmd: 'update_advertorial_status' })
  async handleUpdateAdvertorialStatus(
    @Payload() data: { id: number; status: 'approved' | 'rejected' },
  ) {
    if (!['approved', 'rejected'].includes(data.status)) {
      throw new Error('Invalid status value');
    }
    return this.advertorialsService.updateAdvertorialStatus(data.id, data.status);
  }

  // Obtener publireportajes por estado
  @MessagePattern({ cmd: 'get_advertorials_by_status' })
  async handleGetAdvertorialsByStatus(@Payload() data: { status: string }) {
    if (!data.status) {
      return { message: 'El parámetro status es obligatorio' };
    }

    if (!['approved', 'pending'].includes(data.status)) {
      return { message: 'El parámetro status debe ser "approved" o "pending"' };
    }

    return this.advertorialsService.getAdvertorialsByStatus(data.status);
  }

  // Obtener un publireportaje por ID
  @MessagePattern({ cmd: 'get_advertorial_by_id' })
  async handleGetAdvertorialById(@Payload() data: { id: number }) {
    try {
      return await this.advertorialsService.getAdvertorialById(data.id);
    } catch (error) {
      throw new Error('No se encontró el publireportaje con el ID proporcionado');
    }
  }

  // Programar la publicación de un publireportaje
  @MessagePattern({ cmd: 'schedule_advertorial_publication' })
  async handleSchedulePublication(@Payload() data: { id: number; publishDate: Date }) {
    return this.advertorialsService.schedulePublication(data.id, new Date(data.publishDate));
  }

  /************************************************************************************/
  /** CATEGORÍAS **/

  // Obtener todas las categorías
  @MessagePattern({ cmd: 'get_all_categories' })
  async handleGetAllCategories() {
    return this.advertorialsService.getAllCategories();
  }

  // Crear una nueva categoría
  @MessagePattern({ cmd: 'create_category' })
  async handleCreateCategory(@Payload() data: CreateCategoryDto) {
    return this.advertorialsService.createCategory(data);
  }

  // Actualizar una categoría existente
  @MessagePattern({ cmd: 'update_category' })
  async handleUpdateCategory(
    @Payload() data: { id: number; updateCategoryDto: UpdateCategoryDto },
  ) {
    return this.advertorialsService.updateCategory(data.id, data.updateCategoryDto);
  }

  // Eliminar una categoría
  @MessagePattern({ cmd: 'delete_category' })
  async handleDeleteCategory(@Payload() data: { id: number }) {
    return this.advertorialsService.deleteCategory(data.id);
  }

  // Obtener publireportajes por categoría
  @MessagePattern({ cmd: 'get_advertorials_by_category' })
  async handleGetAdvertorialsByCategory(@Payload() data: { categoryId: number }) {
    return this.advertorialsService.getAdvertorialsByCategory(data.categoryId);
  }
}