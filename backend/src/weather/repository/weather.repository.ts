import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateWeatherDTO } from '../dto/create-weather-snapshot.dto';
import {
  WeatherSnapshot,
  WeatherSnapshotDocument,
} from '../schemas/weather.schema';

@Injectable()
export class WeatherRepository {
  constructor(
    @InjectModel(WeatherSnapshot.name)
    private readonly weatherModel: Model<WeatherSnapshot>,
  ) {}

  async create(
    createWeatherDto: CreateWeatherDTO,
  ): Promise<WeatherSnapshotDocument> {
    const createdWeather = new this.weatherModel(createWeatherDto.current);
    return createdWeather.save();
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: WeatherSnapshotDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.weatherModel.find().skip(skip).limit(limit).exec(),
      this.weatherModel.countDocuments().exec(),
    ]);

    return { data, total };
  }

  async findOne(id: Types.ObjectId): Promise<WeatherSnapshotDocument | null> {
    return this.weatherModel.findOne({ _id: id }).exec();
  }

  async remove(id: Types.ObjectId): Promise<WeatherSnapshotDocument | null> {
    return this.weatherModel.findByIdAndDelete({ _id: id }).exec();
  }
}
