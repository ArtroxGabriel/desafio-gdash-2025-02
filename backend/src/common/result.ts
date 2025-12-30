type EitherSuccess<Data> = {
  isFail: false;
  value: Data;
};

type EitherFail<Err> = {
  isFail: true;
  error: Err;
  message?: string;
};

export type Either<Data, Err> = EitherSuccess<Data> | EitherFail<Err>;

export const fail = <Err>(
  error: Err,
  errorMessage = '',
): Either<never, Err> => ({
  isFail: true,
  error,
  message: errorMessage,
});

export const success = <Data>(value: Data): Either<Data, never> => ({
  isFail: false,
  value,
});

export function isFail<Data, Err>(
  either: Either<Data, Err>,
): either is EitherFail<Err> {
  return either.isFail;
}

export function isSuccess<Data, Err>(
  either: Either<Data, Err>,
): either is EitherSuccess<Data> {
  return !either.isFail;
}

export type Result<DATA, ERROR> = Promise<Either<DATA, ERROR>>;
