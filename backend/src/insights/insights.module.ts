import { AiModule } from '@ai/ai.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherModule } from '@weather/weather.module';
import { InsightsController } from './insights.controller';
import { InsightsRepository } from './insights.repository';
import { InsightsService } from './insights.service';
import { Insight, InsightSchema } from './schemas/insight.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Insight.name, schema: InsightSchema }]),
    AiModule,
    WeatherModule,
  ],
  controllers: [InsightsController],
  providers: [InsightsService, InsightsRepository],
})
export class InsightsModule {}
