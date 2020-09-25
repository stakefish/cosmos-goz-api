import { ApplicationError } from "./index";

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = "Not authorized") {
    super(message, 401);
  }
}
