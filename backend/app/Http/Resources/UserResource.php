<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'is_active' => (bool) $this->is_active,
            'skonto_group' => $this->whenLoaded('skontoGroup', function () {
                return [
                    'id' => $this->skontoGroup->id,
                    'name' => $this->skontoGroup->name,
                    'tiers' => $this->skontoGroup->tiers->map(fn ($t) => [
                        'min_order_value' => (float) $t->min_order_value,
                        'discount_percent' => (float) $t->discount_percent,
                    ]),
                ];
            }),
            'delivery_company'         => $this->delivery_company,
            'delivery_street'          => $this->delivery_street,
            'delivery_zip'             => $this->delivery_zip,
            'delivery_city'            => $this->delivery_city,
            'delivery_country'         => $this->delivery_country ?? 'Deutschland',
            'billing_same_as_delivery' => (bool) ($this->billing_same_as_delivery ?? true),
            'billing_company'          => $this->billing_company,
            'billing_street'           => $this->billing_street,
            'billing_zip'              => $this->billing_zip,
            'billing_city'             => $this->billing_city,
            'billing_country'          => $this->billing_country,
            'created_at'               => $this->created_at?->toISOString(),
        ];
    }
}
