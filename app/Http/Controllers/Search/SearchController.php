<?php

namespace App\Http\Controllers\Search;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\SubCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SearchController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/portal/search",
     *     summary="Search shops, categories, subcategories, and products within a radius",
     *     description="Search for shops, categories, subcategories, and products by query string and geographic location with radius filtering.",
     *     tags={"Search"},
     *
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         description="Search keyword",
     *         required=true,
     *
     *         @OA\Schema(type="string", minLength=1)
     *     ),
     *
     *     @OA\Parameter(
     *         name="latitude",
     *         in="query",
     *         description="Latitude coordinate",
     *         required=true,
     *
     *         @OA\Schema(type="number", format="float")
     *     ),
     *
     *     @OA\Parameter(
     *         name="longitude",
     *         in="query",
     *         description="Longitude coordinate",
     *         required=true,
     *
     *         @OA\Schema(type="number", format="float")
     *     ),
     *
     *     @OA\Parameter(
     *         name="radius",
     *         in="query",
     *         description="Radius in kilometers to filter nearby shops",
     *         required=true,
     *
     *         @OA\Schema(type="number", format="float")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Search results found",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="products", type="array",
     *
     *                 @OA\Items(
     *                     type="object",
     *
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="sub_category_id", type="integer"),
     *                     @OA\Property(property="name", type="string"),
     *                     @OA\Property(property="image", type="string"),
     *                     @OA\Property(property="sub_category", type="object",
     *                         @OA\Property(property="category", type="object")
     *                     )
     *                 )
     *             ),
     *             @OA\Property(property="categories", type="array",
     *
     *                 @OA\Items(
     *                     type="object",
     *
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="name", type="string"),
     *                     @OA\Property(property="image", type="string")
     *                 )
     *             ),
     *             @OA\Property(property="shops", type="array",
     *
     *                 @OA\Items(
     *                     type="object",
     *
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="name", type="string"),
     *                     @OA\Property(property="image", type="string"),
     *                     @OA\Property(property="latitude", type="number", format="float"),
     *                     @OA\Property(property="longitude", type="number", format="float"),
     *                     @OA\Property(property="distance", type="number", format="float", description="Distance from search point in kilometers")
     *                 )
     *             ),
     *             @OA\Property(property="sub_categories", type="array",
     *
     *                 @OA\Items(
     *                     type="object",
     *
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="name", type="string"),
     *                     @OA\Property(property="image", type="string"),
     *                     @OA\Property(property="category_id", type="integer")
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=400,
     *         description="Validation error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation error"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=404,
     *         description="No matching data found",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="No matching data found.")
     *         )
     *     )
     * )
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query'     => 'required|string|min:1',
            'latitude'  => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius'    => 'required|numeric', // Radius in kilometers
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors(),
            ], 400);
        }

        $query     = $request->input('query');
        $latitude  = (float) $request->input('latitude');
        $longitude = (float) $request->input('longitude');
        $radius    = (float) $request->input('radius');

        // Fetch shops within the specified radius
        $shops = Shop::selectRaw('id, name, image, latitude, longitude,
                ( 6371 * acos( cos( radians(?) ) *
                cos( radians( latitude ) )
                * cos( radians( longitude ) - radians(?) )
                + sin( radians(?) ) *
                sin( radians( latitude ) ) ) )
                AS distance', [$latitude, $longitude, $latitude])
            ->where('online_status', 1)  // Only include shops that are online
            // ->where('name', 'like', "%{$query}%")
            ->having('distance', '<', $radius)
            ->orderBy('distance', 'asc')
            ->get();

        // Get the IDs of the shops within the radius
        $shopIds = $shops->pluck('id')->toArray();

        // Search in categories table
        $categories = Category::select('categories.id', 'categories.name', 'categories.image')
            ->join('shops', 'shops.id', '=', 'categories.shop_id')
            ->where('categories.name', 'like', "%{$query}%")
            ->whereIn('shops.id', $shopIds)
            ->orderBy('categories.name', 'asc')
            ->get();

        // Search in sub_categories table
        $subCategories = SubCategory::select('sub_categories.id', 'sub_categories.name', 'sub_categories.image', 'sub_categories.category_id')
            ->join('categories', 'categories.id', '=', 'sub_categories.category_id')
            ->join('shops', 'shops.id', '=', 'categories.shop_id')
            ->where('sub_categories.name', 'like', "%{$query}%")
            ->whereIn('shops.id', $shopIds)
            ->orderBy('sub_categories.name', 'asc')
            ->get();

        // Fetch products that belong to the shops within the radius
        $products = Product::select('id', 'sub_category_id', 'name', 'image')
            ->with(['sub_category.category' => function ($query) use ($shopIds) {
                $query->whereIn('shop_id', $shopIds);
            }])
            ->whereHas('sub_category.category', function ($query) use ($shopIds) {
                $query->whereIn('shop_id', $shopIds);
            })
            ->where('products.name', 'like', "%{$query}%")
            ->orderBy('id', 'asc')
            ->get();

        // Combine all results into a single response
        $results = [
            'products'       => $products,
            'categories'     => $categories,
            'shops'          => $shops,
            'sub_categories' => $subCategories,
        ];

        // Check if any results are found
        if ($shops->isEmpty() && $categories->isEmpty() && $subCategories->isEmpty() && $products->isEmpty()) {
            return response()->json([
                'status'  => false,
                'message' => 'No matching data found.',
            ], 404);
        }

        return response()->json($results);
    }
}
