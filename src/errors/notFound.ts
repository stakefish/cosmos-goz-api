import { ApplicationError } from "./index";

export class NotFoundError extends ApplicationError {
  constructor(message: string = "Not found") {
    super(message, 404);
  }
}
