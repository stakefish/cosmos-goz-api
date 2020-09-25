import { Middleware, Res } from "@tsed/common";

@Middleware()
export class NotFoundMiddelware {
  public use(@Res() res: Res) {
    res.status(404).json({
      message: "Nothing here...",
    });
  }
}
