import { AiService } from '@ai/ai.service';
import { ChatMessage } from '@ai/ai.interface';
import { AiError } from '@ai/ai.error';
import { WeatherService } from '@weather/weather.service';
import { WeatherSnapshotResponseDto } from '@weather/dto/weather-response.dto';
import { Injectable, Logger } from '@nestjs/common';
import { Effect } from 'effect';
import { Types } from 'mongoose';
import { InsightResponseDto } from './dto/insight-response.dto';
import { InsightsError } from './insights.error';
import { InsightsRepository } from './insights.repository';

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    private readonly insightsRepository: InsightsRepository,
    private readonly aiService: AiService,
    private readonly weatherService: WeatherService,
  ) {}

  generate(
    weatherSnapshotId: string,
  ): Effect.Effect<InsightResponseDto, InsightsError> {
    return Effect.gen(this, function* () {
      this.logger.debug(
        `Generating insight for snapshot: ${weatherSnapshotId}`,
      );

      const objectId = new Types.ObjectId(weatherSnapshotId);

      const snapshot = yield* this.weatherService.findOne(objectId).pipe(
        Effect.mapError(
          (weatherError) =>
            new InsightsError({
              code:
                weatherError.code === 'NOT_FOUND'
                  ? 'WEATHER_NOT_FOUND'
                  : 'DATABASE_ERROR',
              message:
                weatherError.message ?? 'Failed to fetch weather snapshot',
            }),
        ),
      );

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content:
            'You are a meteorological analyst. Given weather data, provide a brief, insightful analysis in 2-3 paragraphs. Include: current conditions summary, notable patterns, and practical recommendations for the day.',
        },
        {
          role: 'user',
          content: this.buildWeatherPrompt(snapshot),
        },
      ];

      const aiResult = yield* this.aiService.complete(messages).pipe(
        Effect.mapError(
          (aiError: AiError) =>
            new InsightsError({
              code: 'AI_GENERATION_FAILED',
              message: aiError.message ?? 'AI generation failed',
            }),
        ),
      );

      const insight = yield* this.insightsRepository
        .create({
          content: aiResult.content,
          weatherSnapshotId: objectId,
          model: aiResult.model,
          promptTokens: aiResult.usage.promptTokens,
          completionTokens: aiResult.usage.completionTokens,
        })
        .pipe(
          Effect.tapError((err) => {
            this.logger.error(`Failed to store insight: ${err.message}`);
            return new InsightsError({ code: 'DATABASE_ERROR' });
          }),
        );

      this.logger.log(
        `Insight generated and stored (id: ${insight._id.toString()})`,
      );

      return new InsightResponseDto(insight);
    });
  }

  findAll(
    page: number,
    limit: number,
  ): Effect.Effect<
    { data: InsightResponseDto[]; total: number },
    InsightsError
  > {
    return Effect.gen(this, function* () {
      this.logger.debug(`Fetching insights page: ${page}, limit: ${limit}`);

      const { data, total } = yield* this.insightsRepository
        .findAll(page, limit)
        .pipe(
          Effect.tapError((err) => {
            this.logger.error(`Fetching insights failed: ${err.message}`);
            return new InsightsError({ code: 'DATABASE_ERROR' });
          }),
        );

      const dataDto = data.map((insight) => new InsightResponseDto(insight));

      this.logger.log(`${data.length} insights fetched successfully`);
      return { data: dataDto, total };
    });
  }

  private buildWeatherPrompt(snapshot: WeatherSnapshotResponseDto): string {
    return [
      'Analyze the following weather data and provide insights:',
      '',
      `- Temperature: ${String(snapshot.temperature_2m)}°C`,
      `- Apparent Temperature: ${String(snapshot.apparent_temperature)}°C`,
      `- Humidity: ${String(snapshot.relative_humidity_2m)}%`,
      `- Is Day: ${snapshot.is_day ? 'Yes' : 'No'}`,
      `- Weather Code: ${String(snapshot.weather_code)}`,
      `- Precipitation: ${String(snapshot.precipitation)}mm`,
      `- Wind Speed: ${String(snapshot.wind_speed_10m)} km/h`,
      `- Wind Direction: ${String(snapshot.wind_direction_10m)}°`,
      `- Wind Gusts: ${String(snapshot.wind_gusts_10m)} km/h`,
    ].join('\n');
  }
}
