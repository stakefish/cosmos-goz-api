import { ApplicationError } from ".";

export class BadRequestError extends ApplicationError {
  constructor(message: string = "Bad request", details?: object[]) {
    super(message, 400, details);
  }
}
