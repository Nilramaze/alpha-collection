<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingOption extends Model
{
    protected $fillable = [
        'name', 'price', 'image_url',
        'min_order_value', 'max_order_value',
        'active', 'sort_order',
    ];

    protected $casts = [
        'price'           => 'decimal:2',
        'min_order_value' => 'decimal:2',
        'max_order_value' => 'decimal:2',
        'active'          => 'boolean',
    ];

    public function scopeAvailableFor(mixed $query, float $cartTotal): mixed
    {
        return $query->where('active', true)
            ->where('min_order_value', '<=', $cartTotal)
            ->where(function ($q) use ($cartTotal) {
                $q->whereNull('max_order_value')
                  ->orWhere('max_order_value', '>=', $cartTotal);
            })
            ->orderBy('sort_order')
            ->orderBy('price');
    }
}
