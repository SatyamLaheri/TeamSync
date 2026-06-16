import { HTTP_CONFIG, HttpStatusCodeType } from "../config/http.config";
import { ErrorCodeEnum, ErrorCodeEnumType } from "../enums/error-code.enum";

export class AppError extends Error {
  public statusCode: HttpStatusCodeType;
  public errorCode?: ErrorCodeEnumType;

  constructor(
    message: string,
    statusCode = HTTP_CONFIG.INTERNAL_SERVER_ERROR,
    errorCode?: ErrorCodeEnumType
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    (Error as any).captureStackTrace(this, this.constructor);
  }
}

export class HttpException extends AppError {
  constructor(
    message = "Http Exception Error",
    statusCode: HttpStatusCodeType,
    errorCode?: ErrorCodeEnumType
  ) {
    super(message, statusCode, errorCode);
  }
}

export class InternalServerException extends AppError {
  constructor(
    message = "Internal Server Error",
    errorCode?: ErrorCodeEnumType
  ) {
    super(
      message,
      HTTP_CONFIG.INTERNAL_SERVER_ERROR,
      errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR
    );
  }
}
export class NotFoundException extends AppError {
    constructor(message = "Resource not found", errorCode?: ErrorCodeEnumType) {
      super(
        message,
        HTTP_CONFIG.NOT_FOUND,
        errorCode || ErrorCodeEnum.RESOURCE_NOT_FOUND
      );
    }
  }
  
  export class BadRequestException extends AppError {
    constructor(message = "Bad Request", errorCode?: ErrorCodeEnumType) {
      super(
        message,
        HTTP_CONFIG.BAD_REQUEST,
        errorCode || ErrorCodeEnum.VALIDATION_ERROR
      );
    }
  }
  
  export class UnauthorizedException extends AppError {
    constructor(message = "Unauthorized Access", errorCode?: ErrorCodeEnumType) {
      super(
        message,
        HTTP_CONFIG.UNAUTHORIZED,
        errorCode || ErrorCodeEnum.ACCESS_UNAUTHORIZED
      );
    }
  }