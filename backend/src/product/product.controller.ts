import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts(@Query() queryDto: QueryProductDto) {
    return this.productService.getProducts(queryDto);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getProductAnalytics() {
    return this.productService.getProductAnalytics();
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async bulkCreateProducts(@Body() products: CreateProductDto[]) {
    return this.productService.bulkCreateProducts(products);
  }

  @Post('bulk-delete')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async bulkDeleteProducts(@Body() body: any[]) {
    const ids = body.filter((item) => item._id).map((item) => item._id);
    return this.productService.bulkDeleteProducts(ids);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
