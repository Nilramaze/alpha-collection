<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SkontoGroup extends Model
{
    protected $fillable = ['name'];

    public function tiers(): HasMany
    {
        return $this->hasMany(SkontoTier::class)->orderBy('min_order_value', 'asc');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function getApplicableTier(float $orderTotal): ?SkontoTier
    {
        return $this->tiers()
            ->where('min_order_value', '<=', $orderTotal)
            ->orderBy('min_order_value', 'desc')
            ->first();
    }
}
