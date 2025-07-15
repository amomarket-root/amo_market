<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Shop;
use Illuminate\Support\Facades\Cache;

class ShopService
{
    public function getShopsNearby($latitude, $longitude, $radius = 3)
    {
        // Generate a unique cache key based on location and radius
        $cacheKey = 'shops_nearby_'.md5("lat:$latitude|lng:$longitude|radius:$radius");

        return Cache::remember($cacheKey, now()->addMinutes(20), function () use ($latitude, $longitude, $radius) {
            return Shop::select(
                'shops.id',
                'shops.user_id',
                'shops.name',
                'shops.image',
                'shops.rating',
                'shops.time',
                'shops.description',
                'shops.location',
                'shops.latitude',
                'shops.longitude',
                'shops.online_status',
                'shops.status',
                'shop_types.name as shop_type_name',
                'shop_types.has_services'
            )
                ->selectRaw(
                    '(6371 * acos( cos( radians(?) ) *
                    cos( radians( shops.latitude ) )
                    * cos( radians( shops.longitude ) - radians(?) )
                    + sin( radians(?) ) *
                    sin( radians( shops.latitude ) ) )) AS distance',
                    [$latitude, $longitude, $latitude]
                )
                ->selectRaw("CASE WHEN shop_types.has_services = 1 THEN 'service' ELSE 'product' END as type")
                ->join('shop_types', 'shops.shop_type_id', '=', 'shop_types.id')
                ->where('shops.online_status', 1)
                ->having('distance', '<', $radius)
                ->orderBy('distance', 'asc')
                ->limit(10)
                ->get();
        });
    }

    public function getSeeAllShops($latitude, $longitude, $radius = 3)
    {
        // Generate a unique Redis cache key
        $cacheKey = 'see_all_shops_'.md5("lat:$latitude|lng:$longitude|radius:$radius");

        return Cache::remember($cacheKey, now()->addMinutes(20), function () use ($latitude, $longitude, $radius) {
            return Shop::select(
                'shops.id',
                'shops.user_id',
                'shops.name',
                'shops.image',
                'shops.rating',
                'shops.time',
                'shops.description',
                'shops.location',
                'shops.latitude',
                'shops.longitude',
                'shops.online_status',
                'shops.status',
                'shop_types.name as shop_type_name',
                'shop_types.has_services'
            )
                ->selectRaw(
                    '(6371 * acos( cos( radians(?) ) *
                    cos( radians( shops.latitude ) ) *
                    cos( radians( shops.longitude ) - radians(?) ) +
                    sin( radians(?) ) *
                    sin( radians( shops.latitude ) ) )) AS distance',
                    [$latitude, $longitude, $latitude]
                )
                ->selectRaw("CASE WHEN shop_types.has_services = 1 THEN 'service' ELSE 'product' END as type")
                ->join('shop_types', 'shops.shop_type_id', '=', 'shop_types.id')
                ->having('distance', '<', $radius)
                ->orderBy('distance', 'asc')
                ->get();
        });
    }

    public function getAllProductByShopId($data)
    {
        $shopId    = $data['shop_id']   ?? null;
        $sortBy    = $data['sort_by']   ?? 'Relevance';
        $latitude  = $data['latitude']  ?? null;
        $longitude = $data['longitude'] ?? null;
        $radius    = $data['radius']    ?? 2;

        // Generate a unique cache key
        $cacheKey = 'products_by_shop_'.md5(json_encode([
            'shop_id'   => $shopId,
            'sort_by'   => $sortBy,
            'latitude'  => $latitude,
            'longitude' => $longitude,
            'radius'    => $radius,
        ]));

        return Cache::remember($cacheKey, now()->addMinutes(20), function () use ($shopId, $sortBy, $latitude, $longitude, $radius) {
            $shops = Shop::with('shopType')->selectRaw('id, name, shop_type_id, latitude, longitude,
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

            if ($shopId && ! in_array($shopId, $shopIds)) {
                return [
                    'type'    => 'error',
                    'message' => 'Shop not found in your area',
                ];
            }

            $shop          = $shops->firstWhere('id', $shopId);
            $isServiceShop = optional($shop->shopType)->has_services ?? false;

            if ($isServiceShop) {
                return [
                    'type'      => 'service',
                    'shop_id'   => $shop->id,
                    'shop_name' => $shop->name,
                    'shop_type' => optional($shop->shopType)->name,
                    'data'      => [],
                ];
            }

            // Product logic
            $query = Product::with(['sub_category.category.shop' => function ($query) use ($shopId, $shopIds) {
                if ($shopId) {
                    $query->where('id', $shopId);
                } else {
                    $query->whereIn('id', $shopIds);
                }
            }])
                ->whereHas('sub_category.category.shop', function ($query) use ($shopId, $shopIds) {
                    if ($shopId) {
                        $query->where('id', $shopId);
                    } else {
                        $query->whereIn('id', $shopIds);
                    }
                });

            // Apply sorting
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

            $products = $query->get();

            // Attach shop name
            $products->each(function ($product) {
                $product->shop_name = optional($product->sub_category->category->shop)->name;
            });

            return [
                'type'      => 'product',
                'shop_id'   => $shopId,
                'shop_name' => $shop->name ?? null,
                'data'      => $products,
            ];
        });
    }
}
