<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ServiceInformation extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'service_information';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'sub_category_id',
        'service_type',
        'base_price',
        'discounted_price',
        'service_extra_image',
        'service_options',
        'type_options',
        'size_options',
        'location_options',
        'time_slots',
        'additional_options',
        'estimated_duration',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'service_options'    => 'array',
        'type_options'       => 'array',
        'size_options'       => 'array',
        'location_options'   => 'array',
        'time_slots'         => 'array',
        'additional_options' => 'array',
        'is_active'          => 'boolean',
        'base_price'         => 'decimal:2',
        'discounted_price'   => 'decimal:2',
    ];

    /* -------------------------------- Relationships ------------------------------- */

    /**
     * Get the sub-category that owns this service information
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class, 'sub_category_id');
    }

    /**
     * Get the shop that provides this service through the sub-category
     * (ServiceInformation -> SubCategory -> Category -> Shop)
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOneThrough
     */
    public function shop()
    {
        return $this->hasOneThrough(
            Shop::class,
            SubCategory::class,
            'id', // Foreign key on sub_categories table
            'id', // Foreign key on shops table
            'sub_category_id', // Local key on service_information table
            'shop_id' // Local key on categories table (through sub_category)
        )->through('category');
    }

    /**
     * Get the category through the sub-category relationship
     * (Convenience method for accessing category directly)
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOneThrough
     */
    public function category()
    {
        return $this->hasOneThrough(
            Category::class,
            SubCategory::class,
            'id', // Foreign key on sub_categories table
            'id', // Foreign key on categories table
            'sub_category_id', // Local key on service_information table
            'category_id' // Local key on sub_categories table
        );
    }

    /* --------------------------------- Accessors --------------------------------- */

    /**
     * Get the effective price (discounted if available, otherwise base price)
     *
     * @return float
     */
    public function getCurrentPriceAttribute()
    {
        return $this->discounted_price ?? $this->base_price;
    }

    /**
     * Get all formatted service options based on service type
     *
     * @return array
     */
    public function getFormattedOptionsAttribute()
    {
        $options = [
            'time_slots'      => $this->time_slots       ?? [],
            'location_prices' => $this->location_options ?? [],
        ];

        // Add service-type specific options
        return array_merge($options, $this->getServiceTypeSpecificOptions());
    }

    /* ------------------------------ Business Logic ------------------------------ */

    /**
     * Get service-type specific pricing options
     *
     * @return array
     */
    protected function getServiceTypeSpecificOptions()
    {
        switch ($this->service_type) {
            case 'AC':
                return [
                    'service_prices' => $this->service_options ?? [],
                    'ac_type_prices' => $this->type_options    ?? [],
                    'ac_ton_prices'  => $this->size_options    ?? [],
                ];

            case 'Beauty':
                return ['service_prices' => $this->service_options ?? []];

            case 'Car':
                return ['service_prices' => $this->service_options ?? []];

            case 'HomeAppliance':
                return [
                    'service_prices'   => $this->service_options ?? [],
                    'appliance_prices' => $this->type_options    ?? [],
                    'size_prices'      => $this->size_options    ?? [],
                ];

            case 'MensSalon':
                return [
                    'service_prices'     => $this->service_options                    ?? [],
                    'hair_length_prices' => $this->additional_options['hair_lengths'] ?? [],
                ];

            case 'MobileRepair':
                return [
                    'service_prices' => $this->service_options ?? [],
                    'device_prices'  => $this->type_options    ?? [],
                ];

            case 'PrintStore':
                return [
                    'color_prices' => $this->additional_options['color_options'] ?? [],
                    'paper_sizes'  => $this->additional_options['paper_sizes']   ?? [],
                    'print_sides'  => $this->additional_options['print_sides']   ?? [],
                    'orientations' => $this->additional_options['orientations']  ?? [],
                ];

            case 'TVRepair':
                return [
                    'service_prices' => $this->service_options ?? [],
                    'size_prices'    => $this->size_options    ?? [],
                ];

            default:
                return [];
        }
    }

    /**
     * Check if the service is currently discounted
     *
     * @return bool
     */
    public function hasDiscount()
    {
        return ! is_null($this->discounted_price) && $this->discounted_price < $this->base_price;
    }

    /**
     * Calculate discount percentage (rounded to nearest integer)
     *
     * @return int|null
     */
    public function discountPercentage()
    {
        if (! $this->hasDiscount()) {
            return null;
        }

        return round(100 - (($this->discounted_price / $this->base_price) * 100));
    }

    /* ----------------------------- Option Accessors ----------------------------- */

    public function getServicePrice(string $serviceKey): ?float
    {
        return $this->service_options[$serviceKey] ?? null;
    }

    public function getTypePrice(string $typeKey): ?float
    {
        return $this->type_options[$typeKey] ?? null;
    }

    public function getSizePrice(string $sizeKey): ?float
    {
        return $this->size_options[$sizeKey] ?? null;
    }

    public function getLocationPrice(string $locationKey): ?float
    {
        return $this->location_options[$locationKey] ?? null;
    }

    public function getAdditionalOption(string $optionKey)
    {
        return $this->additional_options[$optionKey] ?? null;
    }
}
