import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto/product.dto';
import { CreateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get()
  @ApiOperation({ summary: 'Get all products with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getProducts(@Query() queryDto: QueryProductDto) {
    return this.productService.getProducts(queryDto);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get product analytics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getProductAnalytics() {
    return this.productService.getProductAnalytics();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getCategories() {
    return this.productService.getAllCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bulk create products (Admin only)' })
  @ApiResponse({ status: 201, description: 'Products created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create product review' })
  @ApiResponse({ status: 201, description: 'Review added successfully' })
  @ApiResponse({ status: 400, description: 'Product already reviewed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async createReview(@Request() req, @Param('id') id: string, @Body() createReviewDto: CreateReviewDto) {
    return this.productService.createReview(id, req.user._id, req.user.name, createReviewDto);
  }

  @Put(':id/reviews/:reviewIndex')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update own review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 400, description: 'Review not found or unauthorized' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateReview(
    @Request() req,
    @Param('id') id: string,
    @Param('reviewIndex') reviewIndex: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.productService.updateReview(id, parseInt(reviewIndex), req.user._id, createReviewDto);
  }

  @Delete(':id/reviews/:reviewIndex')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete review (own review or Admin)' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 400, description: 'Unauthorized to delete this review' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async deleteReview(
    @Request() req,
    @Param('id') id: string,
    @Param('reviewIndex') reviewIndex: string,
  ) {
    return this.productService.deleteReview(id, parseInt(reviewIndex), req.user._id, req.user.isAdmin);
  }


}