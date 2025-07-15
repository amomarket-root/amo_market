<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Facades\Cache;

class CategoryService
{
    public function getCategoriesByShopLocation($latitude, $longitude, $radius = 3)
    {
        // Create a unique cache key for this query
        $cacheKey = 'categories_nearby_'.md5("lat:$latitude|lng:$longitude|radius:$radius");

        return Cache::remember($cacheKey, now()->addMinutes(20), function () use ($latitude, $longitude, $radius) {
            return Category::select([
                'categories.id',
                'categories.name',
                'categories.shop_id',
                'categories.content_image',
                'categories.image',
            ])
                ->join('shops', 'shops.id', '=', 'categories.shop_id')
                ->join('shop_types', 'shop_types.id', '=', 'shops.shop_type_id')
                ->where('shop_types.has_services', false) // Only product-based shops
                ->selectRaw('
                (6371 * acos(
                    cos(radians(?)) * cos(radians(shops.latitude))
                    * cos(radians(shops.longitude) - radians(?))
                    + sin(radians(?)) * sin(radians(shops.latitude))
                )) AS distance
            ', [$latitude, $longitude, $latitude])
                ->having('distance', '<', $radius)
                ->orderBy('distance', 'asc')
                ->limit(20)
                ->get();
        });
    }

    public function getSeeCategoriesByShopLocation($latitude, $longitude, $radius = 3)
    {
        // Create a unique cache key for this query
        $cacheKey = 'categories_nearby_'.md5("lat:$latitude|lng:$longitude|radius:$radius");

        return Cache::remember($cacheKey, now()->addMinutes(20), function () use ($latitude, $longitude, $radius) {
            return Category::select([
                'categories.id',
                'categories.name',
                'categories.shop_id',
                'categories.content_image',
                'categories.image',
            ])
                ->join('shops', 'shops.id', '=', 'categories.shop_id')
                ->join('shop_types', 'shop_types.id', '=', 'shops.shop_type_id')
                ->where('shop_types.has_services', false) // Only product-based shops
                ->selectRaw('
                (6371 * acos(
                    cos(radians(?)) * cos(radians(shops.latitude))
                    * cos(radians(shops.longitude) - radians(?))
                    + sin(radians(?)) * sin(radians(shops.latitude))
                )) AS distance
            ', [$latitude, $longitude, $latitude])
                ->having('distance', '<', $radius)
                ->orderBy('distance', 'asc')
                ->get();
        });
    }
    public function getServicesByShopLocation($latitude, $longitude, $radius = 3)
    {
        // Create a unique cache key based on location and radius
        $cacheKey = 'services_nearby_'.md5("lat:$latitude|lng:$longitude|radius:$radius");

        return Cache::remember($cacheKey, now()->addMinutes(20), function () use ($latitude, $longitude, $radius) {
            $categories = Category::select([
                'categories.id',
                'categories.name',
                'categories.shop_id',
                'categories.content_image',
                'categories.image',
                'shop_types.has_services',
            ])
                ->join('shops', 'shops.id', '=', 'categories.shop_id')
                ->join('shop_types', 'shop_types.id', '=', 'shops.shop_type_id')
                ->where('shop_types.has_services', true)
                ->selectRaw('
                (6371 * acos(
                    cos(radians(?)) * cos(radians(shops.latitude))
                    * cos(radians(shops.longitude) - radians(?))
                    + sin(radians(?)) * sin(radians(shops.latitude))
                )) AS distance
            ', [$latitude, $longitude, $latitude])
                ->having('distance', '<', $radius)
                ->orderBy('distance', 'asc')
                ->limit(8)
                ->get()
                ->map(function ($item) {
                    $item->shop_type = $item->has_services ? 'service' : 'product';
                    unset($item->has_services);

                    return $item;
                });

            return $categories;
        });
    }

    public function getSeeServicesByShopLocation($latitude, $longitude, $radius = 3)
    {
        // Create a unique cache key based on location and radius
        $cacheKey = 'services_nearby_'.md5("lat:$latitude|lng:$longitude|radius:$radius");

        return Cache::remember($cacheKey, now()->addMinutes(20), function () use ($latitude, $longitude, $radius) {
            $categories = Category::select([
                'categories.id',
                'categories.name',
                'categories.shop_id',
                'categories.content_image',
                'categories.image',
                'shop_types.has_services',
            ])
                ->join('shops', 'shops.id', '=', 'categories.shop_id')
                ->join('shop_types', 'shop_types.id', '=', 'shops.shop_type_id')
                ->where('shop_types.has_services', true)
                ->selectRaw('
                (6371 * acos(
                    cos(radians(?)) * cos(radians(shops.latitude))
                    * cos(radians(shops.longitude) - radians(?))
                    + sin(radians(?)) * sin(radians(shops.latitude))
                )) AS distance
            ', [$latitude, $longitude, $latitude])
                ->having('distance', '<', $radius)
                ->orderBy('distance', 'asc')
                ->get()
                ->map(function ($item) {
                    $item->shop_type = $item->has_services ? 'service' : 'product';
                    unset($item->has_services);

                    return $item;
                });

            return $categories;
        });
    }
}
