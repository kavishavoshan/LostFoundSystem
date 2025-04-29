import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productService.create(createProductDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.productService.remove(id, req.user.userId);
  }

  @Get('user/products')
  async getUserProducts(@Request() req) {
    return this.productService.getProductsByUser(req.user.userId);
  }
}
