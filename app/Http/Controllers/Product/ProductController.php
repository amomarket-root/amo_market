<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * @OA\Get(
     *     path="/api/portal/products",
     *     summary="Get all products based on current location",
     *     description="Returns a list of products grouped by category, available within a 2 km radius from the user's current location.",
     *     operationId="getAllProduct",
     *     tags={"Product"},
     *
     *     @OA\Parameter(
     *         name="latitude",
     *         in="query",
     *         required=true,
     *         description="Current latitude of the user",
     *
     *         @OA\Schema(type="number", format="float")
     *     ),
     *
     *     @OA\Parameter(
     *         name="longitude",
     *         in="query",
     *         required=true,
     *         description="Current longitude of the user",
     *
     *         @OA\Schema(type="number", format="float")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Products Retrieved Successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Products Retrieved Successfully."),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 additionalProperties={
     *                     @OA\Property(
     *                         property="product",
     *                         type="array",
     *
     *                         @OA\Items(
     *
     *                             @OA\Property(property="id", type="integer", example=1),
     *                             @OA\Property(property="sub_category_id", type="integer", example=3),
     *                             @OA\Property(property="name", type="string", example="Milk"),
     *                             @OA\Property(property="image", type="string", example="https://example.com/image.png"),
     *                             @OA\Property(property="weight", type="string", example="1L"),
     *                             @OA\Property(property="price", type="number", format="float", example=50.00),
     *                             @OA\Property(property="original_price", type="number", format="float", example=60.00),
     *                             @OA\Property(property="discount", type="number", format="float", example=10),
     *                             @OA\Property(property="delivery_time", type="string", example="20 mins"),
     *                             @OA\Property(property="status", type="integer", example=1)
     *                         )
     *                     )
     *                 }
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=400,
     *         description="Current location not provided",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Current location not provided.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=404,
     *         description="Products List Not Found in the radius",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Products List Not Found in the radius.")
     *         )
     *     )
     * )
     */
    public function getAllProduct(Request $request)
    {
        $latitude  = $request->input('latitude');
        $longitude = $request->input('longitude');

        // If latitude and longitude are not provided, return all Products
        if (! $latitude || ! $longitude) {
            return response()->json([
                'status'  => false,
                'message' => 'Current location not provided.',
            ], 400);
        }
        // Get Products based on shops within a specific radius (e.g., 2 km)
        $products = $this->productService->getAllProduct($latitude, $longitude, 3);

        if ($products->isEmpty()) {
            return response()->json([
                'status'  => false,
                'message' => 'Products List Not Found in the radius.',
            ], 404);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Products Retrieved Successfully.',
            'data'    => $products,
        ], 200);
    }

    public function getSeeAllProduct(Request $request)
    {
        $latitude  = $request->input('latitude');
        $longitude = $request->input('longitude');

        // If latitude and longitude are not provided, return all Products
        if (! $latitude || ! $longitude) {
            return response()->json([
                'status'  => false,
                'message' => 'Current location not provided.',
            ], 400);
        }
        // Get Products based on shops within a specific radius (e.g., 2 km)
        $products = $this->productService->getSeeAllProduct($latitude, $longitude, 3);

        if ($products->isEmpty()) {
            return response()->json([
                'status'  => false,
                'message' => 'Products List Not Found in the radius.',
            ], 404);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Products Retrieved Successfully.',
            'data'    => $products,
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/portal/product_by_id",
     *     summary="Get products by category ID, location, and sort options",
     *     tags={"Product"},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"latitude","longitude"},
     *
     *             @OA\Property(property="latitude", type="number", format="float", example=12.9716),
     *             @OA\Property(property="longitude", type="number", format="float", example=77.5946),
     *             @OA\Property(property="category_id", type="integer", example=3),
     *             @OA\Property(property="sort_by", type="string", example="Price(L-H)"),
     *             @OA\Property(property="radius", type="number", format="float", example=2)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful product retrieval",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Products Retrieved Successfully."),
     *             @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=400,
     *         description="Location not provided",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Current location not provided.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=404,
     *         description="No products found in radius",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="No Products Found in the radius.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Something went wrong.")
     *         )
     *     )
     * )
     */
    public function getAllProductById(Request $request)
    {
        try {
            $latitude  = $request->input('latitude');
            $longitude = $request->input('longitude');

            // If latitude and longitude are not provided, return all Products
            if (! $latitude || ! $longitude) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Current location not provided.',
                ], 400);
            }

            $products = $this->productService->getAllProductById($request->all());

            if ($products->isEmpty()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'No Products Found in the radius.',
                ], 404);
            }

            return response()->json([
                'status'  => true,
                'message' => 'Products Retrieved Successfully.',
                'data'    => $products,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/portal/product_by_group",
     *     operationId="getAllProductByGroup",
     *     tags={"Product"},
     *     summary="Get all grouped products by category and subcategory within a specific radius",
     *     description="Returns grouped products filtered by category, subcategory, and sorted by options like price or discount.",
     *
     *     @OA\Parameter(
     *         name="latitude",
     *         in="query",
     *         required=true,
     *         description="Latitude of the user's location",
     *
     *         @OA\Schema(type="number", format="float", example=12.9716)
     *     ),
     *
     *     @OA\Parameter(
     *         name="longitude",
     *         in="query",
     *         required=true,
     *         description="Longitude of the user's location",
     *
     *         @OA\Schema(type="number", format="float", example=77.5946)
     *     ),
     *
     *     @OA\Parameter(
     *         name="category_id",
     *         in="query",
     *         required=false,
     *         description="ID of the category to filter products",
     *
     *         @OA\Schema(type="integer", example=3)
     *     ),
     *
     *     @OA\Parameter(
     *         name="subcategory_id",
     *         in="query",
     *         required=false,
     *         description="ID of the subcategory to filter products",
     *
     *         @OA\Schema(type="integer", example=7)
     *     ),
     *
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         required=false,
     *         description="Sort by option (Relevance, Price(L-H), Price(H-L), discount)",
     *
     *         @OA\Schema(type="string", example="Price(L-H)")
     *     ),
     *
     *     @OA\Parameter(
     *         name="radius",
     *         in="query",
     *         required=false,
     *         description="Search radius in kilometers (default: 2 km)",
     *
     *         @OA\Schema(type="number", format="float", example=2)
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Grouped products retrieved successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Products Retrieved Successfully."),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *
     *                 @OA\Items(
     *
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Snacks"),
     *                     @OA\Property(
     *                         property="sub_category",
     *                         type="array",
     *
     *                         @OA\Items(
     *
     *                             @OA\Property(property="id", type="integer", example=10),
     *                             @OA\Property(property="name", type="string", example="Chips"),
     *                             @OA\Property(
     *                                 property="product",
     *                                 type="array",
     *
     *                                 @OA\Items(
     *
     *                                     @OA\Property(property="id", type="integer", example=100),
     *                                     @OA\Property(property="name", type="string", example="Lay's Classic Salted"),
     *                                     @OA\Property(property="price", type="number", format="float", example=30),
     *                                     @OA\Property(property="discount", type="number", format="float", example=5)
     *                                 )
     *                             )
     *                         )
     *                     )
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
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Current location not provided.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=404,
     *         description="No products found",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="No Products Found.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Exception message here.")
     *         )
     *     )
     * )
     */
    public function getAllProductByGroup(Request $request)
    {
        try {
            $latitude  = $request->input('latitude');
            $longitude = $request->input('longitude');

            // If latitude and longitude are not provided, return all categories
            if (! $latitude || ! $longitude) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Current location not provided.',
                ], 400);
            }

            $products = $this->productService->getAllProductByGroup($request->all());

            if ($products->isEmpty()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'No Products Found.',
                ], 404);
            }

            return response()->json([
                'status'  => true,
                'message' => 'Products Retrieved Successfully.',
                'data'    => $products,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/portal/product_details",
     *     summary="Get Product Detail by ID",
     *     description="Fetch detailed information of a product by its ID.",
     *     operationId="getProductDetailById",
     *     tags={"Product"},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"product_id"},
     *
     *             @OA\Property(property="product_id", type="integer", example=123)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Product retrieved successfully.",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Product Retrieved Successfully."),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=123),
     *                 @OA\Property(property="name", type="string", example="Product Name"),
     *                 @OA\Property(property="price", type="number", format="float", example=29.99),
     *                 @OA\Property(property="sub_category", type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Beverages"),
     *                     @OA\Property(property="category", type="object",
     *                         @OA\Property(property="id", type="integer", example=10),
     *                         @OA\Property(property="name", type="string", example="Drinks")
     *                     )
     *                 ),
     *                 @OA\Property(property="product_information", type="array",
     *
     *                     @OA\Items(
     *
     *                         @OA\Property(property="key", type="string", example="Ingredients"),
     *                         @OA\Property(property="value", type="string", example="Water, Sugar")
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=404,
     *         description="Product not found",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="No Product Found.")
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
     *             @OA\Property(property="message", type="string", example="Error message")
     *         )
     *     )
     * )
     */
    public function getProductDetailById(Request $request)
    {
        try {
            $product = $this->productService->getProductDetailById($request->all());

            if (is_null($product)) {
                return response()->json([
                    'status'  => false,
                    'message' => 'No Product Found.',
                ], 404);
            }

            return response()->json([
                'status'  => true,
                'message' => 'Product Retrieved Successfully.',
                'data'    => $product,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }
}
