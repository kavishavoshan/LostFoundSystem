import { Controller, Get, Post, Body, Param, ParseIntPipe, Res } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Response } from 'express';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // Add product API
  @Post('addProduct')
  async addProduct(@Body() createProductDto: CreateProductDto, @Res() res: Response) {
    try {
      const product = await this.productService.addProduct(createProductDto);
      return res.status(201).json({ status: 'success', data: product });
    } catch (error) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
  }

  // Get all products
  @Get('getAllProducts')
  async getAllProducts(@Res() res: Response) {
    const products = await this.productService.getAllProducts();
    res.status(200).json({ status: 'success', data: products });
  }

  // Get products by user
  @Get('product/:userId')
  async getProductsByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Res() res: Response
  ) {
    const products = await this.productService.getProductsByUser(userId);
    res.status(200).json({ status: 'success', data: products });
  }
}
