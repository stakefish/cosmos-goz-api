import { ValidationError } from "class-validator";
import { ApplicationError } from ".";

export class ValidationFailedError extends ApplicationError {
  public constructor(errors: ValidationError[]) {
    const details = errors.map((value) => {
      return {
        property: value.property,
        constraints: value.constraints,
      };
    });

    super("Validation failed", 400, details);
  }
}
