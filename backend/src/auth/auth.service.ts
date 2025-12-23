import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import Stripe from 'stripe';

@Injectable()
export class AuthService {
  private stripe: Stripe;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'));
  }

  async register(registerDto: RegisterDto) {
    const { name, email, password, isAdmin } = registerDto;

    // Check if user exists
    const userExists = await this.userModel.findOne({ email });
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    // Create user
    const user = await this.userModel.create({
      name,
      email,
      password,
      isAdmin: isAdmin ?? false,
    });

    // Create Stripe customer
    const customer = await this.stripe.customers.create({
      email,
      name,
    });

    user.stripeCustomerId = customer.id;
    await user.save();

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: this.generateToken(user),
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: this.generateToken(user),
    };
  }

  logout() {
    return { message: 'User logged out successfully' };
  }


  async getProfile(userId: string) {
    let user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    };
  }

  async updateProfile(userId: string, updateData: { name?: string; email?: string; password?: string }) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await this.userModel.findOne({ email: updateData.email });
      if (emailExists) {
        throw new BadRequestException('Email already in use');
      }
      user.email = updateData.email;
    }

    if (updateData.name) {
      user.name = updateData.name;
    }

    if (updateData.password) {
      user.password = updateData.password; // Will be hashed by pre-save hook
    }

    await user.save();

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    };
  }

  private generateToken(user: { _id: any; name: string; email: string; isAdmin: boolean }): string {
    return this.jwtService.sign(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '30d',
      },
    );
  }
}
