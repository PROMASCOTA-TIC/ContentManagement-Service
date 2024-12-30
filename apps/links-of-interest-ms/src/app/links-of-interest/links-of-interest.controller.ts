import { Controller, Get, Post, Put, Delete, Param, Body, Query, Patch, BadRequestException, Res } from '@nestjs/common';
import { LinksOfInterestService } from './links-of-interest.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { Response } from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';

@Controller('links-of-interest')
export class LinksOfInterestController {
  constructor(private readonly linksService: LinksOfInterestService) { }

  /************************************************************************************/
  /** ENLACES **/
  // Obtener todos los artículos
  @Get('links')
  getAllLinks() {
    return this.linksService.getAllLinks();
  }

  // Buscar artículos por título
  @Get('search')
  searchLinks(@Query('query') query: string) {
    return this.linksService.searchLinks(query);
  }

  // Crear un nuevo artículo
  @Post('links')
  createLink(@Body() createLinkDto: CreateLinkDto) {
    return this.linksService.createLink(createLinkDto);
  }

  // Actualizar un artículo existente
  @Put('links/:id')
  async updateLink(
    @Param('id') id: number,
    @Body() updateLinkDto: UpdateLinkDto,
  ) {
    return this.linksService.updateLink(id, updateLinkDto);
  }

  // Eliminar un artículo
  @Delete('links/:id')
  deleteLink(@Param('id') id: number) {
    return this.linksService.deleteLink(id);
  }

  // Actualizar el estado de un enlace
  @Patch('links/:id/status')
  async updateLinkStatus(
    @Param('id') id: number,
    @Body('status') status: 'approved' | 'rejected',
  ) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new BadRequestException('Invalid status value');
    }
    return this.linksService.updateLinkStatus(id, status);
  }

  // Obtener enlaces por estado
  @Get('links-by-status')
  async getLinksByStatus(@Query('status') status: string) {
    if (!status) {
      return { message: 'El parámetro status es obligatorio' };
    }

    if (!['approved', 'pending'].includes(status)) {
      return { message: 'El parámetro status debe ser "approved" o "pending"' };
    }

    return this.linksService.getLinksByStatus(status);
  }

  // Obtener un artículo por ID
  @Get('links/:id')
  async getLinkById(@Param('id') id: number) {
    return this.linksService.getLinkById(id);
  }

  // Programar la publicación de un artículo
  @Post('links/:id/schedule-publication')
  async schedulePublication(
    @Param('id') id: number,
    @Body('publishDate') publishDate: Date,
  ) {
    return this.linksService.schedulePublication(id, new Date(publishDate));
  }


  /************************************************************************************/
  /** CATEGORIAS **/
  // Obtener todas las categorías
  @Get('categories')
  getAllCategories() {
    return this.linksService.getAllCategories();
  }

  // Crear una nueva categoría
  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.linksService.createCategory(createCategoryDto);
  }

  // Actualizar una categoría existente
  @Put('categories/:id')
  updateCategory(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.linksService.updateCategory(id, updateCategoryDto);
  }

  // Eliminar una categoría
  @Delete('categories/:id')
  deleteCategory(@Param('id') id: number) {
    return this.linksService.deleteCategory(id);
  }

  // Obtener artículos por categoría
  @Get('categories/:categoryId/links')
  async getLinksByCategory(@Param('categoryId') categoryId: number) {
    return this.linksService.getLinksByCategory(categoryId);
  }

  /************************************************************************************/
  /** DESCARGAR ENLACES EN PDF **/
  // Descargar artículo como PDF
  @Get('links/:id/download')
  async downloadLinkAsPDF(@Param('id') id: number, @Res() res: Response) {
    // Obtener los datos del artículo
    const link = await this.linksService.getLinkById(id);
    if (!link) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Configurar el PDF
    const doc = new PDFDocument();

    // Ruta absoluta a las fuentes después de la compilación
    const fontsPath = path.join(
      process.cwd(), // Apunta al directorio raíz del proyecto (dist)
      'dist/apps/links-of-interest-ms/assets/fonts' // Ruta relativa desde `dist`
    );

    // Registra las fuentes personalizadas
    doc.registerFont('Regular', path.join(fontsPath, 'WorkSans-Regular.ttf'));
    doc.registerFont('Bold', path.join(fontsPath, 'WorkSans-Bold.ttf'));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${link.title}.pdf`);

    // Agregar contenido al PDF
    doc.pipe(res); // Enviar el PDF como respuesta
    doc.fontSize(16).font('Bold').fillColor('#004040').text(`Categoría: ${link.category.name}`, { align: 'left' }); // Nombre de la categoría
    doc.moveDown();
    doc.fontSize(20).font('Bold').fillColor('#00AA28').text(link.title, { align: 'center' }); // Título del artículo
    doc.moveDown();
    doc.fontSize(16).font('Regular').fillColor('black').text(link.description, { align: 'justify' });
    doc.moveDown();
    doc
      .font('Bold') // Negrilla
      .text('Compartido por: ', { continued: true }) // Mantiene el texto en la misma línea
      .font('Regular') // Negrilla
      .text(link.ownerName); // Sin negrilla
    doc.moveDown();
    doc
      .font('Bold') // Negrilla
      .text('Fuentes: ', { continued: true }) // Mantiene el texto en la misma línea
      .font('Regular') // Negrilla
      .text(link.sourceLink); // Sin negrilla

    doc.end(); // Finalizar el PDF
  }
}
