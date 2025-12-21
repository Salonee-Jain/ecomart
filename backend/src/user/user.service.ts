import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { UpdateUserRoleDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async getAllUsers() {
    const users = await this.userModel.find().select('-password').exec();
    return {
      total: users.length,
      users: users,
    };
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id).select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserRole(userId: string, currentUserId: string, updateUserRoleDto: UpdateUserRoleDto) {
    const { isAdmin } = updateUserRoleDto;

    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Prevent self-demotion
      if (user._id.toString() === currentUserId) {
        throw new BadRequestException('Cannot modify your own admin status');
      }

      user.isAdmin = isAdmin;
      await user.save();

      return {
        success: true,
        message: `User ${isAdmin ? 'promoted to' : 'removed from'} admin`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      };
    } catch (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  }

  async deleteUser(userId: string, currentUserId: string) {
    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Prevent self-deletion
      if (user._id.toString() === currentUserId) {
        throw new BadRequestException('Cannot delete your own account');
      }

      await user.deleteOne();

      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}
