import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WeatherSnapshot } from './schemas/weather.schema';

@Injectable()
export class WeatherRepository {
  constructor(
    @InjectModel(WeatherSnapshot.name)
    private readonly weatherModel: Model<WeatherSnapshot>,
  ) {}

  async create(
    weatherToCreate: Omit<WeatherSnapshot, '_id'>,
  ): Promise<WeatherSnapshot> {
    const createdWeather = await this.weatherModel.create(weatherToCreate);
    return createdWeather.toObject();
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: WeatherSnapshot[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.weatherModel.find().skip(skip).limit(limit).lean().exec(),
      this.weatherModel.countDocuments().exec(),
    ]);

    return { data, total };
  }

  async findOne(id: Types.ObjectId): Promise<WeatherSnapshot | null> {
    return this.weatherModel.findOne({ _id: id }).lean().exec();
  }

  async remove(id: Types.ObjectId): Promise<WeatherSnapshot | null> {
    return this.weatherModel.findByIdAndDelete({ _id: id }).lean().exec();
  }
}
