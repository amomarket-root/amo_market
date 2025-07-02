<?php

namespace App\Services;

use App\Models\AdvisementPage;
use App\Models\Shop;
use Illuminate\Support\Facades\Cache;

class AdvisementService
{
    public function getShopAdvisementNearby($latitude, $longitude, $radius = 2)
    {
        // Generate a unique cache key based on location and radius
        $cacheKey = 'advisement_nearby_'.md5("lat:$latitude|lng:$longitude|radius:$radius");

        return Cache::remember($cacheKey, now()->addMinutes(20), function () use ($latitude, $longitude, $radius) {
            // Get nearby shops with shop_type
            $shops = Shop::selectRaw('shops.id, shops.name, shops.latitude, shops.longitude, shop_types.has_services,
                ( 6371 * acos( cos( radians(?) ) *
                cos( radians( shops.latitude ) )
                * cos( radians( shops.longitude ) - radians(?) )
                + sin( radians(?) ) *
                sin( radians( shops.latitude ) ) ) )
                AS distance', [$latitude, $longitude, $latitude])
                ->join('shop_types', 'shops.shop_type_id', '=', 'shop_types.id')
                ->where('shops.online_status', 1)
                ->having('distance', '<', $radius)
                ->orderBy('distance', 'asc')
                ->get();

            $shopIds = $shops->pluck('id')->toArray();

            // Fetch advisement
            $advisement = AdvisementPage::select('advisement_pages.id', 'advisement_pages.shop_id', 'advisement_pages.content_image', 'shop_types.has_services')
                ->join('shops', 'advisement_pages.shop_id', '=', 'shops.id')
                ->join('shop_types', 'shops.shop_type_id', '=', 'shop_types.id')
                ->where('advisement_pages.status', 1)
                ->whereIn('advisement_pages.shop_id', $shopIds)
                ->orderBy('advisement_pages.id', 'desc')
                ->get()
                ->map(function ($item) {
                    $item->shop_type = $item->has_services ? 'service' : 'product';
                    unset($item->has_services);

                    return $item;
                });

            return $advisement;
        });
    }
}
