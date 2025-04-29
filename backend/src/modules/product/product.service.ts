import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
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
  }
}
