<?php

namespace App\Models;

use App\Models\ProductColor;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = ['cart_id', 'product_id', 'product_color_id', 'quantity'];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'product_color_id' => 'integer',
        ];
    }

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function color(): BelongsTo
    {
        return $this->belongsTo(ProductColor::class, 'product_color_id');
    }

    public function getSubtotalAttribute(): float
    {
        return $this->product->price * $this->quantity;
    }
}
