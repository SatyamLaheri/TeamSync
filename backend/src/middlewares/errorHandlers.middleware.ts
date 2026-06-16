import { ErrorRequestHandler, Response } from "express";
import { HTTP_CONFIG } from "../config/http.config";
import { AppError } from "../utils/appError";
import { ZodError } from "zod";

const formatZodError = (res: Response, err: ZodError) => {
    const errors = err.errors.map((error) => {
        return {
            path: error.path,
            message: error.message,
        }
    })
    return res.status(HTTP_CONFIG.BAD_REQUEST).json({
        message: "Validation error",
        errors,
    })
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    // Log the error for debugging
    console.error('[ERROR]', new Date().toISOString(), err);
    console.error('[ERROR] Stack:', err.stack);

    // Handle different types of errors
    if(err instanceof SyntaxError) {
        return res.status(HTTP_CONFIG.BAD_REQUEST).json({
            message: "Invalid JSON payload"
        })
    }
    
    if(err instanceof ZodError) {
        return formatZodError(res, err);
    }
    
    if(err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            errorCode: err.errorCode
        })
    }

    // Handle MongoDB errors
    if (err.name === 'CastError') {
        return res.status(HTTP_CONFIG.BAD_REQUEST).json({
            message: "Invalid ID format",
            errorCode: 'INVALID_ID'
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(HTTP_CONFIG.BAD_REQUEST).json({
            message: "Validation failed",
            errorCode: 'VALIDATION_ERROR'
        });
    }

    if (err.code === 11000) {
        return res.status(HTTP_CONFIG.CONFLICT).json({
            message: "Duplicate key error",
            errorCode: 'DUPLICATE_KEY'
        });
    }

    // Default error response
    return res.status(HTTP_CONFIG.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
        errorCode: 'INTERNAL_ERROR'
    });
}