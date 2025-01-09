import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Link } from './models/link.models';
import { Category } from './models/category.model';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import PDFDocument from 'pdfkit';
import * as path from 'path';
import { Op, Sequelize } from 'sequelize';

@Injectable()
export class LinksOfInterestService {
  constructor(
    @InjectModel(Link)
    private readonly linkModel: typeof Link,
    private readonly schedulerRegistry: SchedulerRegistry,
    @InjectModel(Category)
    private readonly categoryModel: typeof Category,
  ) { }

  /************************************************************************************/
  /** ENLACES DE INTERÉS **/

  // Obtener todos los artículos
  async getAllLinks(): Promise<Link[]> {
    return this.linkModel.findAll({ include: [Category] });
  }

  // Buscar artículos por título
  async searchLinks(query: string): Promise<Link[]> {
    const escapedQuery = query.replace(/[%_]/g, '\\$&'); // Escapar caracteres especiales
    return this.linkModel.findAll({
      where: {
        [Op.and]: [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), {
            [Op.like]: `%${escapedQuery.toLowerCase()}%`,
          }),
        ],
      },
    });
  }

  // Crear un nuevo artículo
  async createLink(createLinkDto: CreateLinkDto): Promise<Link> {
    // Validar si la categoría existe
    const category = await this.categoryModel.findByPk(createLinkDto.categoryId);
    if (!category) {
      throw new BadRequestException('Invalid categoryId: Category not found');
    }

    // Crear el artículo si la categoría existe
    return this.linkModel.create(createLinkDto);
  }

  // Actualizar un artículo, incluida la fecha de publicación
  async updateLink(linkId: string, updateLinkDto: UpdateLinkDto): Promise<Link> {
    console.log('Datos recibidos para actualizar:', updateLinkDto);

    // Buscar el enlace por su ID
    const link = await this.linkModel.findOne({ where: { linkId } });
    if (!link) {
      throw new BadRequestException('El artículo no fue encontrado.');
    }

    // Validar y procesar la fecha de publicación
    if (updateLinkDto.publishDate) {
      const publishDate = new Date(updateLinkDto.publishDate);
      console.log("Fecha actual (UTC):", new Date().toISOString());
      console.log("Fecha de publicación recibida:", publishDate.toISOString());

      // Verificar que la fecha sea válida
      if (isNaN(publishDate.getTime())) {
        throw new BadRequestException('La fecha de publicación no es válida.');
      }

      // Verificar que la fecha sea futura
      const now = new Date();
      if (publishDate <= now) {
        throw new BadRequestException('La fecha de publicación debe ser en el futuro.');
      }

      // Asignar la fecha de publicación al DTO
      updateLinkDto.publishDate = publishDate.toISOString();

      // Programar la publicación automática
      const jobName = `publish-link-${linkId}`;

      // Si ya existe una tarea programada, eliminarla
      if (this.schedulerRegistry.doesExist('cron', jobName)) {
        this.schedulerRegistry.deleteCronJob(jobName);
        console.log(`Tarea programada "${jobName}" eliminada para evitar duplicados.`);
      }

      // Crear nueva tarea cron
      const job = new CronJob(publishDate, async () => {
        link.status = 'approved'; // Cambiar el estado a "approved"
        await link.save();
        console.log(`El artículo con ID ${linkId} ha sido publicado automáticamente.`);

        // Eliminar el cron una vez completado
        this.schedulerRegistry.deleteCronJob(jobName);
        console.log(`Tarea "${jobName}" eliminada después de completar la publicación.`);
      });

      // Registrar y ejecutar el cron
      this.schedulerRegistry.addCronJob(jobName, job);
      job.start();
      console.log(`Tarea programada "${jobName}" creada para publicar el artículo.`);
    }

    // Actualizar los datos del artículo
    const updatedLinkDto = {
      ...updateLinkDto,
      publishDate: updateLinkDto.publishDate ? new Date(updateLinkDto.publishDate) : undefined,
    };
    const updatedLink = await link.update(updatedLinkDto);

    console.log(`Artículo con ID ${linkId} actualizado correctamente.`);
    return updatedLink;
  }

  // Eliminar un artículo
  async deleteLink(linkId: string): Promise<number> {
    return this.linkModel.destroy({ where: { linkId } });
  }

  // Filtrar enlaces por estado
  async getLinksByStatus(status: string): Promise<Link[]> {
    return this.linkModel.findAll({
      where: { status },
    });
  }

  // Programar la publicación de un artículo
  // Programar la publicación de un artículo
  async schedulePublication(linkId: string, publishDate: Date): Promise<string> {
    const link = await this.linkModel.findOne({ where: { linkId } });
    if (!link) {
      throw new BadRequestException('El artículo no fue encontrado.');
    }

    // Validar si la fecha de publicación es válida
    const now = new Date();
    if (publishDate <= now) {
      throw new BadRequestException('La fecha de publicación debe ser futura.');
    }

    // Actualizar la fecha de publicación en la base de datos
    link.publishDate = publishDate;
    await link.save();

    const jobName = `publish-link-${linkId}`;

    // Verificar si la tarea ya existe y eliminarla si es necesario
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      console.log(`Eliminando tarea duplicada con el nombre ${jobName}.`);
      this.schedulerRegistry.deleteCronJob(jobName);
    }

    // Crear una nueva tarea programada
    const job = new CronJob(publishDate, async () => {
      // Cambiar el estado a 'approved'
      link.status = 'approved';
      await link.save();
      console.log(`Artículo con linkId ${linkId} publicado automáticamente.`);
    });

    // Registrar la tarea en SchedulerRegistry
    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();

    return `Publicación programada para el artículo con linkId ${linkId} en la fecha ${publishDate}`;
  }

  /************************************************************************************/
  /** CATEGORIAS **/

  // Obtener todas las categorías
  async getAllCategories(): Promise<Category[]> {
    return this.categoryModel.findAll();
  }

  // Crear una nueva categoría
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryModel.create(createCategoryDto);
  }

  // Actualizar una categoría existente
  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // Realiza la actualización sin `returning: true`
    const [updatedCount] = await this.categoryModel.update(updateCategoryDto, { where: { id } });

    if (updatedCount === 0) {
      throw new Error(`No se encontró la categoría con id ${id}`);
    }

    // Realiza una búsqueda manual para obtener la categoría actualizada
    const updatedCategory = await this.categoryModel.findOne({ where: { id } });

    if (!updatedCategory) {
      throw new Error(`No se pudo obtener la categoría actualizada con id ${id}`);
    }

    return updatedCategory;
  }

  // Eliminar una categoría
  async deleteCategory(id: number): Promise<number> {
    return this.categoryModel.destroy({ where: { id } });
  }

  // Filtrar los enlaces por categoría
  async getLinksByCategory(categoryId: number): Promise<Link[]> {
    // Verificar si la categoría existe
    const category = await this.categoryModel.findByPk(categoryId);
    if (!category) {
      throw new BadRequestException(`Category with ID ${categoryId} not found`);
    }

    // Buscar los enlaces relacionados con la categoría
    return this.linkModel.findAll({
      where: { categoryId },
      include: [Category],
    });
  }

  /************************************************************************************/
  /** APROBAR O RECHAZAR ENLACES **/

  // Actualizar el estado de un enlace
  async updateLinkStatus(linkId: string, status: 'approved' | 'rejected'): Promise<Link> {
    const link = await this.linkModel.findOne({ where: { linkId } });
    if (!link) {
      throw new BadRequestException(`Link with linkId ${linkId} not found`);
    }

    // Actualizar el estado
    link.status = status;
    await link.save();

    return link;
  }

  /************************************************************************************/
  /** DESCARGAR ENLACES EN PDF **/

  async getLinkById(linkId: string) {
    if (!linkId) {
      throw new BadRequestException('El ID no puede estar vacío');
    }

    const link = await this.linkModel.findOne({
      where: { linkId },
      include: [{ model: Category }],
    });

    if (!link) {
      throw new BadRequestException(`No se encontró el enlace con el ID ${linkId}`);
    }

    return link;
  }


  // Generar el PDF como Buffer
  async generatePDF(link: Link): Promise<Buffer> {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => { });

    doc.fontSize(16).font('Helvetica-Bold').fillColor('#004040').text(`Categoría: ${link.category.name}`, { align: 'left' });
    doc.moveDown();
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#00AA28').text(link.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).font('Helvetica').fillColor('black').text(link.description, { align: 'justify' });
    doc.moveDown();
    doc.font('Helvetica-Bold').text('Compartido por: ', { continued: true }).font('Helvetica').text(link.ownerName);
    doc.moveDown();
    doc.font('Helvetica-Bold').text('Fuentes: ', { continued: true }).font('Helvetica').text(link.sourceLink);
    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
    });
  }

}