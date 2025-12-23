import { Controller, Post, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DatabaseService } from './database.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Database Management')
@ApiBearerAuth('JWT-auth')
@Controller('database')
@UseGuards(JwtAuthGuard, AdminGuard)
export class DatabaseController {
    constructor(private readonly databaseService: DatabaseService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get database statistics (Admin only)' })
    @ApiResponse({ status: 200, description: 'Database stats retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async getDatabaseStats() {
        return this.databaseService.getDatabaseStats();
    }

    @Delete('clear-all')
    @ApiOperation({ summary: 'Clear all data except admin users (Admin only)' })
    @ApiResponse({ status: 200, description: 'All data cleared successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async clearAllData() {
        return this.databaseService.clearAllData();
    }

    @Delete('clear-all-including-admins')
    @ApiOperation({ summary: 'Clear ALL data including admin users (Admin only) - USE WITH CAUTION' })
    @ApiResponse({ status: 200, description: 'All data cleared successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async clearAllDataIncludingAdmins() {
        return this.databaseService.clearAllDataIncludingAdmins();
    }

    @Delete('clear/:collection')
    @ApiOperation({ summary: 'Clear a specific collection (Admin only)' })
    @ApiResponse({ status: 200, description: 'Collection cleared successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 400, description: 'Invalid collection name' })
    async clearCollection(@Param('collection') collection: string) {
        return this.databaseService.clearCollection(collection);
    }

    @Post('reset')
    @ApiOperation({ summary: 'Reset database to initial state (Admin only)' })
    @ApiResponse({ status: 200, description: 'Database reset successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async resetDatabase() {
        return this.databaseService.resetDatabase();
    }

    @Post('seed')
    @ApiOperation({ summary: 'Seed database with sample data (Admin only)' })
    @ApiResponse({ status: 200, description: 'Sample data seeded successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async seedSampleData() {
        return this.databaseService.seedSampleData();
    }

    @Post('refactor')
    @ApiOperation({ summary: 'Refactor database - Clear all data and reseed (Admin only)' })
    @ApiResponse({ status: 200, description: 'Database refactored successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async refactorDatabase() {
        return this.databaseService.refactorDatabase();
    }
}
