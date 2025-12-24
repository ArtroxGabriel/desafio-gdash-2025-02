import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

type ErrorDetail = {
  property: string;
  errors: string[];
};

export const validationFactory = () =>
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
      const getPrettyClassValidatorErrors = (
        validationErrors: ValidationError[],
        parentProperty = '',
      ): ErrorDetail[] => {
        const errors: ErrorDetail[] = [];

        const getValidationErrorsRecursively = (
          validationErrors: ValidationError[],
          parentProperty = '',
        ) => {
          for (const error of validationErrors) {
            const propertyPath = parentProperty
              ? `${parentProperty}.${error.property}`
              : error.property;

            if (error.constraints) {
              errors.push({
                property: propertyPath,
                errors: Object.values(error.constraints),
              });
            }

            if (error.children?.length) {
              getValidationErrorsRecursively(error.children, propertyPath);
            }
          }
        };

        getValidationErrorsRecursively(validationErrors, parentProperty);
        return errors;
      };

      const errors = getPrettyClassValidatorErrors(validationErrors);

      return new BadRequestException({
        message: 'Validation failed',
        errors: errors,
      });
    },
  });
