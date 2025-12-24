import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateWeatherDTO } from '../dto/create-weather-snapshot.dto';
import { WeatherSnapshot } from '../schemas/weather.schema';

@Injectable()
export class WeatherRepository {
  constructor(
    @InjectModel(WeatherSnapshot.name)
    private readonly weatherModel: Model<WeatherSnapshot>,
  ) {}

  async create(createWeatherDto: CreateWeatherDTO): Promise<WeatherSnapshot> {
    const createdWeather = new this.weatherModel(createWeatherDto.current);
    return createdWeather.save();
  }

  async findAll(): Promise<WeatherSnapshot[]> {
    return this.weatherModel.find().exec();
  }

  async findOne(id: Types.ObjectId): Promise<WeatherSnapshot | null> {
    return this.weatherModel.findOne({ _id: id }).exec();
  }

  async remove(id: Types.ObjectId) {
    return this.weatherModel.findByIdAndDelete({ _id: id }).exec();
  }
}
