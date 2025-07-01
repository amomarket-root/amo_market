<?php

use App\Http\Controllers\Location\LocationTrackController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Address\AddressController;
use App\Http\Controllers\Auth\PortalAuthenticateController;
use App\Http\Controllers\Cart\CartController;
use App\Http\Controllers\Cart\UserCartController;
use App\Http\Controllers\Chat\SupportMessageController;
use App\Http\Controllers\Information\CompanyInformationController;
use App\Http\Controllers\Order\OrderController;
use App\Http\Controllers\Payment\CashfreeController;
use App\Http\Controllers\Product\CategoryController;
use App\Http\Controllers\Product\ProductController;
use App\Http\Controllers\Promotion\AdvisementController;
use App\Http\Controllers\Promotion\BannerController;
use App\Http\Controllers\Search\SearchController;
use App\Http\Controllers\Shop\ShopController;
use App\Http\Controllers\Weather\WeatherController;

/*----------------------------------------------------------*/
/*---------------- AUTHENTICATION ROUTES -------------------*/
/*----------------------------------------------------------*/

Route::get('/portal/cashfree/success', [CashfreeController::class, 'paymentSuccess']);
Route::post('/portal/cashfree/webhook', [CashfreeController::class, 'handleWebhook']);

Route::prefix('auth')->group(function () {
    // Social authentication callbacks (accessible by guests)
    Route::get('/google/callback', [PortalAuthenticateController::class, 'googleHandle']);
    Route::get('/facebook/callback', [PortalAuthenticateController::class, 'facebookHandle']);
});

Route::prefix('portal/authenticate')->group(function () {
    // Authentication routes
    Route::post('/login', [PortalAuthenticateController::class, 'login']);
    Route::post('/register', [PortalAuthenticateController::class, 'register']);
    Route::post('/forgot_password', [PortalAuthenticateController::class, 'forgotPassword']);
    Route::post('/reset_password', [PortalAuthenticateController::class, 'resetPassword']);
    Route::post('/auth_mobile', [PortalAuthenticateController::class, 'authMobile']);
    Route::post('auth_mobile_check', [PortalAuthenticateController::class, 'authMobile']);
    Route::post('verify_Otp', [PortalAuthenticateController::class, 'verifyOtp']);

    // Social authentication
    Route::get('/google', [PortalAuthenticateController::class, 'googleLogin']);
    Route::get('/google/callback', [PortalAuthenticateController::class, 'googleHandle']);
    Route::get('/facebook', [PortalAuthenticateController::class, 'facebookLogin']);
    Route::get('/facebook/callback', [PortalAuthenticateController::class, 'facebookHandle']);
});

/*----------------------------------------------------------*/
/*---------------- GUEST/PUBLIC ROUTES -----------------------*/
/*----------------------------------------------------------*/

Route::middleware('guest')->prefix('portal')->group(function () {

    Route::middleware('throttle:100,1')->post('/location/store', [LocationTrackController::class, 'store']);
    // Promotion routes
    Route::get('banners', [BannerController::class, 'index']);
    Route::get('advisement', [AdvisementController::class, 'index']);

    // Shop routes
    Route::get('shops', [ShopController::class, 'getAllShops']);
    Route::get('see_all_shops', [ShopController::class, 'getSeeAllShops']);
    Route::get('product_by_shop_id', [ShopController::class, 'getAllProductByShopId']);

    // Category routes
    Route::get('category', [CategoryController::class, 'getAllCategories']);
    Route::get('services', [CategoryController::class, 'getAllServices']);

    // Product routes
    Route::get('products', [ProductController::class, 'getAllProduct']);
    Route::get('product_by_id', [ProductController::class, 'getAllProductById']);
    Route::get('product_details', [ProductController::class, 'getProductDetailById']);
    Route::get('product_by_group', [ProductController::class, 'getAllProductByGroup']);

    // Utility routes
    Route::get('current_weather', [WeatherController::class, 'weather']);
    Route::get('search', [SearchController::class, 'search']);

    //Company Information
    Route::get('about_us', [CompanyInformationController::class, 'getAboutUs']);
    Route::get('contact_us', [CompanyInformationController::class, 'getContactUs']);
    Route::get('privacy_policy', [CompanyInformationController::class, 'getPrivacyPolicy']);
    Route::get('careers', [CompanyInformationController::class, 'getCareers']);
    Route::get('terms', [CompanyInformationController::class, 'getTerms']);
    Route::get('security', [CompanyInformationController::class, 'getSecurity']);
    Route::get('shop_page', [CompanyInformationController::class, 'getShopPage']);
    Route::get('delivery_page', [CompanyInformationController::class, 'getDeliveryPage']);
    Route::get('blogs', [CompanyInformationController::class, 'getPaginateBlog']);
    Route::get('/blog/{id}', [CompanyInformationController::class, 'getBlogDetails']);
});

