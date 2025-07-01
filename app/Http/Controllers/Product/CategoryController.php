<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Services\CategoryService;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    protected $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    /**
     * @OA\Get(
     *     path="/api/portal/category",
     *     operationId="getAllCategories",
     *     tags={"Categories"},
     *     summary="Get all categories for shops near user",
     *     description="Returns product categories for shops within a 2 km radius of the user's current location.",
     *     @OA\Parameter(
     *         name="latitude",
     *         in="query",
     *         required=true,
     *         description="Latitude of the user's location",
     *         @OA\Schema(type="number", format="float", example=12.9716)
     *     ),
     *     @OA\Parameter(
     *         name="longitude",
     *         in="query",
     *         required=true,
     *         description="Longitude of the user's location",
     *         @OA\Schema(type="number", format="float", example=77.5946)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Categories retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Categories Retrieved Successfully."),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Fruits & Vegetables"),
     *                     @OA\Property(property="shop_id", type="integer", example=11),
     *                     @OA\Property(property="content_image", type="string", example="content_img.jpg"),
     *                     @OA\Property(property="image", type="string", example="category_img.jpg"),
     *                     @OA\Property(property="distance", type="number", format="float", example=1.4)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Missing location data",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Current location not provided.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="No categories found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="No categories found for shops within 3 km.")
     *         )
     *     )
     * )
     */
    public function getAllCategories(Request $request)
    {
        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');

        // If latitude and longitude are not provided, return all categories
        if (!$latitude || !$longitude) {
            return response()->json([
                'status' => false,
                'message' => 'Current location not provided.',
            ], 400);
        }

        // Get categories based on shops within a specific radius (e.g., 3 km)
        $categories = $this->categoryService->getCategoriesByShopLocation($latitude, $longitude, 2); // Assuming you have this method

        if ($categories->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'No categories found for shops within 3 km.',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Categories Retrieved Successfully.',
            'data' => $categories,
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/portal/services",
     *     operationId="getAllServices",
     *     tags={"Services"},
     *     summary="Get all service categories for nearby shops",
     *     description="Returns service-based categories for shops within a 2 km radius of the user's current location.",
     *     @OA\Parameter(
     *         name="latitude",
     *         in="query",
     *         required=true,
     *         description="Latitude of the user's location",
     *         @OA\Schema(type="number", format="float", example=12.9716)
     *     ),
     *     @OA\Parameter(
     *         name="longitude",
     *         in="query",
     *         required=true,
     *         description="Longitude of the user's location",
     *         @OA\Schema(type="number", format="float", example=77.5946)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Services retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Services Retrieved Successfully."),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Haircut"),
     *                     @OA\Property(property="shop_id", type="integer", example=5),
     *                     @OA\Property(property="content_image", type="string", example="haircut_content.jpg"),
     *                     @OA\Property(property="image", type="string", example="haircut.jpg"),
     *                     @OA\Property(property="shop_type", type="string", example="service"),
     *                     @OA\Property(property="distance", type="number", format="float", example=1.8)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Missing location data",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Current location not provided.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="No services found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="No services found for shops within 3 km.")
     *         )
     *     )
     * )
     */
    public function getAllServices(Request $request)
    {
        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');

        // If latitude and longitude are not provided, return all categories
        if (!$latitude || !$longitude) {
            return response()->json([
                'status' => false,
                'message' => 'Current location not provided.',
            ], 400);
        }

        // Get categories based on shops within a specific radius (e.g., 3 km)
        $categories = $this->categoryService->getServicesByShopLocation($latitude, $longitude, 2); // Assuming you have this method

        if ($categories->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'No services found for shops within 3 km.',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Services Retrieved Successfully.',
            'data' => $categories,
        ], 200);
    }
}
