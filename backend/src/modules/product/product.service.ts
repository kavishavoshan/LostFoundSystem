import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { User } from '../user/user.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(
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
  }
}
