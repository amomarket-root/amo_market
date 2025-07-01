<?php

namespace App\Http\Controllers\Weather;

use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/portal/weather",
     *     summary="Get weather data by latitude and longitude",
     *     description="Returns current weather data for the given geographic coordinates using OpenWeatherMap API.",
     *     tags={"Weather"},
     *     @OA\Parameter(
     *         name="latitude",
     *         in="query",
     *         description="Latitude coordinate",
     *         required=true,
     *         @OA\Schema(type="number", format="float")
     *     ),
     *     @OA\Parameter(
     *         name="longitude",
     *         in="query",
     *         description="Longitude coordinate",
     *         required=true,
     *         @OA\Schema(type="number", format="float")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Weather data found successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Weather Data Found Successfully."),
     *             @OA\Property(property="data", type="object", description="Weather data object returned from OpenWeatherMap API")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="validation error"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Weather data not found for provided coordinates",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Weather Data Not Found For Provided Coordinates")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Internal server error message")
     *         )
     *     )
     * )
     */
    public function weather(Request $request)
    {
        try {
            $validateUser = Validator::make($request->all(), [
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
            ]);

            if ($validateUser->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'validation error',
                    'errors' => $validateUser->errors()
                ], 401);
            }
            $apiKey = config('services.openweathermap.api_key');
            $latitude = $request->latitude;
            $longitude = $request->longitude;
            $response = Http::get("https://api.openweathermap.org/data/2.5/weather?lat=$latitude&lon=$longitude&appid=$apiKey");
            $weatherdata = $response->json();

            if (!$weatherdata) {
                return response()->json([
                    'status' => false,
                    'message' => 'Weather Data Not Found For Provided Coordinates',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Weather Data Found Sucessfully.',
                'data' => $weatherdata
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }
}
