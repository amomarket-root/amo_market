<?php

namespace App\Services;

use App\Models\AboutUs;
use App\Models\Blog;
use App\Models\Career;
use App\Models\ContactUs;
use App\Models\DeliveryPage;
use App\Models\PrivacyPolicy;
use App\Models\SecurityPage;
use App\Models\ShopPage;
use App\Models\Term;
use Illuminate\Support\Facades\Cache;

class CompanyInformationService
{
    protected $cacheTTL = 3600; // Cache time in seconds (1 hour)

    public function getAllAboutUs()
    {
        return Cache::remember('about_us_all', $this->cacheTTL, function () {
            return AboutUs::all();
        });
    }

    public function getContactUs()
    {
        return Cache::remember('contact_us', $this->cacheTTL, function () {
            return ContactUs::all();
        });
    }

    public function getPrivacyPolicy()
    {
        return Cache::remember('privacy_policy', $this->cacheTTL, function () {
            return PrivacyPolicy::all();
        });
    }

    public function getCareers()
    {
        return Cache::remember('careers_all', $this->cacheTTL, function () {
            return Career::all();
        });
    }

    public function getTerms()
    {
        return Cache::remember('terms_all', $this->cacheTTL, function () {
            return Term::all();
        });
    }

    public function getSecurity()
    {
        return Cache::remember('security_page_all', $this->cacheTTL, function () {
            return SecurityPage::all();
        });
    }

    public function getShopPage()
    {
        return Cache::remember('shop_page_all', $this->cacheTTL, function () {
            return ShopPage::all();
        });
    }

    public function getDeliveryPage()
    {
        return Cache::remember('delivery_page_all', $this->cacheTTL, function () {
            return DeliveryPage::all();
        });
    }

    public function getPaginateBlog($data)
    {
        $pageSize = $data['per_page'] ?? 10;
        $category = $data['category'] ?? 'all';
        $cacheKey = "blogs_page_{$pageSize}_category_{$category}";

        return Cache::remember($cacheKey, $this->cacheTTL, function () use ($category, $pageSize) {
            $query = Blog::query();

            if (!empty($category) && $category !== 'all') {
                $query->where('category', $category);
            }

            return $query->paginate($pageSize);
        });
    }

    public function getBlogDetails($id)
    {
        return Cache::remember("blog_details_{$id}", $this->cacheTTL, function () use ($id) {
            return Blog::findOrFail($id);
        });
    }
}
