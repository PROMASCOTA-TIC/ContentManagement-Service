import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './models/category.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Advertorial } from './models/advertorial.models';
import { CreateAdvertorialDto } from './dto/create-advertorial.dto';
import { UpdateAdvertorialDto } from './dto/update-advertorial.dto';

import { Op } from 'sequelize';

@Injectable()
export class AdvertorialsService {
  constructor(
    @InjectModel(Advertorial)
    private readonly AdvertorialModel: typeof Advertorial,
    private readonly schedulerRegistry: SchedulerRegistry,
    @InjectModel(Category)
    private readonly categoryModel: typeof Category,
  ) { }

  /************************************************************************************/
  // Publoreportajes
  // Obtener todos los artículos
  async getAllAdvertorials(): Promise<Advertorial[]> {
    return this.AdvertorialModel.findAll({ include: [Category] });
  }

  // Buscar artículos por título
  async searchAdvertorials(query: string): Promise<Advertorial[]> {
    const escapedQuery = query.replace(/[%_]/g, '\\$&'); // Escapa caracteres especiales para Oracle
    return this.AdvertorialModel.findAll({
      where: {
        title: {
          [Op.like]: `%${escapedQuery}%`, // Usa Op.like para búsquedas con comodines
        },
      },
    });
  }

  // Crear un nuevo artículo
  async createAdvertorial(createAdvertorialDto: CreateAdvertorialDto): Promise<Advertorial> {
    // Validar si la categoría existe
    const category = await this.categoryModel.findByPk(createAdvertorialDto.categoryId);
    if (!category) {
      throw new BadRequestException('Invalid categoryId: Category not found');
    }

    // Crear el artículo si la categoría existe
    return this.AdvertorialModel.create(createAdvertorialDto);
  }

  // Actualizar un artículo, incluida la fecha de publicación
  async updateAdvertorial(id: number, UpdateAdvertorialDto: UpdateAdvertorialDto): Promise<Advertorial> {
    const advertorial = await this.AdvertorialModel.findByPk(id);
    if (!advertorial) {
      throw new BadRequestException('El artículo no fue encontrado.');
    }

    // Validar la fecha de publicación
    if (UpdateAdvertorialDto.publishDate) {
      const publishDate = new Date(UpdateAdvertorialDto.publishDate);
      if (isNaN(publishDate.getTime())) {
        throw new BadRequestException('La fecha de publicación no es válida.');
      }
      UpdateAdvertorialDto.publishDate = publishDate;
    }

    return advertorial.update(UpdateAdvertorialDto);
  }

  // Eliminar un artículo
  async deleteAdvertorial(id: number): Promise<number> {
    return this.AdvertorialModel.destroy({ where: { id } });
  }

   // Filtrar enlaces por estado
   async getAdvertorialsByStatus(status: string): Promise<Advertorial[]> {
    return this.AdvertorialModel.findAll({
      where: { status },
    });
  }

  // Programar la publicación de un artículo
  async schedulePublication(id: number, publishDate: Date): Promise<string> {
    const advertorial = await this.AdvertorialModel.findByPk(id);
    if (!advertorial) {
      throw new BadRequestException('El artículo no fue encontrado.');
    }

    // Validar si la fecha de publicación es válida
    const now = new Date();
    if (publishDate <= now) {
      throw new BadRequestException('La fecha de publicación debe ser futura.');
    }

    // Actualizar la fecha de publicación en la base de datos
    advertorial.publishDate = publishDate;
    await advertorial.save();

    // Crear una tarea programada
    const job = new CronJob(publishDate, async () => {
      // Cambiar el estado a 'approved'
      advertorial.status = 'approved';
      await advertorial.save();
      console.log(`Artículo con ID ${id} publicado automáticamente.`);
    });

    // Registrar la tarea en SchedulerRegistry
    this.schedulerRegistry.addCronJob(`publish-advertorial-${id}`, job);
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

  // Filtrar los publireportajes por categoría
  async getAdvertorialsByCategory(categoryId: number): Promise<Advertorial[]> {
    // Verificar si la categoría existe
    const category = await this.categoryModel.findByPk(categoryId);
    if (!category) {
      throw new BadRequestException(`Category with ID ${categoryId} not found`);
    }

    // Buscar los publireportajes relacionados con la categoría
    return this.AdvertorialModel.findAll({
      where: { categoryId },
      include: [Category],
    });
  }

  /************************************************************************************/
  /** APROBAR O RECHAZAR publireportajes **/
  // Actualizar el estado de un publireportajes
  async updateAdvertorialStatus(id: number, status: 'approved' | 'rejected'): Promise<Advertorial> {
    // Verificar si el publireportajes existe
    const advertorial = await this.AdvertorialModel.findByPk(id);
    if (!advertorial) {
      throw new BadRequestException(`advertorial with ID ${id} not found`);
    }

    // Actualizar el estado
    advertorial.status = status;
    await advertorial.save();

    return advertorial;
  }

  /************************************************************************************/
  // Obtener un publireportajes por su ID
  async getAdvertorialById(id: number): Promise<Advertorial> {
    const link = await this.AdvertorialModel.findByPk(id, { include: [Category] });
    if (!link) {
      throw new BadRequestException(`Advertorial with ID ${id} not found`);
    }
    return link;
  }
}