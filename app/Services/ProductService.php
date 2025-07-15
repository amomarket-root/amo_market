<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Support\Facades\Cache;

class ProductService
{
    public function getAllProduct($latitude, $longitude, $radius = 3)
    {
        // Create a unique cache key for this query
        $cacheKey = 'products_nearby_'.md5("lat:$latitude|lng:$longitude|radius:$radius");

        return Cache::remember($cacheKey, now()->addMinutes(20), function () use ($latitude, $longitude, $radius) {
            // Fetch shops within the specified radius
            $shops = Shop::selectRaw('id, name, latitude, longitude,
            ( 6371 * acos( cos( radians(?) ) *
            cos( radians( latitude ) )
            * cos( radians( longitude ) - radians(?) )
            + sin( radians(?) ) *
            sin( radians( latitude ) ) ) )
            AS distance', [$latitude, $longitude, $latitude])
                ->where('online_status', 1)  // Only include shops that are online
                ->having('distance', '<', $radius)
                ->orderBy('distance', 'asc')
                ->get();

            // Get the IDs of the shops within the radius
            $shopIds = $shops->pluck('id')->toArray();

            // Fetch products that belong to the shops within the radius
            $products = Product::select('id', 'sub_category_id', 'name', 'image', 'weight', 'price', 'original_price', 'discount', 'delivery_time', 'status')
                ->with(['sub_category.category' => function ($query) use ($shopIds) {
                    $query->whereIn('shop_id', $shopIds);
                }])
                ->whereHas('sub_category.category', function ($query) use ($shopIds) {
                    $query->whereIn('shop_id', $shopIds);
                })
                ->orderBy('id', 'asc')
                ->limit(20)
                ->get();

            // Group the products by their category name
            return $products->groupBy('sub_category.category.name');
        });
    }

    public function getSeeAllProduct($latitude, $longitude, $radius = 3)
    {
        // Create a unique cache key for this query
        $cacheKey = 'products_nearby_'.md5("lat:$latitude|lng:$longitude|radius:$radius");

        return Cache::remember($cacheKey, now()->addMinutes(20), function () use ($latitude, $longitude, $radius) {
            // Fetch shops within the specified radius
            $shops = Shop::selectRaw('id, name, latitude, longitude,
            ( 6371 * acos( cos( radians(?) ) *
            cos( radians( latitude ) )
            * cos( radians( longitude ) - radians(?) )
            + sin( radians(?) ) *
            sin( radians( latitude ) ) ) )
            AS distance', [$latitude, $longitude, $latitude])
                ->where('online_status', 1)  // Only include shops that are online
                ->having('distance', '<', $radius)
                ->orderBy('distance', 'asc')
                ->get();

            // Get the IDs of the shops within the radius
            $shopIds = $shops->pluck('id')->toArray();

            // Fetch products that belong to the shops within the radius
            $products = Product::select('id', 'sub_category_id', 'name', 'image', 'weight', 'price', 'original_price', 'discount', 'delivery_time', 'status')
                ->with(['sub_category.category' => function ($query) use ($shopIds) {
                    $query->whereIn('shop_id', $shopIds);
                }])
                ->whereHas('sub_category.category', function ($query) use ($shopIds) {
                    $query->whereIn('shop_id', $shopIds);
                })
                ->orderBy('id', 'asc')
                ->get();

            // Group the products by their category name
            return $products->groupBy('sub_category.category.name');
        });
    }

    public function getAllProductById($data)
    {
        $categoryId = $data['category_id'] ?? null;
        $sortBy     = $data['sort_by']     ?? 'Relevance';
        $latitude   = $data['latitude']    ?? null;
        $longitude  = $data['longitude']   ?? null;
        $radius     = $data['radius']      ?? 2;

        // Unique cache key
        $cacheKey = 'products_'.md5("lat:$latitude|lng:$longitude|radius:$radius|category:$categoryId|sort:$sortBy");

        // Cache for 20 minutes
        return Cache::remember($cacheKey, now()->addMinutes(20), function () use ($latitude, $longitude, $radius, $categoryId, $sortBy) {
            $shops = Shop::selectRaw('id, name, latitude, longitude,
        ( 6371 * acos( cos( radians(?) ) *
        cos( radians( latitude ) )
        * cos( radians( longitude ) - radians(?) )
        + sin( radians(?) ) *
        sin( radians( latitude ) ) ) )
        AS distance', [$latitude, $longitude, $latitude])
                ->where('online_status', 1)
                ->having('distance', '<', $radius)
                ->orderBy('distance', 'asc')
                ->get();

            $shopIds = $shops->pluck('id')->toArray();

            $query = Product::select('id', 'sub_category_id', 'name', 'image', 'weight', 'price', 'original_price', 'discount', 'delivery_time')
                ->with(['sub_category.category' => function ($query) use ($shopIds) {
                    $query->whereIn('shop_id', $shopIds);
                }])
                ->whereHas('sub_category.category', function ($query) use ($shopIds) {
                    $query->whereIn('shop_id', $shopIds);
                })
                ->when($categoryId, function ($query) use ($categoryId) {
                    $query->whereHas('sub_category.category', function ($q) use ($categoryId) {
                        $q->where('id', $categoryId);
                    });
                });

            switch ($sortBy) {
                case 'Price(L-H)':
                    $query->orderBy('price', 'asc');
                    break;
                case 'Price(H-L)':
                    $query->orderBy('price', 'desc');
                    break;
                case 'discount':
                    $query->orderBy('discount', 'desc');
                    break;
            }

            return $query->get();
        });
    }

    public function getAllProductByGroup($data)
    {
        $categoryId    = $data['category_id']    ?? null;
        $subcategoryId = $data['subcategory_id'] ?? null;
        $sortBy        = $data['sort_by']        ?? 'Relevance';
        $latitude      = $data['latitude']       ?? null;
        $longitude     = $data['longitude']      ?? null;
        $radius        = $data['radius']         ?? 2; // Default radius is 2 km

        if (! $latitude || ! $longitude) {
            return response()->json(['error' => 'Latitude and longitude are required'], 400);
        }

        // Generate a unique Redis cache key
        $cacheKey = 'grouped_products_'.md5(json_encode([
            'category_id'    => $categoryId,
            'subcategory_id' => $subcategoryId,
            'sort_by'        => $sortBy,
            'latitude'       => $latitude,
            'longitude'      => $longitude,
            'radius'         => $radius,
        ]));

        // Use Redis cache via Laravel's Cache::remember
        return Cache::remember($cacheKey, now()->addMinutes(20), function () use ($categoryId, $subcategoryId, $sortBy, $latitude, $longitude, $radius) {
            $query = Category::with([
                'sub_category.product' => function ($query) use ($subcategoryId, $sortBy) {
                    if ($subcategoryId) {
                        $query->where('sub_category_id', $subcategoryId);
                    }

                    switch ($sortBy) {
                        case 'Price(L-H)':
                            $query->orderBy('price', 'asc');
                            break;
                        case 'Price(H-L)':
                            $query->orderBy('price', 'desc');
                            break;
                        case 'discount':
                            $query->orderBy('discount', 'desc');
                            break;
                    }
                },
            ])
                ->whereHas('shop', function ($query) use ($latitude, $longitude, $radius) {
                    $query->selectRaw(
                        '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance',
                        [$latitude, $longitude, $latitude]
                    )
                        ->whereRaw(
                            '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) <= ?',
                            [$latitude, $longitude, $latitude, $radius]
                        );
                });

            if ($categoryId) {
                $query->where('id', $categoryId);
            }

            return $query->get();
        });
    }

    public function getProductDetailById($data)
    {
        $productId = $data['product_id'] ?? null;

        if (! $productId) {
            return null;
        }

        $cacheKey = 'product_detail_'.$productId;

        return Cache::remember($cacheKey, now()->addMinutes(30), function () use ($productId) {
            return Product::with(['sub_category.category', 'product_information'])
                ->find($productId);
        });
    }
}
