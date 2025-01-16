import { BadRequestException, Controller, NotFoundException, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LinksOfInterestService } from './links-of-interest.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import PDFDocument from 'pdfkit';
import path from 'path';

@Controller()
export class LinksOfInterestController {
  constructor(private readonly linksService: LinksOfInterestService) { }

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
    if (!data?.query) {
      throw new BadRequestException('El parámetro "query" es obligatorio');
    }
    return this.linksService.searchLinks(data.query);
  }

  // Crear un nuevo artículo
  @MessagePattern('create_link')
  async handleCreateLink(@Payload() data: CreateLinkDto) {
    const requiredFields = ['ownerName', 'title', 'description', 'sourceLink'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new BadRequestException(`El campo "${field}" es obligatorio`);
      }
    }
    return this.linksService.createLink(data);
  }

  // Actualizar un artículo existente
  @MessagePattern('update_link')
  async handleUpdateLink(@Payload() data: { linkId: string; updateLinkDto: UpdateLinkDto }) {
    if (!data?.linkId || !data?.updateLinkDto) {
      throw new BadRequestException('Debe proporcionar un "linkId" y los datos de actualización');
    }
    return this.linksService.updateLink(data.linkId, data.updateLinkDto);
  }

  // Eliminar un artículo
  @MessagePattern('delete_link')
  async handleDeleteLink(@Payload() data: { linkId: string }) {
    if (!data?.linkId) {
      throw new BadRequestException('Debe proporcionar el "linkId" del enlace a eliminar');
    }
    return this.linksService.deleteLink(data.linkId);
  }

  // Actualizar el estado de un enlace
  @MessagePattern('update_link_status')
  async handleUpdateLinkStatus(@Payload() data: { linkId: string; status: 'approved' | 'rejected' }) {
    if (!data?.linkId || !['approved', 'rejected'].includes(data.status)) {
      throw new BadRequestException('Debe proporcionar un "linkId" válido y un estado válido ("approved" o "rejected")');
    }
    return this.linksService.updateLinkStatus(data.linkId, data.status);
  }

  // Obtener enlaces por estado
  @MessagePattern('get_links_by_status')
  async handleGetLinksByStatus(@Payload() data: { status: string }) {
    if (!data?.status || !['approved', 'pending'].includes(data.status)) {
      throw new BadRequestException('Debe proporcionar un estado válido ("approved" o "pending")');
    }
    return this.linksService.getLinksByStatus(data.status);
  }

  // Obtener un artículo por linkId
  @MessagePattern('get_link_by_id')
  async handleGetLinkById(@Payload() data: { linkId: string }) {
    if (!data?.linkId) {
      throw new BadRequestException('Debe proporcionar el "linkId" del enlace');
    }
    const link = await this.linksService.getLinkById(data.linkId);
    if (!link) {
      throw new NotFoundException(`No se encontró el enlace con "linkId" ${data.linkId}`);
    }
    return link;
  }

  // Programar la publicación de un artículo
  @MessagePattern('schedule_link_publication')
  async handleSchedulePublication(@Payload() data: { linkId: string; publishDate: Date }) {
    if (!data?.linkId || !data?.publishDate) {
      throw new BadRequestException('Debe proporcionar un "linkId" y una "publishDate" válidos');
    }
    return this.linksService.schedulePublication(data.linkId, new Date(data.publishDate));
  }

  /************************************************************************************/
  /** CATEGORÍAS **/

  // Obtener todas las categorías
  @MessagePattern('get_all_categories')
  async handleGetAllCategories() {
    return this.linksService.getAllCategories();
  }

  // Crear una nueva categoría
  @MessagePattern('create_category')
  async handleCreateCategory(@Payload() data: CreateCategoryDto) {
    if (!data?.name) {
      throw new BadRequestException('El nombre de la categoría es obligatorio');
    }
    return this.linksService.createCategory(data);
  }

  // Actualizar una categoría existente
  @MessagePattern('update_category')
  async handleUpdateCategory(@Payload() data: { id: number; updateCategoryDto: UpdateCategoryDto }) {
    if (!data?.id || !data?.updateCategoryDto?.name) {
      throw new BadRequestException('Debe proporcionar un "id" de categoría y un nombre válido');
    }
    const result = await this.linksService.updateCategory(data.id, data.updateCategoryDto);
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
    return this.linksService.deleteCategory(data.id);
  }

  // Obtener artículos por categoría
  @MessagePattern('get_links_by_category')
  async handleGetLinksByCategory(@Payload() data: { categoryId: number }) {
    if (!data?.categoryId) {
      throw new BadRequestException('Debe proporcionar un "categoryId"');
    }
    return this.linksService.getLinksByCategory(data.categoryId);
  }

  /************************************************************************************/
  /** DESCARGAR ENLACES EN PDF **/
  @MessagePattern('download_pdf')
  async downloadLinkAsPDF(@Payload() data: { linkId: string }) {
    if (!data?.linkId) {
      throw new BadRequestException('Debe proporcionar el "linkId" del enlace');
    }

    const link = await this.linksService.getLinkById(data.linkId);

    if (!link) {
      throw new NotFoundException(`No se encontró el enlace con "linkId" ${data.linkId}`);
    }

    const pdfBuffer = await this.linksService.generatePDF(link);

    return {
      status: 200,
      filename: `${link.title}.pdf`,
      contentType: 'application/pdf',
      data: pdfBuffer.toString('base64'),
    };
  }
}