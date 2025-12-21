import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: any = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                message = (exceptionResponse as any).message || exception.message;
                errors = (exceptionResponse as any).errors || null;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Exception caught:', {
                status,
                message,
                errors,
                path: request.url,
                method: request.method,
                timestamp: new Date().toISOString(),
            });
        }

        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            ...(errors && { errors }),
            path: request.url,
            timestamp: new Date().toISOString(),
            // Only include stack trace in development
            ...(process.env.NODE_ENV === 'development' &&
                exception instanceof Error && { stack: exception.stack }),
        });
    }
}
