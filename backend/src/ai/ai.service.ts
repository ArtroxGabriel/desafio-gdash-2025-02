import { AiConfig, AiConfigName } from '@config/ai.config';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Effect } from 'effect';
import { AiError } from './ai.error';
import {
  AiCompletionResult,
  ChatCompletionResponse,
  ChatMessage,
} from './ai.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly config: AiConfig;

  constructor(configService: ConfigService) {
    this.config = configService.get<AiConfig>(AiConfigName)!;
  }

  complete(
    messages: ChatMessage[],
  ): Effect.Effect<AiCompletionResult, AiError> {
    return Effect.gen(this, function* () {
      this.logger.debug(
        `Sending completion request to ${this.config.baseUrl} with model ${this.config.model}`,
      );

      const response = yield* Effect.tryPromise({
        try: () =>
          fetch(`${this.config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify({
              model: this.config.model,
              messages,
              max_tokens: this.config.maxTokens,
            }),
            signal: AbortSignal.timeout(30_000),
          }),
        catch: (error) => {
          const message =
            error instanceof Error ? error.message : String(error);

          if (message.includes('timeout') || message.includes('abort')) {
            return new AiError({ code: 'TIMEOUT', message });
          }

          return new AiError({ code: 'API_ERROR', message });
        },
      });

      if (response.status === 429) {
        this.logger.warn('AI provider rate limit hit');
        return yield* new AiError({
          code: 'RATE_LIMITED',
          message: 'AI provider rate limit exceeded',
        });
      }

      if (!response.ok) {
        const errorBody = yield* Effect.tryPromise({
          try: () => response.text(),
          catch: () =>
            new AiError({
              code: 'API_ERROR',
              message: `HTTP ${response.status}`,
            }),
        });

        this.logger.error(`AI API error (${response.status}): ${errorBody}`);
        return yield* new AiError({
          code: 'API_ERROR',
          message: `AI API returned ${response.status}: ${errorBody}`,
        });
      }

      const data = yield* Effect.tryPromise({
        try: () => response.json() as Promise<ChatCompletionResponse>,
        catch: (error) =>
          new AiError({
            code: 'INVALID_RESPONSE',
            message: `Failed to parse AI response: ${String(error)}`,
          }),
      });

      const choice = data.choices?.[0];
      if (!choice?.message?.content) {
        this.logger.error('AI response missing content');
        return yield* new AiError({
          code: 'INVALID_RESPONSE',
          message: 'AI response did not contain any content',
        });
      }

      this.logger.log(
        `AI completion successful (model: ${data.model}, tokens: ${data.usage?.total_tokens ?? 'unknown'})`,
      );

      return {
        content: choice.message.content,
        model: data.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens ?? 0,
          completionTokens: data.usage?.completion_tokens ?? 0,
        },
      };
    });
  }
}
