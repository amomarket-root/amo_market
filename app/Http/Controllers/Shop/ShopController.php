<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Services\ShopService;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    protected $shopService;

    public function __construct(ShopService $shopService)
    {
        $this->shopService = $shopService;
    }

    /**
     * @OA\Get(
     *     path="/api/portal/shops",
     *     operationId="getNearbyShops",
     *     tags={"Shop"},
     *     summary="Get nearby shops within a 2km radius",
     *     description="Returns a list of nearby shops based on the user's current latitude and longitude.",
     *     @OA\Parameter(
     *         name="latitude",
     *         in="query",
     *         required=true,
     *         description="Latitude of the current location",
     *         @OA\Schema(
     *             type="number",
     *             format="float"
     *         )
     *     ),
     *     @OA\Parameter(
     *         name="longitude",
     *         in="query",
     *         required=true,
     *         description="Longitude of the current location",
     *         @OA\Schema(
     *             type="number",
     *             format="float"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Shops retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Shops Retrieved Successfully."),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="user_id", type="integer", example=101),
     *                     @OA\Property(property="name", type="string", example="Fresh Mart"),
     *                     @OA\Property(property="image", type="string", example="shop_image.jpg"),
     *                     @OA\Property(property="rating", type="number", format="float", example=4.5),
     *                     @OA\Property(property="time", type="string", example="10-20 mins"),
     *                     @OA\Property(property="description", type="string", example="Grocery delivery shop."),
     *                     @OA\Property(property="location", type="string", example="Main Street"),
     *                     @OA\Property(property="latitude", type="number", format="float", example=12.9716),
     *                     @OA\Property(property="longitude", type="number", format="float", example=77.5946),
     *                     @OA\Property(property="online_status", type="integer", example=1),
     *                     @OA\Property(property="status", type="integer", example=1),
     *                     @OA\Property(property="shop_type_name", type="string", example="Grocery"),
     *                     @OA\Property(property="has_services", type="integer", example=0),
     *                     @OA\Property(property="distance", type="number", format="float", example=1.2),
     *                     @OA\Property(property="type", type="string", example="product")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Missing latitude or longitude",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Current location not provided.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="No shops found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="No shops found within 2 km.")
     *         )
     *     )
     * )
     */
    public function getAllShops(Request $request)
    {
        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');

        // If latitude and longitude are not provided, return all shops
        if (!$latitude || !$longitude) {
            return response()->json([
                'status' => false,
                'message' => 'Current location not provided.',
            ], 400);
        }

        $shops = $this->shopService->getShopsNearby($latitude, $longitude, 2); // Radius is 2 km

        if ($shops->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'No shops found within 2 km.',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Shops Retrieved Successfully.',
            'data' => $shops,
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/portal/see_all_shops",
     *     operationId="getSeeAllShops",
     *     tags={"Shop"},
     *     summary="Get all nearby shops within a 2km radius (no limit)",
     *     description="Returns all shops within a 2km radius based on the user's current location (latitude and longitude).",
     *     @OA\Parameter(
     *         name="latitude",
     *         in="query",
     *         required=true,
     *         description="Latitude of the user's current location",
     *         @OA\Schema(type="number", format="float", example=12.9716)
     *     ),
     *     @OA\Parameter(
     *         name="longitude",
     *         in="query",
     *         required=true,
     *         description="Longitude of the user's current location",
     *         @OA\Schema(type="number", format="float", example=77.5946)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Shops retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Shops Retrieved Successfully."),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="user_id", type="integer", example=101),
     *                     @OA\Property(property="name", type="string", example="Fresh Mart"),
     *                     @OA\Property(property="image", type="string", example="shop_image.jpg"),
     *                     @OA\Property(property="rating", type="number", format="float", example=4.5),
     *                     @OA\Property(property="time", type="string", example="10-20 mins"),
     *                     @OA\Property(property="description", type="string", example="Grocery delivery shop."),
     *                     @OA\Property(property="location", type="string", example="Main Street"),
     *                     @OA\Property(property="latitude", type="number", format="float", example=12.9716),
     *                     @OA\Property(property="longitude", type="number", format="float", example=77.5946),
     *                     @OA\Property(property="online_status", type="integer", example=1),
     *                     @OA\Property(property="status", type="integer", example=1),
     *                     @OA\Property(property="shop_type_name", type="string", example="Grocery"),
     *                     @OA\Property(property="has_services", type="integer", example=0),
     *                     @OA\Property(property="distance", type="number", format="float", example=1.5),
     *                     @OA\Property(property="type", type="string", example="product")
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
     *         description="No shops found within 2 km",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="No shops found within 2 km.")
     *         )
     *     )
     * )
     */
    public function getSeeAllShops(Request $request)
    {
        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');

        // If latitude and longitude are not provided, return all shops
        if (!$latitude || !$longitude) {
            return response()->json([
                'status' => false,
                'message' => 'Current location not provided.',
            ], 400);
        }

        $shops = $this->shopService->getSeeAllShops($latitude, $longitude, 2); // Radius is 2 km

        if ($shops->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'No shops found within 2 km.',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Shops Retrieved Successfully.',
            'data' => $shops,
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/portal/product_by_shop_id",
     *     operationId="getAllProductByShopId",
     *     tags={"Shop"},
     *     summary="Get all products by Shop ID within a radius",
     *     description="Returns a list of products from a shop if it's a product-based shop, or service details if it's a service-based shop.",
     *
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"latitude", "longitude", "shop_id"},
     *             @OA\Property(property="latitude", type="number", format="float", example=12.9716),
     *             @OA\Property(property="longitude", type="number", format="float", example=77.5946),
     *             @OA\Property(property="shop_id", type="integer", example=5),
     *             @OA\Property(property="sort_by", type="string", enum={"Relevance", "Price(L-H)", "Price(H-L)", "discount"}, example="Relevance"),
     *             @OA\Property(property="radius", type="number", format="float", example=2)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Products or services retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Products retrieved successfully."),
     *             @OA\Property(property="type", type="string", enum={"product", "service"}, example="product"),
     *             @OA\Property(property="shop_id", type="integer", example=5),
     *             @OA\Property(property="shop_name", type="string", example="Amo Mart"),
     *             @OA\Property(property="shop_type", type="string", example="Salon", nullable=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="sub_category_id", type="integer", example=10),
     *                     @OA\Property(property="name", type="string", example="Mango 1kg"),
     *                     @OA\Property(property="image", type="string", example="https://example.com/images/mango.jpg"),
     *                     @OA\Property(property="weight", type="string", example="1kg"),
     *                     @OA\Property(property="price", type="number", example=99),
     *                     @OA\Property(property="original_price", type="number", example=120),
     *                     @OA\Property(property="discount", type="number", example=21),
     *                     @OA\Property(property="delivery_time", type="string", example="30 mins"),
     *                     @OA\Property(property="shop_name", type="string", example="Amo Mart")
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=400,
     *         description="Latitude or Longitude not provided",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Current location not provided.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=404,
     *         description="Shop not found or no products found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="No products found in the radius.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Server error message.")
     *         )
     *     )
     * )
     */
    public function getAllProductByShopId(Request $request)
    {
        try {
            $latitude = $request->input('latitude');
            $longitude = $request->input('longitude');

            if (!$latitude || !$longitude) {
                return response()->json([
                    'status' => false,
                    'message' => 'Current location not provided.',
                ], 400);
            }

            $result = $this->shopService->getAllProductByShopId($request->all());

            if ($result['type'] === 'error') {
                return response()->json([
                    'status' => false,
                    'message' => $result['message'],
                ], 404);
            }

            if ($result['type'] === 'service') {
                return response()->json([
                    'status' => true,
                    'message' => 'This shop provides services. Please contact them directly.',
                    'type' => 'service',
                    'shop_id' => $result['shop_id'],
                    'shop_name' => $result['shop_name'],
                    'shop_type' => $result['shop_type'],
                    'data' => $result['data']
                ], 200);
            }

            if (empty($result['data'])) {
                return response()->json([
                    'status' => false,
                    'message' => 'No products found in the radius.',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Products retrieved successfully.',
                'type' => 'product',
                'shop_id' => $result['shop_id'],
                'shop_name' => $result['shop_name'],
                'data' => $result['data']
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }
}
