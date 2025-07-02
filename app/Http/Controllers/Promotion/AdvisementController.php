<?php

namespace App\Http\Controllers\Promotion;

use App\Http\Controllers\Controller;
use App\Services\AdvisementService;
use Illuminate\Http\Request;

class AdvisementController extends Controller
{
    protected $advisementService;

    public function __construct(AdvisementService $advisementService)
    {
        $this->advisementService = $advisementService;
    }

    /**
     * @OA\Get(
     *     path="/api/portal/advisements",
     *     operationId="getNearbyShopAdvisements",
     *     tags={"Promotion"},
     *     summary="Get advisements for shops within a 2 km radius",
     *     description="Returns advisements of shops near the provided latitude and longitude",
     *
     *     @OA\Parameter(
     *         name="latitude",
     *         in="query",
     *         description="User's current latitude",
     *         required=true,
     *
     *         @OA\Schema(type="number", format="float", example=21.5143459)
     *     ),
     *
     *     @OA\Parameter(
     *         name="longitude",
     *         in="query",
     *         description="User's current longitude",
     *         required=true,
     *
     *         @OA\Schema(type="number", format="float", example=86.8929264)
     *     ),
     *
     *     @OA\Parameter(
     *         name="radius",
     *         in="query",
     *         description="Radius in kilometers to search for nearby shops",
     *         required=false,
     *
     *         @OA\Schema(type="integer", example=2)
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Advisements retrieved successfully",
     *
     *         @OA\JsonContent(
     *             type="object",
     *
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Advisement Retrieved Successfully."),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *
     *                 @OA\Items(
     *                     type="object",
     *
     *                     @OA\Property(property="id", type="string", format="uuid", example="d1878e90-79fc-11ec-90d6-0242ac120003"),
     *                     @OA\Property(property="shop_id", type="string", format="uuid", example="293b896d-8e92-49bb-a61e-83fa112b64d1"),
     *                     @OA\Property(property="content_image", type="string", format="uri", example="http://localhost:8000/storage/advisements/ad1.webp"),
     *                     @OA\Property(property="shop_type", type="string", example="service")
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=400,
     *         description="Missing location data",
     *
     *         @OA\JsonContent(
     *             type="object",
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Current location not provided.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=404,
     *         description="No advisements found nearby",
     *
     *         @OA\JsonContent(
     *             type="object",
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="No advisement found for shops within 2 km.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Something went wrong.")
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $latitude  = $request->input('latitude');
        $longitude = $request->input('longitude');

        // If latitude and longitude are not provided, return all categories
        if (! $latitude || ! $longitude) {
            return response()->json([
                'status'  => false,
                'message' => 'Current location not provided.',
            ], 400);
        }

        // Get categories based on shops within a specific radius (e.g., 2 km)
        $advisement = $this->advisementService->getShopAdvisementNearby($latitude, $longitude, 2); // Assuming you have this method

        if ($advisement->isEmpty()) {
            return response()->json([
                'status'  => false,
                'message' => 'No advisement found for shops within 2 km.',
            ], 404);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Advisement Retrieved Successfully.',
            'data'    => $advisement,
        ], 200);
    }
}