/*----------------------------------------------------------*/
/*---------------- AUTHENTICATED USER ROUTES ----------------*/
/*----------------------------------------------------------*/

Route::middleware('auth:sanctum')->prefix('portal')->group(function () {

    /*---------------- USER PROFILE ROUTES -----------------*/
    Route::post('/logout', [PortalAuthenticateController::class, 'logout']);
    Route::post('/change_password', [PortalAuthenticateController::class, 'changePassword']);
    Route::get('/view_profile', [PortalAuthenticateController::class, 'viewProfile']);
    Route::get('/get_all_profile_role', [PortalAuthenticateController::class, 'getAllRole']);
    Route::get('/get_avatar', [PortalAuthenticateController::class, 'getProfileAvatar']);
    Route::post('/delete-account', [PortalAuthenticateController::class, 'deleteAccount']);

    // Cashfree Payment Routes
    Route::post('/cashfree/create-order', [CashfreeController::class, 'createOrder']);

    /*---------------- CART ROUTES ------------------------*/
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'viewCart']);
        Route::post('/add', [CartController::class, 'addToCart']);
        Route::get('/summary', [CartController::class, 'getCartSummary']);
        Route::delete('/remove/{id}', [CartController::class, 'removeFromCart']);
        Route::delete('/remove-service/{serviceId}', [CartController::class, 'removeService']);
    });

    /*---------------- USER CART ROUTES -------------------*/
    Route::prefix('user/cart')->group(function () {
        Route::post('/store_cart_details', [UserCartController::class, 'store']);
        Route::post('/update_address', [UserCartController::class, 'updateAddress']);
        Route::get('/last-record', [UserCartController::class, 'getLastCartRecord']);
    });

    /*---------------- ADDRESS ROUTES ----------------------*/
    Route::prefix('user/address')->group(function () {
        Route::get('/', [AddressController::class, 'index']);
        Route::post('/store_address_details', [AddressController::class, 'store']);
        Route::put('/{addressId}', [AddressController::class, 'show']);
        Route::put('/{addressId}', [AddressController::class, 'update']);
        Route::delete('/{addressId}', [AddressController::class, 'destroy']);
    });

    /*---------------- ORDER ROUTES ------------------------*/
    Route::post('/user/orders/store_order_details', [OrderController::class, 'store']);
    Route::get('/user/get_order_details/{orderId}', [OrderController::class, 'getOrderCurrentUser']);
    Route::prefix('order')->group(function () {
        Route::get('/order_summary', [OrderController::class, 'getOrderSummary']);
        Route::get('/order_history', [OrderController::class, 'getOrderHistory']);
        Route::get('/order_details', [OrderController::class, 'getOrderDetails']);
        Route::get('/delivered_order_for_feedback', [OrderController::class, 'getDeliveredOrderForFeedback']);
        Route::post('/storeFeedback', [OrderController::class, 'storeFeedback']);
    });

    /*---------------- SUPPORT CHAT ROUTES -----------------*/
    Route::post('/customer_send_message', [SupportMessageController::class, 'customerSendMessage']);
    Route::get('/customer_messages', [SupportMessageController::class, 'customerGetMessages']);
});
