import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Wishlist')
@ApiBearerAuth('JWT-auth')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) { }

    @Get()
    @ApiOperation({ summary: 'Get user wishlist' })
    @ApiResponse({ status: 200, description: 'Wishlist retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getWishlist(@Request() req) {
        return this.wishlistService.getWishlist(req.user._id);
    }

    @Post(':productId')
    @ApiOperation({ summary: 'Add product to wishlist' })
    @ApiResponse({ status: 200, description: 'Product added to wishlist successfully' })
    @ApiResponse({ status: 400, description: 'Product already in wishlist' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async addToWishlist(@Request() req, @Param('productId') productId: string) {
        return this.wishlistService.addToWishlist(req.user._id, productId);
    }

    @Delete(':productId')
    @ApiOperation({ summary: 'Remove product from wishlist' })
    @ApiResponse({ status: 200, description: 'Product removed from wishlist successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Wishlist or product not found' })
    async removeFromWishlist(@Request() req, @Param('productId') productId: string) {
        return this.wishlistService.removeFromWishlist(req.user._id, productId);
    }

    @Delete()
    @ApiOperation({ summary: 'Clear entire wishlist' })
    @ApiResponse({ status: 200, description: 'Wishlist cleared successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Wishlist not found' })
    async clearWishlist(@Request() req) {
        return this.wishlistService.clearWishlist(req.user._id);
    }
}
