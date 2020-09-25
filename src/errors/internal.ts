import { ApplicationError } from "./index";

export class InternalError extends ApplicationError {
  constructor(message: string = "Internal server error") {
    super(message, 500);
  }
}
