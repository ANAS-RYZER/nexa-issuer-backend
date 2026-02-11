import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      // Check if email already exists
      const existingUser = await this.userModel.findOne({
        email: createUserDto.email.toLowerCase(),
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const user = await this.userModel.create(createUserDto);
      
      this.logger.log(`User created successfully: ${user._id}`);
      
      return user;
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find user by phone number
   */
  async findByPhoneNumber(phoneNumber: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ phoneNumber });
  }

  /**
   * Update user
   */
  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    // If email is being updated, check if it's already taken
    if (updateUserDto.email) {
      const existingUser = await this.userModel.findOne({
        email: updateUserDto.email.toLowerCase(),
        _id: { $ne: userId },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateUserDto },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    this.logger.log(`User updated successfully: ${userId}`);

    return updatedUser;
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<UserDocument> {
    return await this.update(userId, { isEmailVerified: true });
  }

  /**
   * Verify user phone
   */
  async verifyPhone(userId: string): Promise<UserDocument> {
    return await this.update(userId, { isPhoneVerified: true });
  }

  /**
   * Verify user KYC
   */
  async verifyKyc(userId: string): Promise<UserDocument> {
    return await this.update(userId, { isKycVerified: true });
  }

  /**
   * Get all users with filters
   */
  async findAll(filters: {
    isKycVerified?: boolean;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<{ data: UserDocument[]; total: number }> {
    const query: any = {};

    if (filters.isKycVerified !== undefined) {
      query.isKycVerified = filters.isKycVerified;
    }

    if (filters.isEmailVerified !== undefined) {
      query.isEmailVerified = filters.isEmailVerified;
    }

    if (filters.isPhoneVerified !== undefined) {
      query.isPhoneVerified = filters.isPhoneVerified;
    }

    const limit = filters.limit || 20;
    const skip = filters.skip || 0;

    const [data, total] = await Promise.all([
      this.userModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      this.userModel.countDocuments(query),
    ]);

    return {
      data,
      total,
    };
  }

  /**
   * Delete user
   */
  async delete(userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const result = await this.userModel.findByIdAndDelete(userId);

    if (!result) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    this.logger.log(`User deleted successfully: ${userId}`);
  }
}

