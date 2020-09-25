import {
  Err,
  GlobalErrorHandlerMiddleware,
  OverrideProvider,
  Req,
  Res,
} from "@tsed/common";
import { Exception } from "ts-httpexceptions";

import { ApplicationError } from "../errors";

import { Logger } from "ts-log-debug";
const log = new Logger("error");
log.appenders.set("std-log", { type: "stdout" });

@OverrideProvider(GlobalErrorHandlerMiddleware)
export class ErrorHandlerMiddleware extends GlobalErrorHandlerMiddleware {
  public use(@Err() error: any, @Req() _: Req, @Res() response: Res): any {
    log.error("Encountered an error", error);

    if (error instanceof ApplicationError) {
      const applicationError = error;
      return response.status(applicationError.code).json(error);
    }

    if (error instanceof Exception) {
      const exception = error;
      return response.status(exception.status).json(exception);
    }

    if (typeof error === "string") {
      return response.status(500).json({
        message: error,
      });
    }

    return response.status(error.status || 500).json(error);
  }
}
