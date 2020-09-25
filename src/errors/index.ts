export class ApplicationError extends Error {
  public type: string;
  public code: number;
  public details: object[] = [];

  constructor(message: string, code: number, details?: object[]) {
    super(message);

    this.type = this.constructor.name;
    this.code = code;

    if (details) {
      this.details = details;
    }
  }

  public toJSON(): object {
    return {
      error: {
        type: this.type,
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

export * from "./badRequest";
export * from "./conflict";
export * from "./forbidden";
export * from "./internal";
export * from "./notFound";
export * from "./unauthorized";
export * from "./validationFailed";
