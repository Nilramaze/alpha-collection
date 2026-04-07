<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SkontoTier extends Model
{
    protected $fillable = [
        'skonto_group_id',
        'min_order_value',
        'discount_percent',
    ];

    protected function casts(): array
    {
        return [
            'min_order_value' => 'decimal:2',
            'discount_percent' => 'decimal:2',
        ];
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(SkontoGroup::class, 'skonto_group_id');
    }
}
