<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CustomException extends Exception
{
    protected array $details;

    protected int $statusCode;

    public function __construct(
        string $message = 'Custom exception occurred',
        array $details = [],
        int $statusCode = 500,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $statusCode, $previous);
        $this->details    = $details;
        $this->statusCode = $statusCode;
    }

    public function getDetails(): array
    {
        return $this->details;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function report(): void
    {
        Log::channel('exceptions')->error($this->message, [
            'details' => $this->details,
            'code'    => $this->code,
            'file'    => $this->file,
            'line'    => $this->line,
            'trace'   => $this->getTraceAsString(),
        ]);
    }

    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->message,
            'errors'  => $this->details,
        ], $this->statusCode);
    }
}
