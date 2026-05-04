<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingOption extends Model
{
    protected $fillable = [
        'name', 'price', 'image_url',
        'min_order_qty', 'max_order_qty',
        'active', 'sort_order',
    ];

    protected $casts = [
        'price'         => 'decimal:2',
        'min_order_qty' => 'integer',
        'max_order_qty' => 'integer',
        'active'        => 'boolean',
    ];

    public function scopeAvailableFor(mixed $query, int $cartQty): mixed
    {
        return $query->where('active', true)
            ->where('min_order_qty', '<=', $cartQty)
            ->where(function ($q) use ($cartQty) {
                $q->whereNull('max_order_qty')
                  ->orWhere('max_order_qty', '>=', $cartQty);
            })
            ->orderBy('sort_order')
            ->orderBy('price');
    }
}
