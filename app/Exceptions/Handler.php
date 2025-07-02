<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            $this->logException($e);
        });
    }

    /**
     * Custom exception logging
     */
    protected function logException(Throwable $e): void
    {
        $context = [
            'exception' => get_class($e),
            'message'   => $e->getMessage(),
            'code'      => $e->getCode(),
            'file'      => $e->getFile(),
            'line'      => $e->getLine(),
            'trace'     => $e->getTraceAsString(),
        ];

        if ($e instanceof CustomException) {
            $context['details'] = $e->getDetails();
            Log::channel('exceptions')->warning('Custom Exception', $context);
        } else {
            Log::channel('exceptions')->error(
                'Unhandled '.class_basename($e),
                $context
            );
        }
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $exception)
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->handleApiException($request, $exception)
                ->header('Content-Type', 'application/json');
        }

        return parent::render($request, $exception);
    }

    /**
     * Handle API exceptions with consistent JSON response format
     */
    protected function handleApiException($request, Throwable $exception): JsonResponse
    {
        $exception = $this->prepareException($exception);

        return match (true) {
            $exception instanceof CustomException               => $this->customExceptionResponse($exception),
            $exception instanceof AuthenticationException       => $this->unauthenticatedResponse($exception),
            $exception instanceof ValidationException           => $this->validationResponse($exception),
            $exception instanceof ModelNotFoundException        => $this->modelNotFoundResponse($exception),
            $exception instanceof NotFoundHttpException         => $this->notFoundResponse($exception),
            $exception instanceof MethodNotAllowedHttpException => $this->methodNotAllowedResponse($exception),
            $exception instanceof ThrottleRequestsException     => $this->throttleResponse($exception),
            $exception instanceof AuthorizationException        => $this->forbiddenResponse($exception),
            default                                             => $this->genericExceptionResponse($exception),
        };
    }

    /**
     * Custom Exception Response
     */
    protected function customExceptionResponse(CustomException $exception): JsonResponse
    {
        return response()->json([
            'success'  => false,
            'message'  => $exception->getMessage(),
            'error_id' => uniqid(),
            'errors'   => $exception->getDetails(),
        ], $exception->getStatusCode());
    }

    /**
     * Unauthenticated Response (401)
     */
    protected function unauthenticatedResponse(AuthenticationException $exception): JsonResponse
    {
        return response()->json([
            'success'  => false,
            'message'  => $exception->getMessage() ?: 'Unauthenticated.',
            'error_id' => uniqid(),
            'errors'   => [],
        ], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * Validation Error Response (422)
     */
    protected function validationResponse(ValidationException $exception): JsonResponse
    {
        $response = [
            'success'  => false,
            'message'  => 'Validation failed',
            'error_id' => uniqid(),
            'errors'   => $exception->errors(),
        ];

        if (config('app.debug')) {
            $response['failed_rules'] = collect($exception->validator->failed())
                ->map(function ($rules) {
                    return array_keys($rules);
                });
        }

        return response()->json($response, Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    /**
     * Model Not Found Response (404)
     */
    protected function modelNotFoundResponse(ModelNotFoundException $exception): JsonResponse
    {
        $model = class_basename($exception->getModel());

        return response()->json([
            'success'  => false,
            'message'  => "{$model} not found",
            'error_id' => uniqid(),
            'errors'   => [],
        ], Response::HTTP_NOT_FOUND);
    }

    /**
     * Not Found Response (404)
     */
    protected function notFoundResponse(NotFoundHttpException $exception): JsonResponse
    {
        return response()->json([
            'success'  => false,
            'message'  => 'The requested resource was not found',
            'error_id' => uniqid(),
            'errors'   => [],
        ], Response::HTTP_NOT_FOUND);
    }

    /**
     * Method Not Allowed Response (405)
     */
    protected function methodNotAllowedResponse(MethodNotAllowedHttpException $exception): JsonResponse
    {
        return response()->json([
            'success'  => false,
            'message'  => 'The requested method is not allowed for this resource',
            'error_id' => uniqid(),
            'errors'   => [],
        ], Response::HTTP_METHOD_NOT_ALLOWED);
    }

    /**
     * Throttle Response (429)
     */
    protected function throttleResponse(ThrottleRequestsException $exception): JsonResponse
    {
        return response()->json([
            'success'  => false,
            'message'  => 'Too many requests',
            'error_id' => uniqid(),
            'errors'   => [
                'retry_after' => $exception->getHeaders()['Retry-After'] ?? null,
            ],
        ], Response::HTTP_TOO_MANY_REQUESTS);
    }

    /**
     * Forbidden Response (403)
     */
    protected function forbiddenResponse(AuthorizationException $exception): JsonResponse
    {
        return response()->json([
            'success'  => false,
            'message'  => $exception->getMessage() ?: 'Forbidden',
            'error_id' => uniqid(),
            'errors'   => [],
        ], Response::HTTP_FORBIDDEN);
    }

    /**
     * Generic Exception Response
     */
    protected function genericExceptionResponse(Throwable $exception): JsonResponse
    {
        $statusCode = $this->getExceptionStatusCode($exception);
        $response   = $this->generateBaseResponse($exception);

        if (config('app.debug')) {
            $response = array_merge($response, [
                'message' => $exception->getMessage(),
                'debug'   => $this->getSafeDebugInfo($exception),
            ]);
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Get the HTTP status code for the exception
     */
    protected function getExceptionStatusCode(Throwable $exception): int
    {
        // Handle common Laravel exceptions first
        if ($exception instanceof ValidationException) {
            return Response::HTTP_UNPROCESSABLE_ENTITY;
        }
        if ($exception instanceof AuthenticationException) {
            return Response::HTTP_UNAUTHORIZED;
        }
        if ($exception instanceof AuthorizationException) {
            return Response::HTTP_FORBIDDEN;
        }
        if ($exception instanceof ModelNotFoundException || $exception instanceof NotFoundHttpException) {
            return Response::HTTP_NOT_FOUND;
        }
        if ($exception instanceof MethodNotAllowedHttpException) {
            return Response::HTTP_METHOD_NOT_ALLOWED;
        }
        if ($exception instanceof ThrottleRequestsException) {
            return Response::HTTP_TOO_MANY_REQUESTS;
        }

        // Handle Symfony HTTP exceptions
        if ($exception instanceof HttpExceptionInterface) {
            return $exception->getStatusCode();
        }

        // Fallback to status property if available and accessible
        if (is_object($exception) && property_exists($exception, 'status') && isset($exception->status)) {
            $status = $exception->status;
            if (is_int($status)) {
                return $status;
            }
        }

        // Default case
        return Response::HTTP_INTERNAL_SERVER_ERROR;
    }

    /**
     * Generate base response structure
     */
    protected function generateBaseResponse(Throwable $exception): array
    {
        return [
            'success'  => false,
            'message'  => 'Server Error',
            'error_id' => uniqid(),
            'errors'   => [],
        ];
    }

    /**
     * Get safe debug information
     */
    protected function getSafeDebugInfo(Throwable $exception): array
    {
        return [
            'exception' => get_class($exception),
            'file'      => $exception->getFile(),
            'line'      => $exception->getLine(),
            'trace'     => array_map(function ($trace) {
                return [
                    'file'     => $trace['file']     ?? null,
                    'line'     => $trace['line']     ?? null,
                    'function' => $trace['function'] ?? null,
                    'class'    => $trace['class']    ?? null,
                ];
            }, $exception->getTrace()),
        ];
    }
}
