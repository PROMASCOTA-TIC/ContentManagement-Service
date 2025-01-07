import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LinksOfInterestService } from './links-of-interest.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller()
export class LinksOfInterestController {
  constructor(private readonly linksService: LinksOfInterestService) {}

  /************************************************************************************/
  /** ENLACES **/

  // Obtener todos los artículos
  @MessagePattern('get_all_links')
  async handleGetAllLinks() {
    return this.linksService.getAllLinks();
  }

  // Buscar artículos por título
  @MessagePattern('search_links')
  async handleSearchLinks(@Payload() data: { query: string }) {
    return this.linksService.searchLinks(data.query);
  }

  // Crear un nuevo artículo
  @MessagePattern('create_link')
  async handleCreateLink(@Payload() data: CreateLinkDto) {
    if (!data.linkId || !data.ownerName || !data.title || !data.description || !data.sourceLink) {
      throw new Error('Faltan campos obligatorios en la creación del enlace');
    }
    return this.linksService.createLink(data);
  }

  // Actualizar un artículo existente
  @MessagePattern('update_link')
  async handleUpdateLink(@Payload() data: { linkId: string; updateLinkDto: UpdateLinkDto }) {
    if (!data.updateLinkDto) {
      throw new Error('No se proporcionó información para actualizar el enlace');
    }
    return this.linksService.updateLink(data.linkId, data.updateLinkDto);
  }

  // Eliminar un artículo
  @MessagePattern('delete_link')
  async handleDeleteLink(@Payload() data: { linkId: string }) {
    if (!data.linkId) {
      throw new Error('ID del enlace no proporcionado');
    }
    return this.linksService.deleteLink(data.linkId);
  }

  // Actualizar el estado de un enlace
  @MessagePattern('update_link_status')
  async handleUpdateLinkStatus(@Payload() data: { linkId: string; status: 'approved' | 'rejected' }) {
    if (!data.linkId || !['approved', 'rejected'].includes(data.status)) {
      throw new Error('Parámetros inválidos: debe proporcionarse un linkId y un estado válido ("approved" o "rejected")');
    }
    return this.linksService.updateLinkStatus(data.linkId, data.status);
  }

  // Obtener enlaces por estado
  @MessagePattern('get_links_by_status')
  async handleGetLinksByStatus(@Payload() data: { status: string }) {
    if (!data.status) {
      return { message: 'El parámetro status es obligatorio' };
    }
    if (!['approved', 'pending'].includes(data.status)) {
      return { message: 'El parámetro status debe ser "approved" o "pending"' };
    }
    return this.linksService.getLinksByStatus(data.status);
  }

  // Obtener un artículo por linkId
  @MessagePattern('get_link_by_id')
  async handleGetLinkById(@Payload() data: { linkId: string }) {
    if (!data.linkId) {
      throw new Error('linkId del enlace no proporcionado');
    }
    return this.linksService.getLinkById(data.linkId);
  }

  // Programar la publicación de un artículo
  @MessagePattern('schedule_link_publication')
  async handleSchedulePublication(@Payload() data: { linkId: string; publishDate: Date }) {
    if (!data.linkId || !data.publishDate) {
      throw new Error('Parámetros inválidos: debe proporcionarse un linkId y una fecha de publicación');
    }
    return this.linksService.schedulePublication(data.linkId, new Date(data.publishDate));
  }

  /************************************************************************************/
  /** CATEGORIAS **/

  // Obtener todas las categorías
  @MessagePattern('get_all_categories')
  async handleGetAllCategories() {
    return this.linksService.getAllCategories();
  }

  // Crear una nueva categoría
  @MessagePattern('create_category')
  async handleCreateCategory(@Payload() data: CreateCategoryDto) {
    if (!data.name) {
      throw new Error('El nombre de la categoría es obligatorio');
    }
    return this.linksService.createCategory(data);
  }

  // Actualizar una categoría existente
  @MessagePattern('update_category')
  async handleUpdateCategory(@Payload() data: { id: number; updateCategoryDto: UpdateCategoryDto }) {
    if (!data.id || !data.updateCategoryDto.name) {
      throw new Error('Debe proporcionarse un ID de categoría y un nombre válido');
    }
    return this.linksService.updateCategory(data.id, data.updateCategoryDto);
  }

  // Eliminar una categoría
  @MessagePattern('delete_category')
  async handleDeleteCategory(@Payload() data: { id: number }) {
    if (!data.id) {
      throw new Error('ID de la categoría no proporcionado');
    }
    return this.linksService.deleteCategory(data.id);
  }

  // Obtener artículos por categoría
  @MessagePattern('get_links_by_category')
  async handleGetLinksByCategory(@Payload() data: { categoryId: number }) {
    if (!data.categoryId) {
      throw new Error('ID de la categoría no proporcionado');
    }
    return this.linksService.getLinksByCategory(data.categoryId);
  }

  /************************************************************************************/
  /** DESCARGAR ENLACES EN PDF **/

  @MessagePattern('download_link_as_pdf')
  async handleDownloadLinkAsPDF(@Payload() data: { linkId: string }) {
    if (!data.linkId) {
      throw new Error('linkId del enlace no proporcionado');
    }
    const link = await this.linksService.getLinkById(data.linkId);
    if (!link) {
      throw new Error('Artículo no encontrado');
    }

    // Crear el PDF como buffer y devolverlo como respuesta
    const pdfBuffer = await this.linksService.generatePDFBuffer(link);
    return { filename: `${link.title}.pdf`, pdfBuffer };
  }
}