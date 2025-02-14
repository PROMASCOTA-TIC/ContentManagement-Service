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
  // Publireportajes
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

    // Asegurar que `imagesUrl` sea un string, incluso si es undefined
    createAdvertorialDto.imagesUrl = createAdvertorialDto.imagesUrl || "";

    // Crear el artículo si la categoría existe
    return this.AdvertorialModel.create(createAdvertorialDto);
  }

  // Actualizar un artículo, incluida la fecha de publicación
  // Actualizar un artículo, incluida la fecha de publicación
  async updateAdvertorial(advertorialId: string, updateAdvertorialDto: UpdateAdvertorialDto): Promise<Advertorial> {
    console.log('Datos recibidos para actualizar:', updateAdvertorialDto);

    // Buscar el enlace por su ID
    const advertorial = await this.AdvertorialModel.findOne({ where: { advertorialId } });
    if (!advertorial) {
      throw new BadRequestException('El artículo no fue encontrado.');
    }

    // Validar y procesar la fecha de publicación
    if (updateAdvertorialDto.publishDate) {
      const publishDate = new Date(updateAdvertorialDto.publishDate);
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
      updateAdvertorialDto.publishDate = publishDate.toISOString();

      // Programar la publicación automática
      const jobName = `publish-advertorial-${advertorialId}`;

      // Si ya existe una tarea programada, eliminarla
      if (this.schedulerRegistry.doesExist('cron', jobName)) {
        this.schedulerRegistry.deleteCronJob(jobName);
        console.log(`Tarea programada "${jobName}" eliminada para evitar duplicados.`);
      }

      // Crear nueva tarea cron
      const job = new CronJob(publishDate, async () => {
        advertorial.status = 'approved'; // Cambiar el estado a "approved"
        await advertorial.save();
        console.log(`El artículo con ID ${advertorialId} ha sido publicado automáticamente.`);

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
    const updatedAdvertorialDto = {
      ...updateAdvertorialDto,
      publishDate: updateAdvertorialDto.publishDate ? new Date(updateAdvertorialDto.publishDate) : undefined,
    };
    const updatedAdvertorial = await advertorial.update(updatedAdvertorialDto);

    console.log(`Artículo con ID ${advertorialId} actualizado correctamente.`);
    return updatedAdvertorial;
  }

  // Eliminar un artículo
  async deleteAdvertorial(advertorialId: string): Promise<number> {
    return this.AdvertorialModel.destroy({ where: { advertorialId } });
  }

  // Filtrar publireportajes por estado
  async getAdvertorialsByStatus(status: string): Promise<Advertorial[]> {
    return this.AdvertorialModel.findAll({
      where: { status },
    });
  }

  // Programar la publicación de un artículo
  async schedulePublication(advertorialId: string, publishDate: Date): Promise<string> {
    const advertorial = await this.AdvertorialModel.findOne({ where: { advertorialId } });
    if (!advertorial) {
      throw new BadRequestException('El publireportaje no fue encontrado.');
    }

    // Validar si la fecha de publicación es válida
    const now = new Date();
    if (publishDate <= now) {
      throw new BadRequestException('La fecha de publicación debe ser futura.');
    }

    // Actualizar la fecha de publicación en la base de datos
    advertorial.publishDate = publishDate;
    await advertorial.save();

    const jobName = `publish-advertorial-${advertorialId}`;

    // Verificar si la tarea ya existe y eliminarla si es necesario
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      console.log(`Eliminando tarea duplicada con el nombre ${jobName}.`);
      this.schedulerRegistry.deleteCronJob(jobName);
    }

    // Crear una nueva tarea programada
    const job = new CronJob(publishDate, async () => {
      // Cambiar el estado a 'approved'
      advertorial.status = 'approved';
      await advertorial.save();
      console.log(`Artículo con advertorialId ${advertorialId} publicado automáticamente.`);
    });

    // Registrar la tarea en SchedulerRegistry
    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();

    return `Publicación programada para el artículo con advertorialId ${advertorialId} en la fecha ${publishDate}`;
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
  async getAdvertorialsByCategory(categoryId: number): Promise<Advertorial[]> {
    // Verificar si la categoría existe
    const category = await this.categoryModel.findByPk(categoryId);
    if (!category) {
      throw new BadRequestException(`Category with ID ${categoryId} not found`);
    }

    // Buscar los enlaces relacionados con la categoría
    return this.AdvertorialModel.findAll({
      where: { categoryId },
      include: [Category],
    });
  }

  /************************************************************************************/
  /** APROBAR O RECHAZAR ENLACES **/

  // Actualizar el estado de un enlace
  async updateAdvertorialStatus(advertorialId: string, status: 'approved' | 'rejected'): Promise<Advertorial> {
    const advertorial = await this.AdvertorialModel.findOne({ where: { advertorialId } });
    if (!advertorial) {
      throw new BadRequestException(`Advertorial with advertorialId ${advertorialId} not found`);
    }

    // Actualizar el estado
    advertorial.status = status;
    await advertorial.save();

    return advertorial;
  }

  /************************************************************************************/
  // Obtener un publireportaje por su ID
  async getAdvertorialById(advertorialId: string) {
    console.log("ID recibido en el microservicio:", advertorialId); // 🛠️ Verificar si llega el ID

    if (!advertorialId || advertorialId === "undefined") {
      throw new BadRequestException('El ID del publireportaje no puede estar vacío');
    }

    const advertorial = await this.AdvertorialModel.findOne({
      where: { advertorialId },
      include: [{ model: Category }]
    });

    if (!advertorial) {
      throw new BadRequestException(`Advertorial con ID ${advertorialId} no encontrado`);
    }
    return advertorial;
  }
}