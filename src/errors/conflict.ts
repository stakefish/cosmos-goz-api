import { ApplicationError } from "./index";

export class ConflictError extends ApplicationError {
  constructor(message: string = "Conflict") {
    super(message, 409);
  }
}
