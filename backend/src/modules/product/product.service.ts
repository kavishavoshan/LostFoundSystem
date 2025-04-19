import { Injectable, NotFoundException } from '@nestjs/common';
<<<<<<< HEAD
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { User } from '../user/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
=======
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad

@Injectable()
export class ProductService {
  constructor(
<<<<<<< HEAD
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Add a new product
  async addProduct(dto: CreateProductDto): Promise<Product> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const product = this.productRepository.create({
      ...dto,
      user,
    });

    return await this.productRepository.save(product);
  }

  // Get all products
  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.find({ relations: ['user'] });
  }

  // Get products by user
  async getProductsByUser(userId: number): Promise<Product[]> {
    return await this.productRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
=======
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto, userId: string): Promise<ProductDocument> {
    const createdProduct = new this.productModel({
      ...createProductDto,
      userId,
    });
    return createdProduct.save();
  }

  async findAll(): Promise<ProductDocument[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<ProductDocument | null> {
    const product = await this.productModel.findOne({ _id: id, userId }).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const updatedProduct = await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }
    return updatedProduct;
  }

  async remove(id: string, userId: string): Promise<ProductDocument> {
    const product = await this.productModel.findOne({ _id: id, userId }).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
    if (!deletedProduct) {
      throw new NotFoundException('Product not found');
    }
    return deletedProduct;
  }

  async getProductsByUser(userId: string): Promise<ProductDocument[]> {
    return this.productModel.find({ userId }).populate('userId').exec();
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
  }
}
