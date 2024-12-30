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
  // ENLACES DE INTERES
  // Obtener todos los artículos
  async getAllLinks(): Promise<Link[]> {
    return this.linkModel.findAll({ include: [Category] });
  }

  // Buscar artículos por título
  async searchLinks(query: string): Promise<Link[]> {
    return this.linkModel.findAll({
      where: { title: { $like: `%${query}%` } },
      include: [Category],
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
  async updateLink(id: number, updateLinkDto: UpdateLinkDto): Promise<Link> {
    const link = await this.linkModel.findByPk(id);
    if (!link) {
      throw new BadRequestException('El artículo no fue encontrado.');
    }

    // Validar la fecha de publicación
    if (updateLinkDto.publishDate) {
      const publishDate = new Date(updateLinkDto.publishDate);
      if (isNaN(publishDate.getTime())) {
        throw new BadRequestException('La fecha de publicación no es válida.');
      }
      updateLinkDto.publishDate = publishDate;
    }

    return link.update(updateLinkDto);
  }

  // Eliminar un artículo
  async deleteLink(id: number): Promise<number> {
    return this.linkModel.destroy({ where: { id } });
  }

   // Filtrar enlaces por estado
   async getLinksByStatus(status: string): Promise<Link[]> {
    return this.linkModel.findAll({
      where: { status },
    });
  }

  // Programar la publicación de un artículo
  async schedulePublication(id: number, publishDate: Date): Promise<string> {
    const link = await this.linkModel.findByPk(id);
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

    // Crear una tarea programada
    const job = new CronJob(publishDate, async () => {
      // Cambiar el estado a 'approved'
      link.status = 'approved';
      await link.save();
      console.log(`Artículo con ID ${id} publicado automáticamente.`);
    });

    // Registrar la tarea en SchedulerRegistry
    this.schedulerRegistry.addCronJob(`publish-link-${id}`, job);
    job.start();

    return `Publicación programada para el artículo con ID ${id} en la fecha ${publishDate}`;
  }

  /************************************************************************************/
  // CATEGORIAS
  // Obtener todas las categorías
  async getAllCategories(): Promise<Category[]> {
    return this.categoryModel.findAll();
  }

  // Crear una nueva categoría
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryModel.create(createCategoryDto);
  }

  // Actualizar una categoría existente
  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto): Promise<[number, Category[]]> {
    return this.categoryModel.update(updateCategoryDto, { where: { id }, returning: true });
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
  async updateLinkStatus(id: number, status: 'approved' | 'rejected'): Promise<Link> {
    // Verificar si el enlace existe
    const link = await this.linkModel.findByPk(id);
    if (!link) {
      throw new BadRequestException(`Link with ID ${id} not found`);
    }

    // Actualizar el estado
    link.status = status;
    await link.save();

    return link;
  }

  /************************************************************************************/
  /** DESCARGAR ENLACES EN PDF **/
  // Obtener un enlace por su ID
  async getLinkById(id: number): Promise<Link> {
    const link = await this.linkModel.findByPk(id, { include: [Category] });
    if (!link) {
      throw new BadRequestException(`Link with ID ${id} not found`);
    }
    return link;
  }
}
