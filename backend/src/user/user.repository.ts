import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  readonly USER_CRITICAL_DETAIL = '+email +password +roles';

  async create(user: Omit<User, '_id' | 'status'>): Promise<User> {
    const created = await this.userModel.create(user);
    return { ...created.toObject(), roles: user.roles };
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: User[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userModel
        .find({ status: true })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return { data, total };
  }

  async findById(id: Types.ObjectId): Promise<User | null> {
    return this.userModel
      .findOne({ _id: id, status: true })
      .select(this.USER_CRITICAL_DETAIL)
      .populate({
        path: 'roles',
        match: { status: true },
      })
      .lean()
      .exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel
      .findOne({ email, status: true })
      .select(this.USER_CRITICAL_DETAIL)
      .populate({
        path: 'roles',
        match: { status: true },
      })
      .lean()
      .exec();
  }

  async findPrivateProfile(user: User): Promise<User | null> {
    return this.userModel
      .findOne({ _id: user._id, status: true })
      .select('+email')
      .populate({
        path: 'roles',
        match: { status: true },
        select: { code: 1 },
      })
      .lean()
      .exec();
  }

  async updateInfo(user: Partial<User>): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate({ _id: user._id, status: true }, { $set: user })
      .select('+email')
      .populate({
        path: 'roles',
        match: { status: true },
        select: { code: 1 },
      })
      .lean()
      .exec();
  }

  async delete(user: User) {
    return this.userModel.findByIdAndDelete(user._id).lean().exec();
  }

  async deactivate(id: Types.ObjectId) {
    return this.userModel
      .findByIdAndUpdate({ _id: id }, { status: false })
      .lean()
      .exec();
  }
}
