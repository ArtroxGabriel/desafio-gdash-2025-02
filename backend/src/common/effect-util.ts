import { Effect, Exit } from 'effect';
import { HttpException, InternalServerErrorException } from '@nestjs/common';

export type ErrorMapper<E> = (error: E) => HttpException;

export const runNest = async <A, E>(
  effect: Effect.Effect<A, E>,
  mapError?: ErrorMapper<E>,
): Promise<A> => {
  const result = await Effect.runPromiseExit(effect);

  if (Exit.isFailure(result)) {
    const cause = result.cause;

    if (cause._tag === 'Fail') {
      if (mapError) {
        throw mapError(cause.error);
      }
      throw new InternalServerErrorException(String(cause.error));
    }

    throw new InternalServerErrorException('Internal server defect');
  }

  return result.value;
};
