<?php

namespace App\Services;

use App\Models\BannerPage;
use App\Models\Shop;
use Illuminate\Support\Facades\Cache;

class BannerService
{
    public function getShopBannerNearby($latitude, $longitude, $radius = 3)
    {
        // Generate unique cache key based on location and radius
        $cacheKey = 'banner_nearby_'.md5("lat:$latitude|lng:$longitude|radius:$radius");

        return Cache::remember($cacheKey, now()->addMinutes(20), function () use ($latitude, $longitude, $radius) {
            // Find nearby shops within radius
            $shops = Shop::selectRaw('
                id, name, latitude, longitude,
                ( 6371 * acos( cos( radians(?) ) *
                  cos( radians( latitude ) ) *
                  cos( radians( longitude ) - radians(?) ) +
                  sin( radians(?) ) *
                  sin( radians( latitude ) )
                )) AS distance
            ', [$latitude, $longitude, $latitude])
                ->where('online_status', 1)
                ->having('distance', '<', $radius)
                ->orderBy('distance', 'asc')
                ->get();

            $shopIds = $shops->pluck('id')->toArray();

            // Get banners for those shops
            $banner = BannerPage::select('id', 'shop_id', 'content_image', 'title')
                ->whereIn('shop_id', $shopIds)
                ->orderBy('id', 'desc')
                ->get();

            return $banner;
        });
    }
}
