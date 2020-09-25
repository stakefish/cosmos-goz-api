import { ApplicationError } from "./index";

export class ForbiddenError extends ApplicationError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}
