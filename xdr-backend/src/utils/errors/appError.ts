export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public originalError?: Error | { issues: any[]; input: any } | unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.statusCode,
        message: this.message,
        ...(process.env.NODE_ENV === "development" && {
          stack: this.stack,
          original: this.originalError,
        }),
      },
    };
  }
}
