import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, MergeCartDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getMyCart(@Request() req) {
    return this.cartService.getMyCart(req.user._id);
  }

  @Post()
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user._id, addToCartDto);
  }

  @Put(':productId')
  async updateCartItem(
    @Request() req,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user._id, productId, updateCartItemDto);
  }

  @Delete(':productId')
  async removeFromCart(@Request() req, @Param('productId') productId: string) {
    return this.cartService.removeFromCart(req.user._id, productId);
  }

  @Delete()
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user._id);
  }

  @Post('merge')
  async mergeCart(@Request() req, @Body() mergeCartDto: MergeCartDto) {
    return this.cartService.mergeCart(req.user._id, mergeCartDto);
  }
}
