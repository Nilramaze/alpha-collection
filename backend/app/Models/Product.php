<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'is_active',
        'image_url',
        'sku',
        'model_number',
        'size',
        'height',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'product_category');
    }

    public function colors(): HasMany
    {
        return $this->hasMany(ProductColor::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInStock($query)
    {
        return $query->where(function ($q) {
            $q->whereHas('colors', fn($sub) => $sub->where('stock_quantity', '>', 0))
              ->orWhere(function ($sub) {
                  $sub->doesntHave('colors')
                      ->where('stock_quantity', '>', 0);
              });
        });
    }
}
