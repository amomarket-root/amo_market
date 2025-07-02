<?php

namespace App\Http\Controllers\Cart;

use App\Events\CartUpdated;
use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use App\Models\Service;
use App\Models\Shop;
use App\Models\SystemService;
use App\Services\FileHandlerService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    protected $fileHandlerService;

    public function __construct(FileHandlerService $fileHandlerService)
    {
        $this->fileHandlerService = $fileHandlerService;
    }

    public function addToCart(Request $request)
    {
        try {
            // Determine if this is a product or service request
            if ($request->has('product_id')) {
                return $this->addProductToCart($request);
            } elseif ($request->has('service_data')) {
                return $this->addServiceToCart($request);
            } else {
                return response()->json([
                    'status'  => false,
                    'message' => 'Invalid request. Must provide either product_id or service_data',
                ], 400);
            }
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Resource not found',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    private function addProductToCart($request)
    {
        // Validate request
        $validation = $this->validateCartRequest($request);
        if ($validation) {
            return $validation;
        }

        $userId  = Auth::id();
        $product = Product::findOrFail($request->product_id);

        // Ensure product has a valid subcategory and category
        if (! $product->sub_category || ! $product->sub_category->category) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid product configuration. Subcategory or category not found.',
            ], 400);
        }

        $shopId = $product->sub_category->category->shop_id;

        // Check if there are any service items in the cart
        $hasServiceItems = Cart::where('user_id', $userId)
            ->where('status', 0)
            ->whereNotNull('service_id')
            ->exists();

        if ($hasServiceItems) {
            return response()->json([
                'status'  => false,
                'message' => 'You cannot mix products and services in the same cart. Please complete your service order first.',
            ], 400);
        }

        // Check if the product already exists in the cart
        $cartItem = Cart::where('user_id', $userId)
            ->where('product_id', $product->id)
            ->where('status', 0)
            ->first();

        if ($cartItem) {
            // Update or remove item based on quantity
            $newQuantity = $cartItem->quantity + $request->quantity;
            if ($newQuantity <= 0) {
                $cartItem->delete();
                $message = 'Product removed from cart successfully!';
            } else {
                $cartItem->update(['quantity' => $newQuantity]);
                $message = 'Product updated in cart successfully!';
            }
        } else {
            if ($request->quantity <= 0) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Cannot add zero or negative quantity of a new product to the cart.',
                ], 400);
            }

            // Create a new cart item
            $cartItem = Cart::create([
                'user_id'    => $userId,
                'product_id' => $product->id,
                'shop_id'    => $shopId,
                'quantity'   => $request->quantity,
                'price'      => $product->price,
                'status'     => 0,
            ]);
            $message = 'Product added to cart successfully!';
        }

        // Broadcast WebSocket event
        $this->broadcastCartUpdate($userId);

        return response()->json([
            'status'  => true,
            'message' => $message,
            'data'    => $cartItem ?? null,
        ], 200);
    }

    private function addServiceToCart($request)
    {
        // Validate service request
        $validation = $this->validateServiceRequest($request);
        if ($validation) {
            return $validation;
        }

        // Decode the service_data JSON
        $serviceData = json_decode($request->service_data, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid service data format',
            ], 400);
        }

        $userId = Auth::id();
        $shopId = $serviceData['shop_id'];

        // Check if there are any product items in the cart
        $hasProductItems = Cart::where('user_id', $userId)
            ->where('status', 0)
            ->whereNotNull('product_id')
            ->exists();

        if ($hasProductItems) {
            return response()->json([
                'status'  => false,
                'message' => 'You cannot mix products and services in the same cart. Please complete your product order first.',
            ], 400);
        }

        // Get the shop with its categories and subcategories
        $shop = Shop::with(['categories.sub_category'])->find($shopId);

        if (! $shop) {
            return response()->json([
                'status'  => false,
                'message' => 'Shop not found',
            ], 404);
        }

        // Find the first available subcategory from the shop's hierarchy
        $subCategory = null;
        foreach ($shop->categories as $category) {
            if ($category->sub_category->isNotEmpty()) {
                $subCategory = $category->sub_category->first();
                break;
            }
        }

        if (! $subCategory) {
            return response()->json([
                'status'  => false,
                'message' => 'No subcategories found for this shop',
            ], 400);
        }

        // Check if this service already exists in the cart
        $existingServiceCartItem = Cart::where('user_id', $userId)
            ->where('status', 0)
            ->whereNotNull('service_id')
            ->first();

        if ($existingServiceCartItem) {
            // Check if the existing service is from the same shop
            if ($existingServiceCartItem->shop_id !== $shopId) {
                return response()->json([
                    'status'  => false,
                    'message' => 'You cannot mix services from different shops. Please complete your current service order first.',
                ], 400);
            }
        }

        // Upload files if present
        $filePaths = [];
        if ($request->hasFile('files')) {
            $filePaths = $this->fileHandlerService->uploadFiles(
                $request->file('files'),
                $userId
            );
        }

        // Create service record
        $service = Service::create([
            'sub_category_id' => $subCategory->id,
            'shop_id'         => $shopId,
            'name'            => $shopType = $serviceData['shop_type'] ?? $subCategory->name,
            'description'     => $serviceData['shop_name']             ?? 'Custom service',
            'base_price'      => $serviceData['total_amount'],
            'file_paths'      => $filePaths,
            'options'         => $this->getServiceOptions($serviceData, $shopType),
        ]);

        // Create cart item for the service
        $cartItem = Cart::create([
            'user_id'    => $userId,
            'service_id' => $service->id,
            'shop_id'    => $shopId,
            'quantity'   => $serviceData['person_count'] ?? 1,
            'price'      => $serviceData['total_amount'],
            'status'     => 0,
        ]);

        // Broadcast WebSocket event
        $this->broadcastCartUpdate($userId);

        return response()->json([
            'status'  => true,
            'message' => 'Service added to cart successfully!',
            'data'    => $cartItem,
        ], 200);
    }

    private function validateCartRequest($request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|string|exists:products,id',
            'quantity'   => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors(),
            ], 401);
        }

        return null;
    }

    private function validateServiceRequest($request)
    {
        // First check if service_data exists
        if (! $request->has('service_data')) {
            return response()->json([
                'status'  => false,
                'message' => 'service_data is required',
            ], 400);
        }

        // Decode the service_data to validate its contents
        $serviceData = json_decode($request->service_data, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid service_data format',
            ], 400);
        }

        // Common validation rules for all services
        $rules = [
            'shop_id'      => 'required|string|exists:shops,id',
            'shop_name'    => 'required|string',
            'shop_type'    => 'required|string|in:Internet Café,Car Service Center,Beauty Parlor,TV Repair Services,Salon / Barber Shop,Mobile Repair Shop,AC Service Center,Home Appliances Store',
            'total_amount' => 'required|numeric|min:0',
        ];

        // Add validation rules based on shop type
        switch ($serviceData['shop_type'] ?? '') {
            case 'Internet Café':
                $rules = array_merge($rules, [
                    'color_option' => 'required|string|in:Black & White,Colour',
                    'paper_size'   => 'required|string|in:A4,A3',
                    'print_side'   => 'required|string|in:One Side,Both Side',
                    'orientation'  => 'required|string|in:Portrait,Landscape',
                    'total_pages'  => 'required|integer|min:1',
                    'copies'       => 'required|integer|min:1',
                ]);
                break;

            case 'Car Service Center':
                $rules = array_merge($rules, [
                    'service_type'       => 'required|string|in:wash,basic,standard,premium',
                    'service_location'   => 'required|string|in:center,home',
                    'service_time'       => 'required|string',
                    'service_time_label' => 'required|string',
                    'service_duration'   => 'required|string',
                    'car_count'          => 'required|integer|min:1',
                ]);
                break;

            case 'Beauty Parlor':
                $rules = array_merge($rules, [
                    'service_type'       => 'required|string|in:facial,haircut,waxing,threading,manicure,pedicure,makeup,hairspa,bleach,massage',
                    'service_location'   => 'required|string|in:parlour,home',
                    'service_time'       => 'required|string',
                    'service_time_label' => 'required|string',
                    'service_duration'   => 'required|string',
                    'person_count'       => 'required|integer|min:1',
                ]);
                break;

            case 'TV Repair Services':
                $rules = array_merge($rules, [
                    'service_type'       => 'required|string|in:diagnostic,minor,major,panel,software',
                    'service_location'   => 'required|string|in:center,home',
                    'service_time'       => 'required|string',
                    'service_time_label' => 'required|string',
                    'service_duration'   => 'required|string',
                    'tv_size'            => 'required|string|in:small,medium,large,xlarge',
                    'tv_count'           => 'required|integer|min:1',
                ]);
                break;

            case 'Salon / Barber Shop':
                $rules = array_merge($rules, [
                    'service_type'       => 'required|string|in:haircut,beard,haircut_beard,facial,hair_color,head_massage,shave,keratin,spa,waxing',
                    'service_location'   => 'required|string|in:salon,home',
                    'service_time'       => 'required|string',
                    'service_time_label' => 'required|string',
                    'service_duration'   => 'required|string',
                    'hair_length'        => 'required|string|in:short,medium,long',
                    'person_count'       => 'required|integer|min:1',
                ]);
                break;

            case 'Mobile Repair Shop':
                $rules = array_merge($rules, [
                    'service_type'       => 'required|string|in:diagnostic,screen,battery,software,charging,water,camera',
                    'service_location'   => 'required|string|in:center,home',
                    'service_time'       => 'required|string',
                    'service_time_label' => 'required|string',
                    'service_duration'   => 'required|string',
                    'device_type'        => 'required|string|in:smartphone,tablet,foldable',
                    'device_count'       => 'required|integer|min:1',
                ]);
                break;

            case 'AC Service Center':
                $rules = array_merge($rules, [
                    'service_type'       => 'required|string|in:general,deep,gas,repair,installation,uninstallation,copper',
                    'service_location'   => 'required|string|in:center,home',
                    'service_time'       => 'required|string',
                    'service_time_label' => 'required|string',
                    'service_duration'   => 'required|string',
                    'ac_type'            => 'required|string|in:window,split,cassette,tower',
                    'ac_ton'             => 'required|string|in:1,1.5,2,2.5,3',
                    'unit_count'         => 'required|integer|min:1',
                ]);
                break;

            case 'Home Appliances Store':
                $rules = array_merge($rules, [
                    'service_type'       => 'required|string|in:repair,installation,uninstallation,maintenance,deepclean,gasrefill,motorreplace',
                    'service_location'   => 'required|string|in:center,home',
                    'service_time'       => 'required|string',
                    'service_time_label' => 'required|string',
                    'service_duration'   => 'required|string',
                    'appliance_type'     => 'required|string|in:refrigerator,washingmachine,microwave,dishwasher,oven,chimney,mixer',
                    'appliance_size'     => 'required|string|in:small,medium,large,xlarge',
                    'appliance_count'    => 'required|integer|min:1',
                ]);
                break;
        }

        $validator = Validator::make($serviceData, $rules);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors(),
            ], 400);
        }

        return null;
    }

    private function getServiceOptions($serviceData, $shopType)
    {
        $baseOptions = [
            'shop_type' => $shopType,
            'shop_name' => $serviceData['shop_name'] ?? '',
        ];

        switch ($shopType) {
            case 'Internet Café':
                return array_merge($baseOptions, [
                    'color_option' => $serviceData['color_option'],
                    'paper_size'   => $serviceData['paper_size'],
                    'print_side'   => $serviceData['print_side'],
                    'orientation'  => $serviceData['orientation'],
                    'total_pages'  => $serviceData['total_pages'],
                    'copies'       => $serviceData['copies'],
                    'files_count'  => count($serviceData['files'] ?? []),
                ]);

            case 'Car Service Center':
                return array_merge($baseOptions, [
                    'service_type'       => $serviceData['service_type'],
                    'service_location'   => $serviceData['service_location'],
                    'service_time'       => $serviceData['service_time'],
                    'service_time_label' => $serviceData['service_time_label'],
                    'service_duration'   => $serviceData['service_duration'],
                    'car_count'          => $serviceData['car_count'],
                ]);

            case 'Beauty Parlor':
                return array_merge($baseOptions, [
                    'service_type'       => $serviceData['service_type'],
                    'service_location'   => $serviceData['service_location'],
                    'service_time'       => $serviceData['service_time'],
                    'service_time_label' => $serviceData['service_time_label'],
                    'service_duration'   => $serviceData['service_duration'],
                    'person_count'       => $serviceData['person_count'],
                ]);

            case 'TV Repair Services':
                return array_merge($baseOptions, [
                    'service_type'       => $serviceData['service_type'],
                    'service_location'   => $serviceData['service_location'],
                    'service_time'       => $serviceData['service_time'],
                    'service_time_label' => $serviceData['service_time_label'],
                    'service_duration'   => $serviceData['service_duration'],
                    'tv_size'            => $serviceData['tv_size'],
                    'tv_count'           => $serviceData['tv_count'],
                ]);

            case 'Salon / Barber Shop':
                return array_merge($baseOptions, [
                    'service_type'       => $serviceData['service_type'],
                    'service_location'   => $serviceData['service_location'],
                    'service_time'       => $serviceData['service_time'],
                    'service_time_label' => $serviceData['service_time_label'],
                    'service_duration'   => $serviceData['service_duration'],
                    'hair_length'        => $serviceData['hair_length'],
                    'person_count'       => $serviceData['person_count'],
                ]);

            case 'Mobile Repair Shop':
                return array_merge($baseOptions, [
                    'service_type'       => $serviceData['service_type'],
                    'service_location'   => $serviceData['service_location'],
                    'service_time'       => $serviceData['service_time'],
                    'service_time_label' => $serviceData['service_time_label'],
                    'service_duration'   => $serviceData['service_duration'],
                    'device_type'        => $serviceData['device_type'],
                    'device_count'       => $serviceData['device_count'],
                ]);

            case 'AC Service Center':
                return array_merge($baseOptions, [
                    'service_type'       => $serviceData['service_type'],
                    'service_location'   => $serviceData['service_location'],
                    'service_time'       => $serviceData['service_time'],
                    'service_time_label' => $serviceData['service_time_label'],
                    'service_duration'   => $serviceData['service_duration'],
                    'ac_type'            => $serviceData['ac_type'],
                    'ac_ton'             => $serviceData['ac_ton'],
                    'unit_count'         => $serviceData['unit_count'],
                ]);

            case 'Home Appliances Store':
                return array_merge($baseOptions, [
                    'service_type'       => $serviceData['service_type'],
                    'service_location'   => $serviceData['service_location'],
                    'service_time'       => $serviceData['service_time'],
                    'service_time_label' => $serviceData['service_time_label'],
                    'service_duration'   => $serviceData['service_duration'],
                    'appliance_type'     => $serviceData['appliance_type'],
                    'appliance_size'     => $serviceData['appliance_size'],
                    'appliance_count'    => $serviceData['appliance_count'],
                ]);

            default:
                return $baseOptions;
        }
    }

    // Remove item from cart
    public function removeFromCart($id)
    {
        try {
            $userId = Auth::id();

            // Find the cart item by ID and ensure it belongs to the authenticated user
            $cartItem = Cart::where('id', $id)->where('user_id', $userId)->first();

            if (! $cartItem) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Cart item not found or does not belong to you',
                ], 404);
            }

            // Delete the cart item
            $cartItem->delete();

            return response()->json([
                'status'  => true,
                'message' => 'Product removed from cart successfully!',
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    // View cart items
    public function viewCart()
    {
        try {
            $userId = Auth::id();

            // Retrieve all cart items for the authenticated user
            $cartItems = Cart::with('product', 'service')
                ->where('user_id', $userId)
                ->where('status', '0')
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Your cart is empty',
                ], 404);
            }

            $totalQuantity = $cartItems->sum('quantity');
            $totalAmount   = $cartItems->sum(function ($cartItem) {
                return $cartItem->quantity * $cartItem->price; // Multiply quantity by price for each item
            });
            // Get charges from system_services table
            $deliveryCharge = SystemService::getCharge('delivery', 10);
            $platformCharge = SystemService::getCharge('platform', 4);
            $grandTotal     = $totalAmount + $deliveryCharge + $platformCharge;

            return response()->json([
                'status'  => true,
                'message' => 'Cart items retrieved successfully!',
                'data'    => [
                    'cartItems'      => $cartItems,             // cart Items
                    'totalQuantity'  => $totalQuantity,     // Add total quantity to the response
                    'totalAmount'    => $totalAmount,         // Add total amount to the response
                    'deliveryCharge' => $deliveryCharge,   // Delivery charge
                    'platformCharge' => $platformCharge,   // Platform Charge
                    'grandTotal'     => $grandTotal,
                ],
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    // cart summary
    public function getCartSummary()
    {
        try {
            $userId = Auth::id();

            // Fetch only required columns and optimize with SUM() and COUNT()
            $cartSummary = Cart::where('user_id', $userId)
                ->where('status', '0')
                ->selectRaw('SUM(quantity) as totalQuantity, SUM(quantity * price) as totalAmount')
                ->first();

            if (! $cartSummary->totalQuantity) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Your cart is empty',
                ], 404);
            }

            return response()->json([
                'status'  => true,
                'message' => 'Cart summary retrieved successfully!',
                'data'    => $cartSummary,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    public function removeService($serviceId)
    {
        try {
            $userId = Auth::id();

            $cartItem = Cart::where('user_id', $userId)
                ->where('service_id', $serviceId)
                ->where('status', 0)
                ->firstOrFail();

            // Delete the associated service record
            Service::where('id', $serviceId)->delete();

            // Delete the cart item
            $cartItem->delete();

            // Broadcast WebSocket event
            $this->broadcastCartUpdate($userId);

            return response()->json([
                'status'  => true,
                'message' => 'Service removed from cart successfully!',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Service not found in cart',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // Broadcast WebSocket event safely
    private function broadcastCartUpdate($userId)
    {
        try {
            $cartSummary = Cart::where('user_id', $userId)
                ->selectRaw('SUM(quantity) as totalQuantity, SUM(quantity * price) as totalAmount')
                ->first();

            broadcast(new CartUpdated($userId, $cartSummary))->toOthers();
        } catch (\Throwable $e) {
            Log::error('WebSocket broadcast failed: '.$e->getMessage());
        }
    }
}
